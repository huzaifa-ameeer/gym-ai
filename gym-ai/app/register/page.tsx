import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { loginPath, safeNext } from "@/lib/auth/redirect";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account | GymAI",
  description: "Create a GymAI account to build and keep your training plans.",
};

export const instant = false;

type AuthSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: AuthSearchParams;
}) {
  const params = await searchParams;
  const next = safeNext(first(params.next), "/start-session");

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-md px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-ink">
              Get started
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              One account keeps your plans together.
            </p>

            <RegisterForm next={next} />

            <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
              Already registered?{" "}
              <Link
                href={loginPath(next)}
                className="font-semibold text-accent-ink hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
