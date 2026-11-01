export const GOALS = [
  { value: "muscle", label: "Build muscle" },
  { value: "strength", label: "Get stronger" },
  { value: "fat-loss", label: "Lose fat" },
  { value: "fitness", label: "General fitness" },
  { value: "endurance", label: "Endurance" },
] as const;

export const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export const EQUIPMENT = [
  { value: "commercial-gym", label: "Commercial gym" },
  { value: "home-gym", label: "Dumbbells at home" },
  { value: "barbell", label: "Barbell and rack" },
  { value: "bodyweight", label: "Bodyweight only" },
] as const;

export const SESSION_MINUTES = [30, 45, 60, 75, 90] as const;

export type Goal = (typeof GOALS)[number]["value"];
export type Level = (typeof LEVELS)[number]["value"];
export type Equipment = (typeof EQUIPMENT)[number]["value"];

export type PlanRequest = {
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  sessionMinutes: number;
  equipment: Equipment;
  age: number;
  bodyweight: string;
  units: "kg" | "lb";
  notes: string;
};

export type PlanExercise = {
  name: string;
  sets: number;
  reps: string;
  load: string;
  rest: string;
  notes: string;
};

export type PlanSession = {
  day: string;
  focus: string;
  durationMinutes: number;
  warmup: string[];
  exercises: PlanExercise[];
  cooldown: string[];
};

export type PlanWeek = {
  week: number;
  theme: string;
  days: PlanSession[];
};

export type Plan = {
  title: string;
  summary: string;
  weeks: number;
  daysPerWeek: number;
  roadmap: PlanWeek[];
  notes: string[];
};

export function isGoal(value: unknown): value is Goal {
  return GOALS.some((goal) => goal.value === value);
}

export function isLevel(value: unknown): value is Level {
  return LEVELS.some((level) => level.value === value);
}

export function isEquipment(value: unknown): value is Equipment {
  return EQUIPMENT.some((equipment) => equipment.value === value);
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function integer(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function toSession(value: unknown, index: number): PlanSession {
  const source = record(value);
  const exercises = (Array.isArray(source.exercises) ? source.exercises : [])
    .slice(0, 12)
    .map((exercise) => {
      const item = record(exercise);
      return {
        name: text(item.name, "Exercise"),
        sets: integer(item.sets, 3, 1, 12),
        reps: text(item.reps, "8-12"),
        load: text(item.load, "Bodyweight"),
        rest: text(item.rest, "90 sec"),
        notes: text(item.notes),
      };
    })
    .filter((exercise) => exercise.name !== "Exercise");

  return {
    day: text(source.day, `Day ${index + 1}`),
    focus: text(source.focus, "Full body"),
    durationMinutes: integer(source.durationMinutes, 60, 15, 180),
    warmup: stringList(source.warmup),
    exercises,
    cooldown: stringList(source.cooldown),
  };
}

export function normalizePlan(value: unknown): Plan {
  const root = record(value);

  const roadmap = (Array.isArray(root.roadmap) ? root.roadmap : [])
    .slice(0, 16)
    .map((entry, weekIndex) => {
      const item = record(entry);
      const days = (Array.isArray(item.days) ? item.days : [])
        .slice(0, 7)
        .map(toSession)
        .filter((day) => day.exercises.length > 0);

      return {
        week: integer(item.week, weekIndex + 1, 1, 16),
        theme: text(item.theme, "Build and progress"),
        days,
      };
    })
    .filter((week) => week.days.length > 0);

  if (roadmap.length === 0) {
    throw new Error("The generated plan did not contain any sessions.");
  }

  return {
    title: text(root.title, "Your training plan"),
    summary: text(
      root.summary,
      "A weekly plan built around your goal and schedule.",
    ),
    weeks: integer(root.weeks, roadmap.length, 1, 16),
    daysPerWeek: integer(root.daysPerWeek, roadmap[0].days.length, 1, 7),
    roadmap,
    notes: stringList(root.notes),
  };
}
