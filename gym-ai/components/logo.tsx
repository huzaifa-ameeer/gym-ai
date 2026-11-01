export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm shadow-accent/20">
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
        >
          <path d="M6.5 9v6M17.5 9v6M3.5 10.5v3M20.5 10.5v3M6.5 12h11" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        Gym<span className="text-accent-ink">AI</span>
      </span>
    </span>
  );
}
