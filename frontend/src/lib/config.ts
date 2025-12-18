/**
 * Application configuration loaded from environment variables.
 */

interface Config {
  /** Base URL for the backend API */
  apiUrl: string;
  /** Better Auth URL (usually same as app URL) */
  authUrl: string;
  /** Current environment */
  environment: "development" | "staging" | "production";
  /** Whether running in development mode */
  isDevelopment: boolean;
  /** Whether running in production mode */
  isProduction: boolean;
}

function getConfig(): Config {
  const environment =
    (process.env.NODE_ENV as Config["environment"]) || "development";

  // On the server, use the internal Docker network URL.
  // On the client, use the publicly exposed URL.
  const apiUrl =
    typeof window === "undefined"
      ? process.env.API_URL_INTERNAL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8000/api/v1"
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  return {
    apiUrl,
    authUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    environment,
    isDevelopment: environment === "development",
    isProduction: environment === "production",
  };
}

export const config = getConfig();

/**
 * Validate that required environment variables are set.
 * Call this during app initialization to fail fast.
 */
export function validateConfig(): void {
  const requiredVars = ["NEXT_PUBLIC_API_URL"];

  const missing = requiredVars.filter(
    (key) => !process.env[key] && config.isProduction
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
