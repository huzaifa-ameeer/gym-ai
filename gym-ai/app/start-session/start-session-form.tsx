"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { buttonClass } from "@/components/button";
import { controlClass, Field } from "@/components/form";
import {
  CheckIcon,
  ChevronDownIcon,
  DownloadIcon,
  SparkleIcon,
} from "@/components/icons";
import { useToast } from "@/components/toast";
import {
  EQUIPMENT,
  GOALS,
  LEVELS,
  SESSION_MINUTES,
  type Equipment,
  type Goal,
  type Level,
  type Plan,
} from "@/lib/plan";
import { PlanView } from "./plan-view";

type FormState = {
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  sessionMinutes: number;
  equipment: Equipment;
  age: string;
  bodyweight: string;
  units: "kg" | "lb";
  notes: string;
};

type FieldErrors = Partial<Record<"age" | "bodyweight", string>>;

const initialForm: FormState = {
  goal: "muscle",
  level: "intermediate",
  daysPerWeek: 3,
  sessionMinutes: 60,
  equipment: "commercial-gym",
  age: "",
  bodyweight: "",
  units: "kg",
  notes: "",
};

const DAYS = [2, 3, 4, 5, 6] as const;

const LOADING_STEPS = [
  "Reading your goal, schedule, and equipment.",
  "Choosing the split and weekly volume.",
  "Setting exercises, reps, and loads.",
  "Writing warm-ups, cooldowns, and progression notes.",
];

function PlanLoader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStep((value) => (value + 1) % LOADING_STEPS.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-10 rounded-3xl border border-line bg-surface p-6 sm:p-8"
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="h-11 w-11 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent"
        />
        <div>
          <p className="text-base font-semibold text-foreground">
            Building your plan
          </p>
          <p className="mt-1 text-sm text-muted">{LOADING_STEPS[step]}</p>
        </div>
      </div>

      <div aria-hidden className="mt-8 space-y-6">
        <div className="space-y-3">
          <div className="h-5 w-2/5 animate-pulse rounded-full bg-accent-soft" />
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-line" />
          <div className="h-3 w-3/5 animate-pulse rounded-full bg-line" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="rounded-2xl border border-line p-4">
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-accent-soft" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded-full bg-line" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-line" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-line" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-xs text-muted">
        Keep this tab open. A full plan usually takes 20 to 60 seconds.
      </p>
    </div>
  );
}

