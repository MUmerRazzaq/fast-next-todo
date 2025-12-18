# Feature: Password Reset

This guide explains how to implement a "forgot password" or "password reset" flow for users who authenticate with an email and password.

This is a critical feature for user account management and is a multi-step process involving both backend configuration and frontend pages.

## Prerequisites

This feature requires an email sending service to be configured to deliver the password reset link to the user.

-   **For detailed instructions, see: [11-integration-email-service.md](./11-integration-email-service.md)**

## How It Works

1.  A user visits a "Forgot Password" page in your application and enters their email address.
2.  Your frontend calls the `better-auth` client, which triggers a backend API endpoint (`/request-password-reset`).
3.  Your `better-auth` backend configuration calls your integrated email service to send a special, single-use link to the user.
4.  The user clicks the link in the email and is taken to a "Reset Password" page in your application. The URL will contain a unique, secure `token`.
5.  On this page, the user enters and confirms their new password.
6.  Your frontend calls the `better-auth` client with the new password and the token from the URL. The backend validates the token and updates the user's password.

## Step 1: Backend Configuration

In your main `better-auth` configuration file (e.g., `src/lib/auth.ts`), you need to add the `sendResetPassword` function to your `emailAndPassword` provider.

This function is responsible for calling the email service you have configured.

```typescript
// src/lib/auth.ts (or your auth config file)

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db"; // Your Prisma client instance
import { sendEmail } from "./email"; // Your email sending utility

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Add this function to handle sending the reset email
    sendResetPassword: async ({ user, url, token }) => {
      // It's recommended not to `await` this call to prevent timing attacks
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        // In a real app, you would use a beautiful HTML template here
        text: `Click the link to reset your password: ${url}`,
      });
    },
    // You can also add a hook that runs after a password is reset
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  // ... other providers and configurations
});
```

## Step 2: Frontend "Forgot Password" Page

Create a new page where users can request a password reset. For example, `app/forgot-password/page.tsx`.

This page will contain a simple form that asks for the user's email.

```tsx
// app/forgot-password/page.tsx

"use client";

import { authClient } from "@/lib/auth-client"; // Your better-auth client
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    const { error } = await authClient.requestPasswordReset({ email });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("If an account with that email exists, a password reset link has been sent.");
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
```

## Step 3: Frontend "Reset Password" Page

Create the page the user will land on after clicking the link in their email. The URL for this page must be what you configure as the `redirectTo` path. For example, `app/reset-password/page.tsx`.

This page needs to read the `token` from the URL's query parameters.

```tsx
// app/reset-password/page.tsx

"use client";

import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");

        if (!token) {
            setMessage("Error: No reset token found in URL.");
            return;
        }

        const { error } = await authClient.resetPassword({
            token,
            newPassword: password,
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Your password has been reset successfully! You can now sign in.");
        }
    };

    if (!token) {
        return <p>Invalid or missing password reset token.</p>;
    }

    return (
        <div>
            <h1>Reset Your Password</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="password">New Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

// The page must be wrapped in a Suspense boundary because useSearchParams()
// requires it during static rendering.
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
```

With these pieces in place, your application now has a complete and secure password reset flow.
