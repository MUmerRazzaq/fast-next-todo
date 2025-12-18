# Step 2: Next.js Integration

After setting up the core configuration, you need to integrate `better-auth` into your Next.js application. This involves two key parts: the API route handler and the middleware.

## API Route Handler

`better-auth` handles all authentication-related API requests (like sign-in, sign-up, and session management) through a single catch-all API route.

Create a file at `app/api/auth/[...all]/route.ts`.

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// This is required for database adapters that use Node.js-specific clients (e.g., pg)
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
```

This code uses the `toNextJsHandler` from `better-auth/next-js` to automatically create all the necessary API endpoints, such as:
- `/api/auth/sign-in/email`
- `/api/auth/sign-in/google`
- `/api/auth/sign-up/email`
- `/api/auth/session`
- and many more, depending on your configuration.

## Middleware for Route Protection

Middleware is used to protect pages and API routes, ensuring that only authenticated users can access them.

Create a `middleware.ts` file in your `src` or root directory.

Here is the recommended way to implement the middleware using `better-auth`'s helpers:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  // Get the session by calling the auth.api.getSession method.
  // This securely validates the session against the database.
  const session = await auth.api.getSession({
    headers: headers(),
  });

  const { pathname } = request.nextUrl;

  // --- Handle redirects for authenticated users ---
  // If a user is already signed in, redirect them away from sign-in/sign-up pages.
  if (session && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // --- Handle route protection for unauthenticated users ---
  // Define your protected routes here.
  const protectedRoutes = ["/dashboard", "/settings"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!session && isProtectedRoute) {
    // If the user is not authenticated and trying to access a protected route,
    // redirect them to the sign-in page.
    const signinUrl = new URL("/signin", request.url);
    // Pass the original URL as a callbackUrl so they are redirected back after signing in.
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // If none of the above conditions are met, continue to the requested page.
  return NextResponse.next();
}

// The matcher configures which paths the middleware will run on.
export const config = {
  runtime: "nodejs", // Use 'nodejs' runtime if your DB adapter needs it
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes, to avoid running middleware on auth routes themselves)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
```

This middleware implementation is more robust and secure than manually checking for cookies, as it relies on the `better-auth` library to handle session validation.
