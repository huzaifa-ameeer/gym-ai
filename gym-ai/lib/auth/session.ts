import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "gymai_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
};

function secret() {
  const value = process.env.AUTH_SECRET?.trim();

  if (!value) {
    throw new Error(
      "AUTH_SECRET is not set. Add it to .env.local and restart the server.",
    );
  }

  return new TextEncoder().encode(value);
}

export function createSessionToken({ userId, email, name }: SessionPayload) {
  return new SignJWT({ email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  const key = secret();

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    if (!payload.sub) return null;

    return {
      userId: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : "",
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
