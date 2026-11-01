export const ROLES = [
  { value: "student", label: "Student" },
  { value: "job-holder", label: "Job holder" },
  { value: "other", label: "Other" },
] as const;

export type Role = (typeof ROLES)[number]["value"];

export function isRole(value: unknown): value is Role {
  return ROLES.some((role) => role.value === value);
}
