/**
 * Better Auth client-side utilities.
 *
 * This module provides client-side authentication functions
 * using Better Auth's client integration.
 */

import { createAuthClient } from "better-auth/client";

/**
 * Auth client instance for client-side authentication.
 */
export const authClient = createAuthClient();

/**
 * Sign in methods.
 */
export const signIn = authClient.signIn;

/**
 * Sign out function.
 */
export const signOut = authClient.signOut;

/**
 * Sign up methods.
 */
export const signUp = authClient.signUp;
