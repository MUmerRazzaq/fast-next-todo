# Step 1: Installation & Core Setup

This guide covers the initial installation of `better-auth` and the creation of the core configuration file.

## Installation

You need several packages to get started with `better-auth` in a Next.js project.

1.  **Core Library**: The main `better-auth` package.
2.  **Next.js Adapter**: The specific package for Next.js integration.
3.  **UI Components**: The official React components for the UI.
4.  **Database Client**: The client library for your database (e.g., `pg` for PostgreSQL).

Run the following command to install the necessary `better-auth` packages:

```bash
npm install better-auth better-auth/next-js @daveyplate/better-auth-ui
```

You will also need to install the client for your database. For example, if you are using PostgreSQL:

```bash
npm install pg
# And the types if you are using TypeScript
npm install -D @types/pg
```

## Core Configuration

The heart of your `better-auth` setup is the configuration file, which should be created at `lib/auth.ts`. This file exports an `auth` object that will be used throughout your application.

Here is the basic structure of this file:

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";

// Import your database adapter
// Example for Drizzle with PostgreSQL
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema"; // Assuming your Drizzle schema is here

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

export const auth = betterAuth({
  // App Info
  appName: "Your App Name",
  secret: process.env.AUTH_SECRET, // A 32+ character secret
  baseURL: process.env.AUTH_BASE_URL, // e.g., http://localhost:3000

  // Database Adapter
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  // Add authentication methods and other plugins here
  // We will cover this in the next steps.
  // For example:
  // emailAndPassword: { enabled: true },
  // socialProviders: { ... }
});

// Export the session type for use in your application
export type Session = typeof auth.$Infer.Session;
```

### Key Configuration Options:

-   `appName`: The name of your application.
-   `secret`: A long, random string used to sign tokens. It should be stored in an environment variable (`AUTH_SECRET`).
-   `baseURL`: The base URL of your application. This is used for generating callback URLs. It should be stored in an environment variable (`AUTH_BASE_URL`).
-   `database`: This is where you configure your database adapter. The example above uses the Drizzle ORM adapter for PostgreSQL. See the [Database Adapters](./03-database-adapters.md) guide for more options.

After creating this file, you are ready to integrate `better-auth` with Next.js.
