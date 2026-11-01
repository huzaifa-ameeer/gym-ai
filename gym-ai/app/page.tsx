import { buttonClass } from "@/components/button";
import {
  ActivityIcon,
  ArrowRightIcon,
  CalculatorIcon,
  ChartIcon,
  MonitorIcon,
  SparkleIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";
import { Navbar } from "@/components/navbar";

const session = [
  { name: "Bench press", detail: "4 sets x 6 reps", load: "82.5 kg" },
  { name: "Barbell row", detail: "4 sets x 8 reps", load: "65 kg" },
  { name: "Overhead press", detail: "3 sets x 10 reps", load: "40 kg" },
  { name: "Lat pulldown", detail: "3 sets x 12 reps", load: "55 kg" },
];

const steps = [
  {
    title: "Set your goal",
    body: "Pick a target: build muscle, get lean, or lift heavier. Add your schedule and the equipment you have.",
  },
  {
    title: "Get your program",
    body: "GymAI writes a weekly plan with exercises, sets, reps, and loads matched to your level.",
  },
  {
    title: "Train and adapt",
    body: "Log each set. Next week's plan shifts based on what you actually completed.",
  },
];

const features = [
  {
    icon: ActivityIcon,
    title: "Plans that move with you",
    body: "Miss a session or crush a set and the program recalculates before your next workout.",
  },
  {
    icon: ChartIcon,
    title: "Every set recorded",
    body: "Reps, load, and rest time live in one history you can scan in seconds.",
  },
  {
    icon: CalculatorIcon,
    title: "Plate math handled",
    body: "See exactly what to load per side so you spend less time counting and more time lifting.",
  },
  {
    icon: MonitorIcon,
    title: "Train on any screen",
    body: "Your program and history follow you from the gym floor to your desk.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        <section id="home" className="relative">
          <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  AI training, built around you
                </span>

                <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.03]">
                  Your next PR starts with a plan that{" "}
                  <span className="text-accent-ink">thinks</span>.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                  GymAI builds your weekly program, adjusts it after every
                  session, and tells you exactly what to lift next.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href="/login" className={buttonClass({ size: "lg" })}>
                    Start training
                    <ArrowRightIcon className="h-4 w-4" />
                  </a>
                  <a
                    href="#how-it-works"
                    className={buttonClass({ variant: "secondary", size: "lg" })}
                  >
                    See how it works
                  </a>
                </div>

                <p className="mt-5 text-sm text-muted">
                  No card required. Your first program is ready in minutes.
                </p>
              </div>

              <div className="relative">
                <div className="rounded-3xl border border-line bg-surface p-5 shadow-2xl shadow-black/5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                        Today&apos;s session
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                        Upper body, strength
                      </h2>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-ink">
                      <SparkleIcon className="h-3.5 w-3.5" />
                      Adjusted
                    </span>
                  </div>

                  <ul className="mt-4 divide-y divide-line">
                    {session.map((exercise) => (
                      <li
                        key={exercise.name}
                        className="flex items-center justify-between gap-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {exercise.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {exercise.detail}
                          </p>
                        </div>
                        <span className="rounded-lg bg-background px-2.5 py-1 text-sm font-semibold tabular-nums text-foreground">
                          {exercise.load}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/login"
                    className={`${buttonClass({ full: true })} mt-5`}
                  >
                    Start session
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="flex min-h-[calc(100svh-4rem)] items-center"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent-ink">
                  How it works
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Three steps. Then you lift.
                </h2>
                <p className="mt-4 max-w-md text-base leading-7 text-muted">
                  No spreadsheets and no guesswork. Tell GymAI what you want,
                  then follow the plan.
                </p>
              </div>

              <ol className="grid gap-8">
                {steps.map((step, index) => (
                  <li key={step.title} className="relative border-l border-line pl-7">
                    <span className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-background text-xs font-semibold text-accent-ink">
                      {index + 1}
                    </span>
                    <h3 className="text-base font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 max-w-lg text-sm leading-6 text-muted">
                      {step.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="flex min-h-[calc(100svh-4rem)] items-center border-y border-line bg-surface/60"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent-ink">
                Features
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Built for the work between sets.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted">
                The details that keep a program honest: what you lifted, what
                changed, and what comes next.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="bg-background p-6 sm:p-8">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-line bg-surface p-8 sm:p-10 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Train with a plan that keeps up.
                </h2>
                <p className="mt-2 max-w-xl text-base leading-7 text-muted">
                  Set your goal tonight and walk into the gym with your first
                  session ready.
                </p>
              </div>
              <a
                href="/login"
                className={`${buttonClass({ size: "lg" })} shrink-0`}
              >
                Start training
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <a href="#home" aria-label="GymAI home" className="rounded-lg">
            <Logo />
          </a>
          <p className="text-sm text-muted">
            &copy; 2026 GymAI. Built for steady progress.
          </p>
        </div>
      </footer>
    </>
  );
}
