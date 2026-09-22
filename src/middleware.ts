import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "fixit_session";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isProtectedRoute = pathname.startsWith("/dashboard");

  if (isProtectedRoute && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
