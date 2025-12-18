# Step 4a: Authentication Method - Email & Password

This guide covers how to configure and use the classic email and password authentication method with `better-auth`.

## Configuration

To enable email and password authentication, you need to configure the `emailAndPassword` property in your `lib/auth.ts` file.

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
// ... other imports

export const auth = betterAuth({
  // ... other options (appName, secret, database)

  emailAndPassword: {
    // Enable the email and password method
    enabled: true,

    // --- Optional Settings ---

    // Set a minimum password length
    minPasswordLength: 8,

    // Disable new user sign-ups
    // disableSignUp: true,

    // Require users to verify their email before they can sign in
    // requireEmailVerification: true,

    // Automatically sign in a user after they sign up
    autoSignIn: true,

    // Provide a function to send password reset emails
    // sendResetPassword: async ({ user, url, token }) => {
    //   // Your email sending logic here
    //   await sendEmail({
    //     to: user.email,
    //     subject: "Reset your password",
    //     body: `Click here to reset your password: ${url}`,
    //   });
    // },
  },

  // ...
});
```

### Key `emailAndPassword` Options:

-   `enabled`: (Required) Must be set to `true` to enable this method.
-   `minPasswordLength`: Sets the minimum required length for user passwords.
-   `disableSignUp`: If `true`, new users cannot sign up via email and password.
-   `requireEmailVerification`: If `true`, users must verify their email address before they can sign in.
-   `sendResetPassword`: A function that you provide to send password reset emails. `better-auth` will call this function with the user's details and a unique reset URL.

## Usage on the Client

Once configured, you can use a client-side library like `@daveyplate/better-auth-ui` or make direct API calls to the endpoints created by `better-auth`.

### Sign Up

To sign up a new user, you would typically have a form that makes a `POST` request to `/api/auth/sign-up/email`.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "a-strong-password"
}
```

### Sign In

To sign in a user, your form would make a `POST` request to `/api/auth/sign-in/email`.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "a-strong-password"
}
```

### Password Reset

A crucial feature for any application using password authentication is the ability for users to reset a forgotten password.

The password reset flow involves two main API calls and a dedicated email sending function. While you can implement the UI for this yourself, we have created a comprehensive, step-by-step guide to walk you through the entire process.

-   **For a complete guide, see: [10-feature-password-reset.md](./10-feature-password-reset.md)**
