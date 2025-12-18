# Step 6: UI Component Integration

`better-auth` has an official React component library, `@daveyplate/better-auth-ui`, which provides pre-built components for common authentication UI patterns. It is built with `shadcn/ui` and is highly customizable.

## Installation

First, install the library:
```bash
npm install @daveyplate/better-auth-ui
```

You also need to make sure your Tailwind CSS configuration can find the styles from the library.

**`tailwind.config.ts`:**
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // ... your other content paths
    "./node_modules/@daveyplate/better-auth-ui/dist/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ...
};
export default config;
```

And import the CSS in your global stylesheet:

**`styles/globals.css`:**
```css
@import "@daveyplate/better-auth-ui/css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Setting up the `AuthUIProvider`

The library's components rely on a set of React contexts provided by `AuthUIProvider`. You must wrap your application with this provider. A good place to do this is in a top-level `Providers` component.

**`components/providers.tsx`:**
```tsx
"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { authClient } from "@/lib/auth-client"; // Your client-side auth instance
import { useRouter } from "next/navigation";
import Link from "next/link";
// ... other providers

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
    >
      {/* ... other providers like QueryClientProvider, ThemeProvider, etc. */}
      {children}
    </AuthUIProvider>
  );
}
```

This provider needs a few key props:
-   `authClient`: Your configured `better-auth` client instance.
-   `navigate`, `replace`: Functions from your router (e.g., `next/navigation`) to handle navigation.
-   `onSessionChange`: A callback that is triggered when the user's session changes (e.g., sign-in or sign-out). Calling `router.refresh()` is a good practice to re-fetch server-side data.
-   `Link`: The `Link` component from your framework (e.g., `next/link`) to ensure proper client-side navigation.

## Key Components

Here are some of the most useful components provided by the library.

### `<UserButton />`

This component displays the user's avatar if they are signed in. When clicked, it opens a dropdown menu with links to account settings and a sign-out button. If the user is not signed in, it displays a "Sign In" button.

**Usage:**
```tsx
import { UserButton } from "@daveyplate/better-auth-ui";

export function Header() {
  return (
    <header>
      {/* ... other header content */}
      <UserButton />
    </header>
  );
}
```

### `<SignedIn>` and `<SignedOut>`

These components are used to conditionally render content based on the user's authentication state.

**Usage:**
```tsx
import { SignedIn, SignedOut } from "@daveyplate/better-auth-ui";

export function MyComponent() {
  return (
    <div>
      <SignedIn>
        <p>Welcome, you are signed in!</p>
      </SignedIn>
      <SignedOut>
        <p>Please sign in to continue.</p>
      </SignedOut>
    </div>
  );
}
```

### `<AccountView />`

This is a powerful component that renders a complete account management interface. It handles different views like settings, security, and more, based on a `path` prop. It's designed to be used with a dynamic route in Next.js.

**Example Page (`app/account/[...path]/page.tsx`):**
```tsx
import { AccountView } from "@daveyplate/better-auth-ui";
import { accountViewPaths } from "@daveyplate/better-auth-ui/server";

export function generateStaticParams() {
    return Object.values(accountViewPaths).map((path) => ({ path: [path] }));
}

export default function AccountPage({ params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    return (
        <main>
            <AccountView path={path} />
        </main>
    );
}
```
This single page can render different account management UIs, like `/account/settings`, `/account/security`, etc.

The library provides many other components for building sign-in forms, sign-up forms, and more. It is highly recommended to explore its documentation for more advanced usage.
