# Next.js App Router: Protected Routes with Middleware

This document explains how to protect routes in a Next.js application using middleware. Middleware allows you to run code before a request is completed, making it the perfect place to implement authentication and authorization.

## Middleware

Middleware is a function that is exported from a `middleware.ts` (or `.js`) file in the root of your project (or in `src/` if you use that).

### How it Works

1.  A user requests a page.
2.  The middleware function runs before any rendering happens on the server.
3.  Based on the request (e.g., checking for a session cookie), the middleware can:
    -   Allow the request to continue by calling `NextResponse.next()`.
    -   Redirect the user to another page (e.g., a login page) using `NextResponse.redirect()`.
    -   Rewrite the response to show a different page without changing the URL.

### Example: Authentication Middleware

This middleware checks if a user is authenticated. If they are not, and they are trying to access a protected route (like `/dashboard`), it redirects them to the `/login` page.

**`middleware.ts`:**
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value

  // If no session, and trying to access a protected route, redirect to login
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If there is a session, and trying to access login page, redirect to dashboard
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}
```

## Matcher

Instead of using `if` statements inside the middleware to decide which routes it applies to, you can use the `matcher` config. This is more efficient as the middleware will only run on the specified paths.

### `matcher` Config

The `matcher` allows you to filter middleware to run on specific paths. You can provide a single path or an array of paths. It also supports regex.

**Example `middleware.ts` with `matcher`:**
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value

  // Redirect to login if there is no session
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Continue if there is a session
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/dashboard/:path*',
}
```
In this example, the middleware will *only* run for requests to `/dashboard` and any of its sub-paths.

### `matcher` with Negative Lookaheads

You can also use a `matcher` to exclude certain paths, for example, to avoid running middleware on static assets (`_next/static`) or image optimization files (`_next/image`).

```ts
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

This is a common pattern to apply middleware to most of the app while excluding static assets and API routes.
