// skills/better-auth/assets/templates/better-auth-nextjs-template/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "./email"; // Assumes you have created this utility

// Create a single, shared instance of the Prisma Client
const prisma = new PrismaClient();

export const auth = betterAuth({
  // A long, random string used to encrypt session data, set in your .env.local
  secret: process.env.AUTH_SECRET!,

  // The absolute URL of your application, set in your .env.local
  baseURL: process.env.AUTH_URL!,

  // Configure the Prisma adapter for PostgreSQL
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
    // Add the function to handle sending password reset emails
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `<p>Click the link to reset your password: <a href="${url}">Reset Password</a></p>`,
      });
    },
  },

  // Enable email verification
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Click the link to verify your email: <a href="${url}">Verify Email</a></p>`,
      });
    },
    // We recommend requiring email verification for security
    requireEmailVerification: true,
  },

  // Configure social login providers
  socialProviders: {
    // Example for Google OAuth
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.AUTH_URL}/api/auth/callback/google`,
    },
    // You can add other providers here (e.g., GitHub, Facebook)
  },
});

// Export the session type for use in your application
export type Session = typeof auth.$Infer.Session;
