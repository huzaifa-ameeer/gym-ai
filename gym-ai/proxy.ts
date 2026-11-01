import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/redirect";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

const PROTECTED_PAGES = ["/start-session"];
const PROTECTED_APIS = ["/api/generate-plan"];
const AUTH_PAGES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const { pathname, search } = request.nextUrl;

  if (session) {
    if (AUTH_PAGES.includes(pathname)) {
      const target = safeNext(
        request.nextUrl.searchParams.get("next"),
        "/start-session",
      );

      return NextResponse.redirect(new URL(target, request.url));
    }

    return NextResponse.next();
  }

  if (PROTECTED_APIS.some((route) => pathname.startsWith(route))) {
    return NextResponse.json(
      { error: "Sign in to generate a plan." },
      { status: 401 },
    );
  }

  if (!PROTECTED_PAGES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/start-session/:path*",
    "/api/generate-plan/:path*",
    "/login",
    "/register",
  ],
};
