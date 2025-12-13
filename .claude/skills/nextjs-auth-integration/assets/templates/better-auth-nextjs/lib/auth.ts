import { betterAuth } from "better-auth";
import { memoryStore } from "better-auth/memory-store";
import { emailAndPassword } from "better-auth/email-and-password";

// In a real application, you would use a database adapter instead of memoryStore
// e.g., import { drizzleAdapter } from "@better-auth/drizzle-adapter";
// and configure it with your database connection.

export const auth = betterAuth({
  adapter: memoryStore(), // Replace with your database adapter in production
  plugins: [
    emailAndPassword({
      // You can add options here, for example:
      // requireEmailVerification: true,
    }),
    // Add other plugins like social logins here
    // e.g., github(...)
  ],
  // It's recommended to set a session secret in production
  // sessionSecret: process.env.AUTH_SESSION_SECRET,
});
