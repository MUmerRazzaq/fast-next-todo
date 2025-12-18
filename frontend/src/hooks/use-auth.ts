"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useAuthenticate } from "@daveyplate/better-auth-ui";
import { authClient, signIn, signOut, signUp } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/api-client";

/**
 * User information from session.
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

/**
 * Auth state and actions hook.
 */
export interface UseAuthReturn {
  /** Current user if authenticated, null otherwise */
  user: User | null;
  /** Whether the session is being loaded */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Error if session fetch failed */
  error: Error | null;
  /** Sign in with email and password */
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  /** Sign up with email and password */
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string }>;
  /** Sign out and redirect to signin page */
  logout: () => Promise<void>;
  /** Refresh the session */
  refresh: () => Promise<void>;
}

/**
 * Hook for auth state and actions.
 *
 * Provides access to the current user, authentication status,
 * and methods for signing in, signing up, and signing out.
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user, isLoading, logout } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!user) return <div>Not authenticated</div>;
 *
 *   return (
 *     <div>
 *       <p>Hello, {user.name || user.email}!</p>
 *       <button onClick={logout}>Sign out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const { user: sessionUser, isPending, error, refetch } = useAuthenticate();

  const user = useMemo<User | null>(() => {
    if (!sessionUser) return null;
    return {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name ?? null,
      image: sessionUser.image ?? null,
    };
  }, [sessionUser]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await signIn.email({ email, password });
        if (result.error) {
          return { success: false, error: result.error.message };
        }
        await refetch();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Sign in failed",
        };
      }
    },
    [refetch]
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const result = await signUp.email({
          email,
          password,
          name: (name?.trim() || email.split("@")[0]) as string,
        });
        if (result.error) {
          return { success: false, error: result.error.message };
        }
        await refetch();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Sign up failed",
        };
      }
    },
    [refetch]
  );

  const logout = useCallback(async () => {
    clearAuthToken(); // Clear cached JWT token
    await signOut();
    router.push("/auth/sign-in");
    router.refresh();
  }, [router]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    user,
    isLoading: isPending,
    isAuthenticated: !!user,
    error: error ?? null,
    signInWithEmail,
    signUpWithEmail,
    logout,
    refresh,
  };
}

// Re-export for convenience
export { authClient };
