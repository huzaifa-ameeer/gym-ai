"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonClass } from "@/components/button";
import { controlClass, Field } from "@/components/form";
import { PasswordField } from "@/components/password-field";
import { CheckIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { ROLES, type Role } from "@/lib/auth/roles";
import type { FieldErrors } from "@/lib/auth/validation";

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        fields?: FieldErrors;
      } | null;

      if (!response.ok) {
        setErrors(data?.fields ?? {});
        throw new Error(data?.error ?? "Could not create your account.");
      }

      setName("");
      setEmail("");
      setPassword("");
      formRef.current?.reset();

      toast({
        variant: "success",
        title: "Account created",
        description: "Log in with your new account to continue.",
      });

      router.replace(
        `/login?next=${encodeURIComponent(next)}&registered=1`,
      );
    } catch (error) {
      toast({
        variant: "error",
        title: "Registration failed",
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
      <Field label="Name" htmlFor="name" error={errors.name}>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`${controlClass} mt-1.5`}
        />
      </Field>

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
        autoComplete="new-password"
        placeholder="Choose a password"
        error={errors.password}
        hint="At least 8 characters."
      />

      <div>
        <p className="text-sm font-medium text-foreground">What best describes you</p>
        <div className="mt-2 space-y-2">
          {ROLES.map((option) => {
            const selected = role === option.value;
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
                  name="role"
                  value={option.value}
                  checked={selected}
                  onChange={() => setRole(option.value)}
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
        {errors.role ? (
          <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            {errors.role}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={`${buttonClass({ full: true, size: "lg" })} disabled:cursor-wait disabled:opacity-70`}
      >
        {pending ? "Creating account" : "Create account"}
      </button>
    </form>
  );
}
