# Step 5: Advanced Feature - Two-Factor Authentication (2FA)

This guide explains how to add Two-Factor Authentication (2FA) to your application using the `twoFactor` plugin from `better-auth`. 2FA adds an extra layer of security by requiring users to provide a second form of verification in addition to their password.

## Configuration

2FA is enabled by adding the `twoFactor` plugin to your `lib/auth.ts` file.

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
// ... other imports

export const auth = betterAuth({
  // ... other options (appName, secret, database)

  plugins: [
    twoFactor({
      // --- Optional Settings ---

      // You can set a custom issuer name that will appear in authenticator apps.
      // Defaults to the `appName`.
      issuer: "Your App Name",

      // The plugin has its own rate limiting to prevent brute-force attacks.
      // You can customize it if needed.
      rateLimit: {
        window: 60, // 1 minute
        max: 5,     // 5 attempts per minute
      },
    }),
    // ... other plugins
  ],

  // ...
});
```

You also need to add the `twoFactorClient` to your client-side `authClient` instance to handle the 2FA flows in the UI.

```javascript
// Example: lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      // This global callback can handle the redirection to the 2FA verification page.
      onTwoFactorRedirect() {
        // Example: Redirect to a page where the user can enter their 2FA code.
        window.location.href = "/verify-2fa";
      },
    }),
    // ... other client plugins
  ],
});
```

## Usage Flow

### 1. Enabling 2FA

A user must first enable 2FA in their account settings.

-   Your application makes a `POST` request to `/api/auth/two-factor/enable` with the user's current password for verification.
-   `better-auth` responds with a `totpURI` and a set of `backupCodes`.
-   Your UI should display the `totpURI` as a QR code for the user to scan with an authenticator app (like Google Authenticator or Authy).
-   Your UI must also show the `backupCodes` to the user and instruct them to save these codes in a safe place.

### 2. Signing In with 2FA

When a user with 2FA enabled signs in with their email and password:
-   The API response will include a `twoFactorRedirect: true` flag.
-   The `onTwoFactorRedirect` callback in your `authClient` will be triggered, redirecting the user to your 2FA verification page (e.g., `/verify-2fa`).
-   On this page, the user enters the 6-digit code from their authenticator app.
-   Your application then makes a `POST` request to `/api/auth/two-factor/verify-otp` with the code.
-   If the code is valid, `better-auth` creates the user's session and they are fully signed in.

### 3. Using a Backup Code

If a user loses access to their authenticator app, they can use one of the backup codes.
-   On your 2FA verification page, you should have an option to "Use a backup code".
-   The user enters a backup code.
-   Your application makes a `POST` request to `/api/auth/two-factor/verify-backup-code` with the code.
-   If valid, the user is signed in. Each backup code can only be used once.

### 4. Disabling 2FA

A user can disable 2FA from their account settings.
-   This requires a `POST` request to `/api/auth/two-factor/disable` with the user's current password for confirmation.
