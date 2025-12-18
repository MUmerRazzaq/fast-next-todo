# Step 4c: Authentication Method - Magic Links

This guide covers how to implement passwordless authentication using magic links with `better-auth`. Magic links allow users to sign in by clicking a unique link sent to their email address, removing the need for a password.

## Prerequisites

This authentication method requires sending an email to the user. You must have an email sending service configured first.

-   **For a complete guide, see: [11-integration-email-service.md](./11-integration-email-service.md)**

## Configuration

Magic link authentication is enabled through the `magicLink` plugin. You need to add it to the `plugins` array in your `lib/auth.ts` file and provide a function to handle sending the email.

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
// You will need an email sending library, e.g., nodemailer, resend, etc.
// import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  // ... other options (appName, secret, database)

  plugins: [
    magicLink({
      // This function is required.
      // It tells better-auth how to send the magic link email.
      sendMagicLink: async ({ email, url, token }) => {
        // Your email sending logic here.
        // The `url` parameter contains the full, unique sign-in link.
        await sendEmail({
          to: email,
          subject: "Sign in to Your Account",
          body: `Click here to sign in: ${url}`,
        });
      },

      // --- Optional Settings ---

      // Time in seconds after which the magic link expires. Default is 5 minutes.
      expiresIn: 300,

      // If true, new users cannot sign up using a magic link.
      // disableSignUp: false,
    }),
    // ... other plugins
  ],

  // ...
});
```

### Key `magicLink` Plugin Options:

-   `sendMagicLink`: (Required) An async function that contains your logic for sending an email. It receives the user's `email`, the magic link `url`, and the raw `token`.
-   `expiresIn`: The lifetime of the magic link in seconds. Defaults to 300 (5 minutes).
-   `disableSignUp`: If `false` (the default), a new user who requests a magic link will be automatically signed up.

## Usage on the Client

The client-side flow involves a user entering their email address and your application triggering the `sendMagicLink` process.

### Requesting a Magic Link

Your UI would have an input field for an email address and a button. When the button is clicked, it should make a `POST` request to `/api/auth/sign-in/magic-link`.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  // You can specify a URL to redirect to after successful sign-in
  "callbackURL": "/dashboard"
}
```

If you are using the `@daveyplate/better-auth-ui` client, you can use the `magicLinkClient` plugin to make this easier:

```javascript
import { createAuthClient } from "better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

async function handleSendMagicLink(email) {
  const { error } = await authClient.magicLink.sendMagicLink({
    email: email,
    callbackURL: "/dashboard",
  });

  if (!error) {
    // Let the user know to check their email
  }
}
```

### Verification

Verification happens automatically. The user receives an email containing a unique URL like `/api/auth/magic-link/verify?token=...`. When they click this link, `better-auth`'s API handler verifies the token, creates a session for the user, and redirects them to the `callbackURL` you provided.
