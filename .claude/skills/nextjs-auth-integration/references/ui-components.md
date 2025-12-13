# Using better-auth-ui Components

The `@daveyplate/better-auth-ui` package provides a set of helpful React components to build your authentication UI quickly in a Next.js application.

## 1. Installation

Install the UI library along with its peer dependencies.

```bash
pnpm add @daveyplate/better-auth-ui
```

## 2. Auth UI Provider

The UI components need to be wrapped in an `AuthUIProvider`. This provider fetches the current session and makes it available to the components.

Create a file like `components/providers.tsx` and wrap your application's `children` with it.

**`components/providers.tsx`:**
```tsx
"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthUIProvider
      // The `authUrl` should point to the base of your better-auth API handler
      authUrl="/api/auth"
    >
      {children}
    </AuthUIProvider>
  );
}
```

Then, in your root `layout.tsx`, use this provider to wrap your application.

**`app/layout.tsx`:**
```tsx
import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## 3. UI Helper Components

`better-auth-ui` provides components to conditionally render content based on the user's authentication state.

### `<SignedIn>` and `<SignedOut>`

These components render their children only if the user is signed in or signed out, respectively.

**Example: A Navbar**
```tsx
import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import Link from "next/link";

export function Navbar() {
  return (
    <nav>
      <SignedIn>
        {/* Shows when the user is signed in */}
        <UserButton />
      </SignedIn>
      <SignedOut>
        {/* Shows when the user is signed out */}
        <Link href="/auth/sign-in">Sign In</Link>
      </SignedOut>
    </nav>
  );
}
```

### `<UserButton>`

A pre-styled component that displays the user's avatar. When clicked, it typically shows user information and a "Sign Out" button.

### `<RedirectToSignIn>` and `<RedirectToSignUp>`

These are client-side components that can be used to redirect a user if they are not authenticated. While server-side protection with middleware is recommended for pages, these can be useful for components that are rendered on the client.

```tsx
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";

export default function ClientProtectedComponent() {
  return (
    <>
      <SignedIn>
        <p>This content is only visible to signed-in users on the client.</p>
      </SignedIn>
      {/* Fallback for signed-out users */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
```