export function StartSessionForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [exporting, setExporting] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const nextErrors: FieldErrors = {};
    const age = Number(form.age);

    if (!form.age.trim() || !Number.isFinite(age) || age < 13 || age > 90) {
      nextErrors.age = "Enter an age between 13 and 90.";
    }

    const bodyweight = form.bodyweight.trim();
    if (bodyweight) {
      const weight = Number(bodyweight);
      if (!Number.isFinite(weight) || weight <= 0 || weight > 500) {
        nextErrors.bodyweight = "Enter a valid bodyweight or leave it blank.";
      }
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      toast({
        variant: "error",
        title: "Check your details",
        description: "Fix the highlighted fields, then try again.",
      });
      document.getElementById(firstError)?.focus();
      return;
    }

    setStatus("loading");
    toast({
      variant: "info",
      title: "Generating your plan",
      description: "Building every week. This usually takes 20 to 60 seconds.",
    });

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: form.goal,
          level: form.level,
          daysPerWeek: form.daysPerWeek,
          sessionMinutes: form.sessionMinutes,
          equipment: form.equipment,
          age: Number(form.age),
          bodyweight: form.bodyweight.trim(),
          units: form.units,
          notes: form.notes.trim(),
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        plan?: Plan;
        error?: string;
      } | null;

      if (!response.ok || !data?.plan) {
        throw new Error(data?.error ?? "The plan could not be generated.");
      }

      setPlan(data.plan);
      setStatus("idle");
      toast({
        variant: "success",
        title: "Your plan is ready",
        description: "Review the sessions below or download the PDF.",
      });
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      setStatus("idle");
      toast({
        variant: "error",
        title: "Could not generate your plan",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    }
  }

  async function handleDownload() {
    const node = planRef.current;
    if (!node || !plan) return;

    setExporting(true);
    try {
      const { downloadPlanPdf } = await import("@/lib/pdf");
      await downloadPlanPdf(node, plan.title);
      toast({
        variant: "success",
        title: "PDF saved",
        description: "Your training plan was downloaded.",
      });
    } catch {
      toast({
        variant: "error",
        title: "Download failed",
        description: "Try again, or use your browser's print option.",
      });
    } finally {
      setExporting(false);
    }
  }

  if (status === "loading") {
    return <PlanLoader />;
  }

  if (plan) {
    return (
      <div ref={resultsRef} className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent-ink">
              Your plan
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Ready to train
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPlan(null)}
              className={buttonClass({ variant: "secondary" })}
            >
              Edit details
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting}
              aria-busy={exporting}
              className={`${buttonClass()} disabled:cursor-wait disabled:opacity-70`}
            >
              <DownloadIcon className="h-4 w-4" />
              {exporting ? "Preparing PDF" : "Download PDF"}
            </button>
          </div>
        </div>

        <div
          ref={planRef}
          className="mt-6 rounded-3xl border border-line bg-background p-5 sm:p-8"
        >
          <PlanView plan={plan} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-6">
      <fieldset className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <legend className="px-1 text-sm font-semibold text-foreground">
          Your goal
        </legend>
        <p className="mt-1 text-sm text-muted">
          Pick the outcome that matters most right now.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {GOALS.map((option) => {
            const selected = form.goal === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                  selected
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-line bg-background text-muted hover:border-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="goal"
                  value={option.value}
                  checked={selected}
                  onChange={() => update("goal", option.value)}
                  className="sr-only"
                />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-line"
                  }`}
                >
                  {selected ? <CheckIcon className="h-3 w-3" /> : null}
                </span>
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <legend className="px-1 text-sm font-semibold text-foreground">
          Experience and schedule
        </legend>
        <p className="mt-1 text-sm text-muted">
          Be honest about where you are. The plan meets you there.
        </p>

        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <p className="text-sm font-medium text-foreground">Experience</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {LEVELS.map((option) => {
                const selected = form.level === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-xl border px-3.5 py-3 text-center text-sm font-medium transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                      selected
                        ? "border-accent bg-accent-soft text-foreground"
                        : "border-line bg-background text-muted hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={option.value}
                      checked={selected}
                      onChange={() => update("level", option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-foreground">
              Training days per week
            </p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {DAYS.map((day) => {
                const selected = form.daysPerWeek === day;
                return (
                  <label
                    key={day}
                    className={`cursor-pointer rounded-xl border py-2.5 text-center text-sm font-semibold transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                      selected
                        ? "border-accent bg-accent-soft text-foreground"
                        : "border-line bg-background text-muted hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="daysPerWeek"
                      value={day}
                      checked={selected}
                      onChange={() => update("daysPerWeek", day)}
                      className="sr-only"
                    />
                    {day}
                  </label>
                );
              })}
            </div>
          </div>

          <Field label="Session length" htmlFor="sessionMinutes">
            <div className="relative mt-1.5">
              <select
                id="sessionMinutes"
                value={form.sessionMinutes}
                onChange={(event) =>
                  update("sessionMinutes", Number(event.target.value))
                }
                className={`${controlClass} appearance-none pr-10`}
              >
                {SESSION_MINUTES.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <legend className="px-1 text-sm font-semibold text-foreground">
          Equipment
        </legend>
        <p className="mt-1 text-sm text-muted">
          The plan only uses what you can actually reach.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {EQUIPMENT.map((option) => {
            const selected = form.equipment === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                  selected
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-line bg-background text-muted hover:border-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="equipment"
                  value={option.value}
                  checked={selected}
                  onChange={() => update("equipment", option.value)}
                  className="sr-only"
                />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-line"
                  }`}
                >
                  {selected ? <CheckIcon className="h-3 w-3" /> : null}
                </span>
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <legend className="px-1 text-sm font-semibold text-foreground">
          About you
        </legend>
        <p className="mt-1 text-sm text-muted">
          This shapes loads, volume, and recovery.
        </p>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field
            label="Age"
            htmlFor="age"
            error={errors.age}
            hint="Used to set safe training volume."
          >
            <input
              id="age"
              type="number"
              inputMode="numeric"
              min={13}
              max={90}
              value={form.age}
              onChange={(event) => update("age", event.target.value)}
              placeholder="28"
              aria-invalid={Boolean(errors.age)}
              aria-describedby={errors.age ? "age-error" : undefined}
              className={`${controlClass} mt-1.5`}
            />
          </Field>

          <Field
            label="Bodyweight (optional)"
            htmlFor="bodyweight"
            error={errors.bodyweight}
            hint="Helps calculate relative strength."
          >
            <div className="mt-1.5 flex gap-2">
              <input
                id="bodyweight"
                type="number"
                inputMode="decimal"
                min={1}
                max={500}
                step="0.1"
                value={form.bodyweight}
                onChange={(event) =>
                  update("bodyweight", event.target.value)
                }
                placeholder="78"
                aria-invalid={Boolean(errors.bodyweight)}
                aria-describedby={
                  errors.bodyweight ? "bodyweight-error" : undefined
                }
                className={`${controlClass} flex-1`}
              />
              <div className="flex shrink-0 rounded-xl border border-line bg-background p-1">
                {(["kg", "lb"] as const).map((unit) => (
                  <label
                    key={unit}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold uppercase transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                      form.units === unit
                        ? "bg-accent text-white"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="units"
                      value={unit}
                      checked={form.units === unit}
                      onChange={() => update("units", unit)}
                      className="sr-only"
                    />
                    {unit}
                  </label>
                ))}
              </div>
            </div>
          </Field>

          <div className="sm:col-span-2">
            <label
              htmlFor="notes"
              className="text-sm font-medium text-foreground"
            >
              Injuries, limitations, or preferences (optional)
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
              rows={4}
              maxLength={800}
              placeholder="Left knee hurts on deep squats. I prefer free weights and can train early mornings."
              className={`${controlClass} mt-1.5 h-auto min-h-28 resize-y py-3 leading-6`}
            />
            <p className="mt-1.5 text-xs text-muted">
              The coach avoids movements that conflict with what you list here.
            </p>
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-5 text-muted">
          Your plan is generated on demand. Review it with a qualified coach if
          you are returning from an injury.
        </p>
        <button type="submit" className={buttonClass({ size: "lg" })}>
          <SparkleIcon className="h-4 w-4" />
          Generate my plan
        </button>
      </div>
    </form>
  );
}
