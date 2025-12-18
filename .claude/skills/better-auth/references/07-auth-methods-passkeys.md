# Step 4d: Authentication Method - Passkeys (WebAuthn)

This guide covers how to implement passkeys, a secure and passwordless authentication method based on the WebAuthn standard, using `better-auth`. Passkeys allow users to sign in using biometrics (like a fingerprint or face scan) or a physical security key.

## Installation

The passkey functionality is provided as a separate plugin. You need to install it first.

```bash
npm install @better-auth/passkey
```

## Configuration

Passkey authentication is enabled by adding the `passkey` plugin to your `lib/auth.ts` file.

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
// ... other imports

export const auth = betterAuth({
  // ... other options (appName, secret, database)

  plugins: [
    passkey(),
    // ... other plugins
  ],

  // ...
});
```

That's all that's needed for the server-side configuration. The plugin handles all the complex WebAuthn flows.

## Client-Side Configuration

You also need to add the `passkeyClient` to your client-side `authClient` instance.

```javascript
// Example: lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  plugins: [
    passkeyClient(),
    // ... other client plugins
  ],
});
```

## Usage on the Client

The passkey flow involves two main actions: registering a new passkey and signing in with an existing one.

### Registering a New Passkey

You would typically offer this option in a user's account security settings. To initiate registration, you call the `register` method on the `authClient`.

```javascript
// Example in a React component
import { authClient } from "@/lib/auth-client";

async function handleRegisterPasskey() {
  const { error } = await authClient.passkey.register({
    // A user-friendly name for the passkey, e.g., "My Laptop"
    name: "My Laptop",
  });

  if (error) {
    // Handle error (e.g., user cancelled the browser prompt)
  } else {
    // Passkey registered successfully
  }
}
```
This will trigger the browser's native passkey creation UI.

### Signing In with a Passkey

To sign in, you call the `signIn` method. `better-auth` supports Conditional UI (also known as browser autofill), which is a modern and user-friendly way to prompt for passkeys.

```javascript
// Example in a Sign-In component
import { authClient } from "@/lib/auth-client";

async function handleSignInWithPasskey() {
  const { error } = await authClient.passkey.signIn({
    // Using autoFill enables the browser's native passkey prompt
    // that is attached to an input field.
    autoFill: true,
  });

  if (error) {
    // Handle sign-in error
  }
  // On success, the user is signed in and a session is created.
  // You would typically redirect them to the dashboard.
}
```

To make `autoFill` work, you should also add a `useEffect` hook to your sign-in page to preload the passkey credentials, which allows the browser to show the autofill prompt on relevant input fields.

```javascript
// In your sign-in page component
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

useEffect(() => {
  // Check if the browser supports Conditional UI
  if (window.PublicKeyCredential?.isConditionalMediationAvailable) {
    // Pre-emptively start the passkey request to enable autofill
    authClient.passkey.signIn({ autoFill: true });
  }
}, []);
```

### Managing Passkeys

The plugin also provides endpoints for users to manage their registered passkeys:
-   `GET /api/auth/passkey/list-user-passkeys`: Lists all passkeys for the current user.
-   `POST /api/auth/passkey/delete-passkey`: Deletes a specific passkey.
-   `POST /api/auth/passkey/update-passkey`: Renames a passkey.
