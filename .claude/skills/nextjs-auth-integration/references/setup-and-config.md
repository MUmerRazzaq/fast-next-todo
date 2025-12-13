# Setup and Configuration for better-auth in Next.js

This guide covers the initial setup for the core `better-auth` library in a Next.js application.

## 1. Installation

You need the core `better-auth` library and the Next.js adapter.

```bash
pnpm add better-auth better-auth/next-js
```

## 2. Core Configuration

Create a file at `lib/auth.ts` to configure your `betterAuth` instance. This is where you enable authentication methods (e.g., email & password), add plugins, and connect to a database adapter.

**Example `lib/auth.ts`:**

This example configures email/password authentication with a simple in-memory store for demonstration purposes. For production, you would use a persistent database adapter (e.g., `@better-auth/drizzle-adapter`).

```typescript
import { betterAuth } from "better-auth";
import { memoryStore } from "better-auth/memory-store";
import { emailAndPassword } from "better-auth/email-and-password";

export const auth = betterAuth({
  adapter: memoryStore(),
  plugins: [
    emailAndPassword({
      // Configuration for email and password auth
    }),
  ],
});
```

## 3. API Route Handler

`better-auth` handles all authentication-related API requests (like sign-in, sign-up, sign-out) through a single catch-all API route.

Create a file at `app/api/auth/[...all]/route.ts`.

**`app/api/auth/[...all]/route.ts`:**

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

This file uses the `toNextJsHandler` adapter to connect your `auth` instance to Next.js API routes, automatically creating endpoints like `/api/auth/sign-in`, `/api/auth/sign-up`, etc.
