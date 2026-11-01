import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongo";
import { User } from "@/lib/models/user";
import { verifyPassword } from "@/lib/auth/password";
import { readLogin } from "@/lib/auth/validation";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";

const REJECTED = "Email or password is incorrect.";

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

  const { input, errors } = readLogin(body);

  if (!input) {
    return NextResponse.json(
      { error: "Check the form and try again.", fields: errors },
      { status: 400 },
    );
  }

  let user;

  try {
    await connectToDatabase();

    user = await User.findOne({ email: input.email }).select("+passwordHash");
  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      { error: "Could not sign you in. Try again." },
      { status: 500 },
    );
  }

  if (!user) {
    return NextResponse.json({ error: REJECTED }, { status: 401 });
  }

  if (!(await verifyPassword(input.password, user.passwordHash))) {
    return NextResponse.json({ error: REJECTED }, { status: 401 });
  }

  const token = await createSessionToken({
    userId: String(user._id),
    email: user.email,
    name: user.name,
  });

  const response = NextResponse.json({
    ok: true,
    user: { name: user.name, email: user.email, role: user.role },
  });

  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

  return response;
}
