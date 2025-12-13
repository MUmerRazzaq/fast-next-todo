import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    // This is an example of protecting the /dashboard route.
    // You can customize the matcher config below to protect other routes.
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if(!session) {
        // Customize the redirect URL if your sign-in page is at a different path.
        return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    return NextResponse.next();
}

// IMPORTANT: This middleware should be configured to run on the routes you want to protect.
// Do NOT apply it to the /api/auth routes or your sign-in page.
export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};
