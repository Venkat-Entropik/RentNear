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

  // ── Response interceptor — auto-refresh on 401 + normalise errors ────────
  let isRefreshing = false;
  let refreshQueue: Array<(token: string) => void> = [];

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Only attempt refresh for 401s that haven't been retried yet,
      // and skip refresh endpoint itself to avoid infinite loop.
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== '/auth/refresh'
      ) {
        originalRequest._retry = true;

        const storage = (globalThis as any).localStorage;
        const persisted = storage?.getItem('rentnear-auth');
        const refreshToken = persisted ? JSON.parse(persisted)?.state?.refreshToken : null;

        if (!refreshToken) {
          // No refresh token — clear auth and reject
          storage?.removeItem('rentnear-auth');
          return Promise.reject(normaliseError(error));
        }

        if (isRefreshing) {
          // Queue request until refresh completes
          return new Promise((resolve) => {
            refreshQueue.push((newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(instance(originalRequest));
            });
          });
        }

        isRefreshing = true;
        try {
          const res = await instance.post<{
            accessToken: string;
            refreshToken: string;
            user: unknown;
          }>('/auth/refresh', { refreshToken });

          const { accessToken: newAccess, refreshToken: newRefresh } = res.data;

          // Persist updated tokens to localStorage
          if (storage && persisted) {
            try {
              const parsed = JSON.parse(persisted);
              parsed.state.accessToken = newAccess;
              parsed.state.refreshToken = newRefresh;
              storage.setItem('rentnear-auth', JSON.stringify(parsed));
            } catch {
              // ignore parse errors
            }
          }

          // Flush queued requests with the new token
          refreshQueue.forEach((cb) => cb(newAccess));
          refreshQueue = [];

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return instance(originalRequest);
        } catch {
          // Refresh failed — clear auth state (forces re-login)
          storage?.removeItem('rentnear-auth');
          refreshQueue = [];
          return Promise.reject(normaliseError(error));
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(normaliseError(error));
    },
  );

  return instance;
}

function normaliseError(error: AxiosError<ApiError>): ApiError {
  const message =
    error.response?.data?.message ?? error.message ?? 'An unexpected error occurred';
  const errorCode = error.response?.data?.error;
  return {
    statusCode: error.response?.status ?? 0,
    message,
    ...(errorCode !== undefined && { error: errorCode }),
  };
}


// ── Default client (uses env variable) ───────────────────────────────────────
// Consumers can import this directly or create their own instance via
// createApiClient() if they need token injection.
export const apiClient = createApiClient({
  baseURL:
    typeof process !== 'undefined'
      ? (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1')
      : 'http://localhost:3001/api/v1',
  getAccessToken: () => {
    if (typeof globalThis === 'undefined') return null;
    const storage = (globalThis as any).localStorage;
    if (!storage) return null;
    try {
      const persisted = storage.getItem('rentnear-auth');
      if (!persisted) return null;
      const parsed = JSON.parse(persisted);
      return parsed.state?.accessToken ?? null;
    } catch {
      return null;
    }
  },
});
