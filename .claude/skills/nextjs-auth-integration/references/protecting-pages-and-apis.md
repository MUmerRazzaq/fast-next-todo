# Protecting Pages and APIs with better-auth

Once `better-auth` is configured, you can protect your Next.js pages and API routes using middleware and server-side checks.

## 1. Protecting Pages with Middleware

The most common way to protect pages is with Next.js middleware. This checks for a valid session on the server before the page is rendered.

Create a file at the root of your project named `middleware.ts`.

**`middleware.ts` (for Next.js 15.2.0+):**

This example uses the `nodejs` runtime to perform a full, database-backed session validation.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if(!session) {
        // Redirect unauthenticated users to the sign-in page
        return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    return NextResponse.next();
}

// Apply the middleware to specific routes
export const config = {
  runtime: "nodejs",
  matcher: [
    "/dashboard/:path*", // Protect all routes under /dashboard
    "/settings"
  ]
};
```

## 2. Protecting Content within Server Components

You can also check for a session directly within a Server Component. This is useful for conditionally rendering content on a page that might be partially public.

**Example `app/dashboard/page.tsx`:**

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if(!session) {
        // This is a secondary check in case middleware is bypassed or not configured
        redirect("/auth/sign-in");
    }

    return (
        <div>
            <h1>Welcome, {session.user.email}!</h1>
            {/* Your protected dashboard content */}
        </div>
    );
}
```

## 3. Protecting Server Actions

Similarly, you must verify the session within any Server Action that performs a protected operation.

```typescript
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateProfile(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // ... proceed with the action
}
```
