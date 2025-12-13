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
