import type { Plan, PlanSession } from "@/lib/plan";

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-ink">
      {children}
    </span>
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent"
    />
  );
}

function SessionCard({ session }: { session: PlanSession }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {session.day}
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight sm:text-lg">
            {session.focus}
          </h3>
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-ink">
          {session.durationMinutes} min
        </span>
      </div>

      {session.warmup.length ? (
        <div className="mt-4 rounded-xl bg-background p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Warm-up
          </p>
          <ul className="mt-1.5 space-y-1 text-sm leading-5 text-muted">
            {session.warmup.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`} className="flex gap-2">
                <Dot />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        {session.exercises.map((exercise, exerciseIndex) => (
          <div
            key={`${exercise.name}-${exerciseIndex}`}
            className="flex flex-col gap-2 border-b border-line px-3 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {exercise.name}
              </p>
              {exercise.notes ? (
                <p className="mt-0.5 text-xs leading-5 text-muted">
                  {exercise.notes}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                {exercise.sets} x {exercise.reps}
              </span>
              <span className="rounded-md bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                {exercise.load}
              </span>
              <span className="rounded-md bg-background px-2 py-0.5 text-xs font-medium text-muted">
                {exercise.rest}
              </span>
            </div>
          </div>
        ))}
      </div>

      {session.cooldown.length ? (
        <div className="mt-4 rounded-xl bg-background p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Cooldown
          </p>
          <ul className="mt-1.5 space-y-1 text-sm leading-5 text-muted">
            {session.cooldown.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`} className="flex gap-2">
                <Dot />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export function PlanView({ plan }: { plan: Plan }) {
  return (
    <article className="text-foreground">
      <header className="border-b border-line pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-ink">
          GymAI training plan
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {plan.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          {plan.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Meta>{plan.weeks === 1 ? "1 week plan" : `${plan.weeks} week block`}</Meta>
          <Meta>{plan.daysPerWeek} days per week</Meta>
          <Meta>
            {plan.roadmap[0]?.days[0]?.durationMinutes ?? 60} min sessions
          </Meta>
        </div>
      </header>

      <div className="mt-6 space-y-8">
        {plan.roadmap.map((week) => (
          <section key={week.week}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2">
              <h2 className="text-lg font-semibold tracking-tight">
                Week {week.week}
              </h2>
              <p className="text-sm text-muted">{week.theme}</p>
            </div>
            <div className="mt-4 space-y-4">
              {week.days.map((session, index) => (
                <SessionCard
                  key={`${session.day}-${index}`}
                  session={session}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {plan.notes.length ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-foreground">
            Safety and recovery
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-muted">
            {plan.notes.map((note, index) => (
              <li key={`${note}-${index}`} className="flex gap-2">
                <Dot />
                {note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <footer className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Generated by GymAI. Progress at a pace you can recover from.
      </footer>
    </article>
  );
}
