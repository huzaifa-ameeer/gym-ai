import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { registerPath, safeNext } from "@/lib/auth/redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in | GymAI",
  description: "Sign in to build and keep your GymAI training plans.",
};

export const instant = false;

type AuthSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: AuthSearchParams;
}) {
  const params = await searchParams;
  const next = safeNext(first(params.next), "/start-session");

  const registered = first(params.registered) === "1";

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-md px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-ink">
              Welcome back
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Log in to GymAI
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Sign in to continue where you left off.
            </p>

            {registered ? (
              <p className="mt-4 rounded-xl border border-line bg-background px-3.5 py-3 text-sm leading-6 text-muted">
                Account created. Log in with your email and password.
              </p>
            ) : null}

            <LoginForm next={next} />

            <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
              New here?{" "}
              <Link
                href={registerPath(next)}
                className="font-semibold text-accent-ink hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
