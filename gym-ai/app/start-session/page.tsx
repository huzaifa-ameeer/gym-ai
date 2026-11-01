import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { StartSessionForm } from "./start-session-form";

export const metadata: Metadata = {
  title: "Start session | GymAI",
  description:
    "Tell GymAI about your goal, schedule, and equipment, then get a complete training plan you can download.",
};

export default function StartSessionPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              New session
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Tell us how you train.
            </h1>
            <p className="mt-3 text-base leading-7 text-muted">
              A few details are enough for GymAI to build a full weekly plan
              with warm-ups, loads, and progression.
            </p>
          </div>

          <StartSessionForm />
        </div>
      </main>
    </>
  );
}
