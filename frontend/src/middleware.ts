import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers
    });
    const { pathname } = request.nextUrl;

    // Redirect authenticated users away from auth pages
    if (session && (pathname === "/auth/sign-in" || pathname === "/auth/sign-up")) {
      return NextResponse.redirect(new URL("/tasks", request.url));
    }

    // Define protected routes
    const protectedRoutes = ["/tasks", "/tags", "/settings"];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Redirect unauthenticated users to signin
    if (!session && isProtectedRoute) {
      const signinUrl = new URL("/auth/sign-in", request.url);
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
