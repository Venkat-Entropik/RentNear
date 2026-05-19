// ──────────────────────────────────────────────────────────────────────────────
// packages/types/src/auth.ts
// Shared Auth payload types used by both the API and all frontend apps.
// ──────────────────────────────────────────────────────────────────────────────

import type { UserPublic } from './user';

// ── Request Payloads ─────────────────────────────────────────────────────────

/**
 * Body for POST /auth/send-otp
 * Sends a one-time passcode to the given phone number.
 */
export interface OtpRequestPayload {
  /** E.164 formatted phone number, e.g. "+919876543210" */
  phone: string;
}

/**
 * Body for POST /auth/verify-otp
 * Verifies the OTP and returns tokens.
 */
export interface OtpVerifyPayload {
  /** Same phone number used in send-otp */
  phone: string;
  /** The 6-digit OTP received via SMS */
  otp: string;
}

// ── Response Payloads ────────────────────────────────────────────────────────

/**
 * Successful response from POST /auth/send-otp
 */
export interface SendOtpResponse {
  /** Whether the OTP was dispatched successfully */
  success: boolean;
  /** Human-readable message for the UI */
  message: string;
  /**
   * Time-to-live in seconds until the OTP expires.
   * Frontend should use this to display a countdown timer.
   */
  expiresInSeconds: number;
}

/**
 * Successful response from POST /auth/verify-otp
 * Contains JWT tokens and the authenticated user's public profile.
 */
export interface AuthTokenResponse {
  /** Short-lived JWT access token (15 minutes) */
  accessToken: string;
  /** Long-lived refresh token (7 days) — httpOnly cookie recommended */
  refreshToken: string;
  /** Public user profile */
  user: UserPublic;
}

// ── JWT Payload ──────────────────────────────────────────────────────────────

/**
 * Shape of the decoded JWT payload (sub + role for quick access in guards).
 */
export interface JwtPayload {
  /** User's cuid string */
  sub: string;
  /** User's phone (for logging / debugging) */
  phone: string;
  /** Role — used by RolesGuard without a DB lookup */
  role: string;
  /** Standard JWT issued-at epoch */
  iat?: number;
  /** Standard JWT expiry epoch */
  exp?: number;
}

// ── Auth State (Frontend) ─────────────────────────────────────────────────────

/**
 * Steps in the multi-step auth flow rendered on the frontend.
 */
export type AuthStep = 'phone' | 'otp' | 'success';
