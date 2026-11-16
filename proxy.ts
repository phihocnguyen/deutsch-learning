import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const isAuthEndpoint = pathname.startsWith("/api/auth/");

  if (isLogin || isAuthEndpoint) return NextResponse.next();
  // Fast optimistic gate only. Auth.js and each data API remain the session authority.
  const hasSessionCookie = request.cookies.getAll().some(cookie =>
    cookie.name === "authjs.session-token" || cookie.name.startsWith("authjs.session-token.") ||
    cookie.name === "__Secure-authjs.session-token" || cookie.name.startsWith("__Secure-authjs.session-token.")
  );
  if (!hasSessionCookie) {
    const login = new URL("/login", request.url);
    if (pathname !== "/") login.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
