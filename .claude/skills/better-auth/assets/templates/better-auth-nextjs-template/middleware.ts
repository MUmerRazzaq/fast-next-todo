// skills/better-auth/assets/templates/better-auth-nextjs-template/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  const { pathname } = request.nextUrl;

  if (session && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const protectedRoutes = ["/dashboard", "/account"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!session && isProtectedRoute) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
