// ──────────────────────────────────────────────────────────────────────────────
// packages/api-client/src/client.ts
//
// Shared Axios instance for all API calls.
// Handles:
//  - Base URL from environment
//  - Authorization header injection
//  - Global error normalisation
// ──────────────────────────────────────────────────────────────────────────────

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Standardised API error shape — all errors are wrapped into this.
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/**
 * Factory to create a configured Axios client.
 * The access token is read lazily via `getAccessToken()` callback,
 * so the client works with Zustand stores and async token retrieval.
 */
export function createApiClient(options: {
  baseURL: string;
  getAccessToken?: () => string | null;
}): AxiosInstance {
  const instance = axios.create({
    baseURL: options.baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10_000,
  });

  // ── Request interceptor — inject Bearer token ─────────────────────────────
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = options.getAccessToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ── Response interceptor — normalise errors ───────────────────────────────
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      // Re-throw with a structured error for the UI to handle
      const message =
        error.response?.data?.message ?? error.message ?? 'An unexpected error occurred';
      const errorCode = error.response?.data?.error;
      const normalised: ApiError = {
        statusCode: error.response?.status ?? 0,
        message,
        ...(errorCode !== undefined && { error: errorCode }),
      };
      return Promise.reject(normalised);
    },
  );

  return instance;
}

// ── Default client (uses env variable) ───────────────────────────────────────
// Consumers can import this directly or create their own instance via
// createApiClient() if they need token injection.
export const apiClient = createApiClient({
  baseURL:
    typeof process !== 'undefined'
      ? (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1')
      : 'http://localhost:3001/api/v1',
});
