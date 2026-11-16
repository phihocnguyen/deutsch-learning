import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(request => {
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const isAuthEndpoint = pathname.startsWith("/api/auth/");

  if (isLogin || isAuthEndpoint) return NextResponse.next();
  if (!request.auth) {
    const login = new URL("/login", request.url);
    if (pathname !== "/") login.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
