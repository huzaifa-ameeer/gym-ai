"use client";

import { useRef, useState, type FormEvent } from "react";
import { buttonClass } from "@/components/button";
import { controlClass, Field } from "@/components/form";
import { PasswordField } from "@/components/password-field";
import { useToast } from "@/components/toast";
import type { FieldErrors } from "@/lib/auth/validation";

export function LoginForm({ next }: { next: string }) {
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  function clearCredentials() {
    setEmail("");
    setPassword("");
    formRef.current?.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        fields?: FieldErrors;
        user?: { name?: string };
      } | null;

      if (!response.ok) {
        setErrors(data?.fields ?? {});
        throw new Error(data?.error ?? "Could not sign you in.");
      }

      clearCredentials();

      const firstName = data?.user?.name?.trim().split(/\s+/)[0];

      toast({
        variant: "success",
        title: "Signed in",
        description: firstName
          ? `Welcome back, ${firstName}.`
          : "Welcome back.",
      });

      window.location.assign(next);
    } catch (error) {
      toast({
        variant: "error",
        title: "Sign in failed",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 space-y-4"
    >
      <Field label="Email" htmlFor="email" error={errors.email}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`${controlClass} mt-1.5`}
        />
      </Field>

      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        placeholder="Your password"
        error={errors.password}
      />

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={`${buttonClass({ full: true, size: "lg" })} disabled:cursor-wait disabled:opacity-70`}
      >
        {pending ? "Signing in" : "Log in"}
      </button>
    </form>
  );
}
