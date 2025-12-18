/**
 * API client for communicating with the backend.
 *
 * Provides a type-safe fetch wrapper with:
 * - Automatic auth header injection (JWT token)
 * - Error handling and parsing
 * - Request/response interceptors
 * - Timeout support
 */

import { config } from "./config";

/**
 * Token cache to avoid fetching token on every request.
 */
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Get JWT token for API requests.
 * Caches the token and refreshes when expired.
 */
async function getAuthToken(): Promise<string | null> {
  // Check if cached token is still valid (with 5 min buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  try {
    const response = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include", // Send session cookie
    });

    if (!response.ok) {
      // Not authenticated
      cachedToken = null;
      tokenExpiry = null;
      return null;
    }

    const data = await response.json();
    cachedToken = data.token;
    // Token expires in 1 hour, cache for 55 minutes
    tokenExpiry = Date.now() + 55 * 60 * 1000;
    return cachedToken;
  } catch {
    cachedToken = null;
    tokenExpiry = null;
    return null;
  }
}

/**
 * Clear the cached token (call on logout).
 */
export function clearAuthToken(): void {
  cachedToken = null;
  tokenExpiry = null;
}

/**
 * Standard API error response structure.
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Request configuration options.
 */
interface RequestConfig extends RequestInit {
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Parse error response into ApiError format.
 */
function parseError(error: unknown, status = 500): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "CLIENT_ERROR",
      status,
    };
  }

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      message: (err.message as string) || (err.detail as string) || "An error occurred",
      code: (err.code as string) || "UNKNOWN",
      status: (err.status as number) || status,
      details: err.details as Record<string, unknown>,
    };
  }

  return {
    message: "Unknown error",
    code: "UNKNOWN",
    status,
  };
}

/**
 * Create URL with query parameters.
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  // Ensure base URL ends with / for proper URL resolution
  const baseUrl = config.apiUrl.endsWith("/")
    ? config.apiUrl
    : `${config.apiUrl}/`;
  // Remove leading slash from endpoint to avoid double slashes
  const cleanEndpoint = endpoint.replace(/^\//, "");
  const url = new URL(cleanEndpoint, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}


/**
 * Core fetch wrapper with interceptors.
 */
async function request<T>(
  endpoint: string,
  options: RequestConfig = {}
): Promise<T> {
  const { timeout = 10000, params, ...fetchOptions } = options;

  // Build URL with query params
  const url = buildUrl(endpoint, params);

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Prepare headers
    const headers = new Headers(fetchOptions.headers);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // Get and inject JWT token for authentication
    const token = await getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Make request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
      credentials: "include", // Include cookies for Better Auth
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: response.statusText };
      }

      throw parseError(errorBody, response.status);
    }

    // Parse response
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw parseError(new Error("Request timeout"), 408);
    }

    if ((error as ApiError).code) {
      throw error;
    }

    throw parseError(error);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * API client with typed methods.
 */
export const api = {
  /**
   * GET request.
   */
  get<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  /**
   * POST request.
   */
  post<T>(endpoint: string, data?: unknown, options?: RequestConfig): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request.
   */
  put<T>(endpoint: string, data?: unknown, options?: RequestConfig): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request.
   */
  patch<T>(endpoint: string, data?: unknown, options?: RequestConfig): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request.
   */
  delete<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};

/**
 * Helper to check if an error is an ApiError.
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error &&
    "status" in error
  );
}

/**
 * Helper for retry logic with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    // Don't retry client errors (4xx)
    if (isApiError(error) && error.status >= 400 && error.status < 500) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}
