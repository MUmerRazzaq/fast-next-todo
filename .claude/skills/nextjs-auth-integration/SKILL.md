---
name: nextjs-auth-integration
description: Provides a guide and reusable assets for integrating the `better-auth` framework into Next.js applications. Covers core setup, UI components with `@daveyplate/better-auth-ui`, page protection with middleware, and form handling. Use this skill to implement a secure and modern authentication flow in a Next.js app.
---

# `better-auth` Integration for Next.js

This skill provides a complete workflow and reusable assets for integrating the `better-auth` authentication framework into a Next.js application, using `@daveyplate/better-auth-ui` for UI components.

## Implementation Workflow

Follow these steps to add `better-auth` to a Next.js project.

### Step 1: Core `better-auth` Setup

The first step is to configure the core `better-auth` library and expose its API endpoints. This involves installing packages, creating a configuration file, and setting up a catch-all API route.

**For detailed instructions, see: [references/setup-and-config.md](./references/setup-and-config.md)**

This reference guide covers:
- Installing `better-auth` and `better-auth/next-js`.
- Creating the main configuration file at `lib/auth.ts`.
- Setting up the API route handler at `app/api/auth/[...all]/route.ts`.

### Step 2: Protect Pages and APIs

With the core library configured, the next step is to protect pages and API routes from unauthenticated access. This is primarily done using Next.js middleware.

**For detailed instructions, see: [references/protecting-pages-and-apis.md](./references/protecting-pages-and-apis.md)**

This reference guide covers:
- Creating a `middleware.ts` file to protect routes.
- Checking for sessions within Server Components and Server Actions for fine-grained control.

### Step 3: Integrate UI Components

The `@daveyplate/better-auth-ui` library provides helper components for building the frontend. This step involves setting up the UI provider and using components like `<SignedIn>`, `<SignedOut>`, and `<UserButton>`.

**For detailed instructions, see: [references/ui-components.md](./references/ui-components.md)**

This reference guide covers:
- Installing `@daveyplate/better-auth-ui`.
- Wrapping your application in the `AuthUIProvider`.
- Using `<SignedIn>`, `<SignedOut>`, and `<UserButton>` to build a responsive UI.

### Step 4: Create Sign-In and Sign-Up Pages

The `better-auth-ui` library does not provide pre-built sign-in/sign-up forms. You need to create these pages yourself. The forms should submit to the API endpoints created by `better-auth` in Step 1 (e.g., `/api/auth/sign-in/email`).

This skill provides basic templates for these pages that you can customize.

## Using The Bundled Assets

This skill includes a set of template files in the `assets/templates/better-auth-nextjs/` directory to accelerate development.

### How to Use

1.  Copy the files from `assets/templates/better-auth-nextjs/` into your Next.js project, maintaining the directory structure.
2.  Install the required dependencies: `better-auth`, `better-auth/next-js`, and `@daveyplate/better-auth-ui`.
3.  Add the `<Providers>` component to your root layout (see `references/ui-components.md`).
4.  Add the `<Navbar>` component to your root layout to see the authentication state in action.
5.  Customize the sign-in and sign-up forms in `app/auth/` with your preferred UI components (e.g., from `shadcn/ui`).
6.  Update the `middleware.ts` matcher to protect the routes specific to your application.
