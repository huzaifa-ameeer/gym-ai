import { isRole, type Role } from "./roles";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors = Partial<
  Record<"name" | "email" | "password" | "role", string>
>;

export type RegistrationInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type LoginInput = {
  email: string;
  password: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function readRegistration(body: unknown) {
  const data = asRecord(body);
  const name = text(data.name);
  const email = text(data.email).toLowerCase();
  const password = typeof data.password === "string" ? data.password : "";
  const role = data.role;
  const errors: FieldErrors = {};

  if (name.length < 2 || name.length > 60) {
    errors.name = "Enter your name, 2 to 60 characters.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  if (!isRole(role)) {
    errors.role = "Pick the option that fits you.";
  }

  if (Object.keys(errors).length > 0) {
    return { input: null, errors };
  }

  const input: RegistrationInput = {
    name,
    email,
    password,
    role: isRole(role) ? role : "other",
  };

  return { input, errors };
}

export function readLogin(body: unknown) {
  const data = asRecord(body);
  const email = text(data.email).toLowerCase();
  const password = typeof data.password === "string" ? data.password : "";
  const errors: FieldErrors = {};

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Enter your password.";
  }

  if (Object.keys(errors).length > 0) {
    return { input: null, errors };
  }

  const input: LoginInput = { email, password };

  return { input, errors };
}
