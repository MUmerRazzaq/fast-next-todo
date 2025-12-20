"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const authClient = createAuthClient();

/**
 * Hook to access the current session.
 * Must be used within the Providers tree.
 */
export const useSession = authClient.useSession;

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
      account={{
        viewPaths: {
          SETTINGS: "/account/settings",
        },
      }}
      localizeErrors={false}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="fast-next-todo-theme">
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthUIProvider>
  );
}
