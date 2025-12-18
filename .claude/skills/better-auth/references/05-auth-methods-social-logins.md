# Step 4b: Authentication Method - Social Logins

This guide explains how to add social login providers (like Google and GitHub) to your `better-auth` implementation.

## Configuration

Social logins are configured via the `socialProviders` property in your `lib/auth.ts` file. You will need to obtain a Client ID and Client Secret for each provider you want to support from their respective developer consoles.

**It is critical to store your Client Secrets in environment variables and never commit them to your repository.**

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
// ... other imports

export const auth = betterAuth({
  // ... other options (appName, secret, database)

  socialProviders: {
    // --- Google OAuth Configuration ---
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // The redirect URI must match what you've configured in the Google Cloud Console.
      // It typically follows this pattern:
      redirectURI: "http://localhost:3000/api/auth/callback/google",
    },

    // --- GitHub OAuth Configuration ---
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      redirectURI: "http://localhost:3000/api/auth/callback/github",
    },

    // Add other providers here...
  },

  // ...
});
```

### Getting Credentials:

-   **Google**: Create a project in the [Google Cloud Console](https://console.cloud.google.com/), enable the "Google People API", and create OAuth 2.0 credentials.
-   **GitHub**: Create a new OAuth App in your GitHub developer settings.

For each provider, you will need to configure the authorized redirect URIs. For local development, this is typically `http://localhost:3000/api/auth/callback/[provider]`.

## Usage on the Client

Once configured, initiating a social login flow from the client-side is straightforward. You would typically have a "Sign in with Google" button that, when clicked, initiates the process.

### Client-Side Flow

The recommended way to handle this is with the official UI library, but the underlying API call is simple. Your client-side code would trigger a `POST` request to `/api/auth/sign-in/social` with the provider's name.

```javascript
// Example of a button's onClick handler
async function handleGoogleSignIn() {
  // This will redirect the user to Google's authentication page.
  window.location.href = "/api/auth/sign-in/social?provider=google";
}
```

However, a better way is to use the client library which might handle this more gracefully. For example, with `@daveyplate/better-auth-ui`'s `authClient`:

```javascript
import { authClient } from "@/lib/auth-client"; // Assuming you have this file

async function handleGoogleSignIn() {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard", // Where to redirect after successful sign-in
  });
}
```

`better-auth` will handle the entire OAuth 2.0 flow:
1.  Redirecting the user to the provider's login page.
2.  Handling the callback from the provider after the user authenticates.
3.  Creating a new user in your database if they don't exist.
4.  Creating a session for the user.
5.  Redirecting the user back to your application.
