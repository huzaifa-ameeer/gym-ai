export function safeNext(value: unknown, fallback = "/") {
  if (typeof value !== "string") return fallback;

  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  return value;
}

export function loginPath(next: string) {
  return next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;
}

export function registerPath(next: string) {
  return next === "/" ? "/register" : `/register?next=${encodeURIComponent(next)}`;
}
