import { NextResponse } from "next/server";
import {
  isEquipment,
  isGoal,
  isLevel,
  normalizePlan,
  SESSION_MINUTES,
  type PlanRequest,
} from "@/lib/plan";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";

const FALLBACK_MODELS = (
  process.env.GEMINI_MODEL_FALLBACKS?.split(",") ?? [
    "gemini-3.5-flash",
    "gemini-3.8-flash",
  ]
)
  .map((model) => model.trim())
  .filter(Boolean);

const RETRYABLE_STATUS = new Set([404, 429, 502, 503]);

const sessionSchema = {
  type: "OBJECT",
  properties: {
    day: { type: "STRING" },
    focus: { type: "STRING" },
    durationMinutes: { type: "INTEGER" },
    warmup: { type: "ARRAY", items: { type: "STRING" } },
    exercises: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          sets: { type: "INTEGER" },
          reps: { type: "STRING" },
          load: { type: "STRING" },
          rest: { type: "STRING" },
          notes: { type: "STRING" },
        },
        required: ["name", "sets", "reps", "load", "rest", "notes"],
      },
    },
    cooldown: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "day",
    "focus",
    "durationMinutes",
    "warmup",
    "exercises",
    "cooldown",
  ],
};

const planSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    summary: { type: "STRING" },
    weeks: { type: "INTEGER" },
    daysPerWeek: { type: "INTEGER" },
    roadmap: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          week: { type: "INTEGER" },
          theme: { type: "STRING" },
          days: { type: "ARRAY", items: sessionSchema },
        },
        required: ["week", "theme", "days"],
      },
    },
    notes: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "title",
    "summary",
    "weeks",
    "daysPerWeek",
    "roadmap",
    "notes",
  ],
};

const equipmentLabels: Record<PlanRequest["equipment"], string> = {
  "commercial-gym": "a fully equipped commercial gym",
  "home-gym": "dumbbells and basic equipment at home",
  barbell: "a barbell, plates, and a rack",
  bodyweight: "bodyweight only, no equipment",
};

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function clampNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readRequest(value: unknown): PlanRequest {
  const data = record(value);
  const minutes = Number(data.sessionMinutes);

  return {
    goal: isGoal(data.goal) ? data.goal : "fitness",
    level: isLevel(data.level) ? data.level : "beginner",
    daysPerWeek: clampNumber(data.daysPerWeek, 3, 2, 6),
    sessionMinutes:
      SESSION_MINUTES.find((option) => option === minutes) ?? 60,
    equipment: isEquipment(data.equipment)
      ? data.equipment
      : "commercial-gym",
    age: clampNumber(data.age, 30, 13, 90),
    bodyweight: cleanText(data.bodyweight, 20),
    units: data.units === "lb" ? "lb" : "kg",
    notes: cleanText(data.notes, 800),
  };
}

function buildPrompt(input: PlanRequest) {
  return [
    "You are GymAI, a certified strength and conditioning coach.",
    "Build a safe, realistic training plan for the athlete below.",
    "",
    `Goal: ${input.goal}`,
    `Experience: ${input.level}`,
    `Training days per week: ${input.daysPerWeek}`,
    `Time per session: ${input.sessionMinutes} minutes`,
    `Equipment: ${equipmentLabels[input.equipment]}`,
    `Age: ${input.age}`,
    `Bodyweight: ${input.bodyweight ? `${input.bodyweight} ${input.units}` : "not provided"}`,
    `Notes and limitations: ${input.notes || "none"}`,
    "",
    "Requirements:",
    "- Build a single training week. Do not return a multi week block.",
    "- Set weeks to 1.",
    "- Return exactly one week entry, numbered 1, with a short theme.",
    `- It must contain exactly ${input.daysPerWeek} sessions, labelled Day 1 to Day ${input.daysPerWeek}.`,
    "- Each session needs its own warm-up, exercises, and cooldown.",
    "- Use the theme to say how to progress into the following week.",
    "- Use 4 to 7 exercises per session, with 3 to 5 warm-up items and 2 to 4 cooldown items.",
    "- Respect injuries and avoid contraindicated movements. Add a safety note when relevant.",
    "- Do not give medical advice.",
    "- Write concise, direct copy. No exclamation marks and no em dashes.",
    "- Return JSON only.",
  ].join("\n");
}

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not set. Add it to .env.local and restart the server.",
      },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send a valid JSON body." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Send a valid JSON body." },
      { status: 400 },
    );
  }

  const input = readRequest(body);

  const payload = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
    generationConfig: {
      temperature: 0.8,
      responseMimeType: "application/json",
      responseSchema: planSchema,
    },
  });

  let data: GeminiResponse | null = null;
  let failure: GeminiResponse | null = null;
  let failureStatus = 0;

  for (const model of new Set([MODEL, ...FALLBACK_MODELS])) {
    let response: Response;

    try {
      response = await fetch(
        `${GEMINI_URL}/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: payload,
          signal: AbortSignal.timeout(180_000),
        },
      );
    } catch {
      return NextResponse.json(
        { error: "The model did not respond in time. Try again." },
        { status: 504 },
      );
    }

    const parsed = (await response
      .json()
      .catch(() => null)) as GeminiResponse | null;

    if (response.ok) {
      data = parsed;
      break;
    }

    failure = parsed;
    failureStatus = response.status;

    if (!RETRYABLE_STATUS.has(response.status)) break;
  }

  if (!data) {
    const detail =
      failure?.error?.message ?? `Gemini returned ${failureStatus || 502}.`;
    return NextResponse.json(
      { error: `Could not build the plan. ${detail}` },
      { status: 502 },
    );
  }

  if (data.promptFeedback?.blockReason) {
    return NextResponse.json(
      {
        error:
          "The request was blocked. Adjust the notes and try a different description.",
      },
      { status: 422 },
    );
  }

  const raw =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? "";

  if (!raw) {
    return NextResponse.json(
      { error: "The model returned an empty response. Try again." },
      { status: 502 },
    );
  }

  try {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    const plan = normalizePlan(JSON.parse(cleaned));

    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json(
      { error: "The plan came back in an unexpected format. Try again." },
      { status: 502 },
    );
  }
}
