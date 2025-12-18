# Integration: Email Service

Several `better-auth` features, such as password resets, magic links, and email verification, require sending emails to your users.

`better-auth` is designed to be "provider-agnostic," meaning it does not include a built-in email sending library. Instead, it provides configuration hooks where you must supply your own function for sending emails. This gives you the flexibility to use any email service you prefer.

This guide will walk you through setting up a transactional email service and integrating it with `better-auth`. We will use **Resend** as our example because it has a simple, modern API and a generous free tier for developers.

## Step 1: Get a Resend API Key

1.  Go to the [Resend website](https://resend.com/) and sign up for a free account.
2.  Navigate to the "API Keys" section in your dashboard and create a new API key.
3.  Copy the API key. You will need it for the next step.

## Step 2: Store Your API Key

It is critical to store your API key securely and never commit it to your git repository. Add the key to your local environment variables file, `.env.local`.

```bash
# .env.local

RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"
```

## Step 3: Install the Resend Package

Add the official Resend Node.js library to your project.

```bash
npm install resend
```

## Step 4: Create an Email Utility File

Create a new file at `src/lib/email.ts`. This file will contain a reusable `sendEmail` function that can be used throughout your `better-auth` configuration.

This function will initialize the Resend client with your API key and wrap its `emails.send` method.

```typescript
// src/lib/email.ts

import { Resend } from "resend";

// Ensure the RESEND_API_KEY is set in your environment variables
if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: SendEmailParams) => {
  // The 'from' address must be a verified domain on your Resend account.
  // For example, 'onboarding@resend.dev' is a default for development.
  // Replace with your own verified domain in production.
  const from = "onboarding@resend.dev";

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent successfully: ${result.id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};
```

**IMPORTANT**: The `from` address in the `send` call must be from a domain you have verified in your Resend account dashboard. During development, `onboarding@resend.dev` is available for testing.

## Step 5: Use the `sendEmail` Function

Now you can import and use your new `sendEmail` utility in your `better-auth` configuration.

Here is an example showing its use for both email verification and password resets.

```typescript
// src/lib/auth.ts (or your auth config file)

import { betterAuth } from "better-auth";
import { sendEmail } from "./email"; // <-- Import your new utility

export const auth = betterAuth({
  // ... other configurations

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
});
```

By creating a dedicated `sendEmail` utility, you have a single, centralized place for all email-sending logic, making your code cleaner and easier to maintain.
