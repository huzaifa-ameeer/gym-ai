import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongo";
import { User } from "@/lib/models/user";
import { hashPassword } from "@/lib/auth/password";
import { readRegistration } from "@/lib/auth/validation";

function isDuplicateKey(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send a valid JSON body." },
      { status: 400 },
    );
  }

  const { input, errors } = readRegistration(body);

  if (!input) {
    return NextResponse.json(
      { error: "Check the form and try again.", fields: errors },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();

    await User.create({
      name: input.name,
      email: input.email,
      role: input.role,
      passwordHash: await hashPassword(input.password),
    });
  } catch (error) {
    if (isDuplicateKey(error)) {
      return NextResponse.json(
        {
          error: "An account with that email already exists.",
          fields: { email: "This email is already registered." },
        },
        { status: 409 },
      );
    }

    console.error("Registration failed:", error);

    return NextResponse.json(
      { error: "Could not create your account. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
