// ──────────────────────────────────────────────────────────────────────────────
// packages/api-client/src/auth.ts
//
// Typed API calls for the /auth resource.
// Functions return the exact types from @rentnear/types — zero type drift
// between backend DTOs and frontend consumption.
// ──────────────────────────────────────────────────────────────────────────────

import { apiClient } from './client';
import type {
  OtpRequestPayload,
  OtpVerifyPayload,
  SendOtpResponse,
  AuthTokenResponse,
} from '@rentnear/types';

/**
 * POST /auth/send-otp
 * Triggers OTP dispatch to the provided phone number.
 */
export async function sendOtp(payload: OtpRequestPayload): Promise<SendOtpResponse> {
  const { data } = await apiClient.post<SendOtpResponse>('/auth/send-otp', payload);
  return data;
}

/**
 * POST /auth/verify-otp
 * Verifies OTP and returns JWT tokens + user profile.
 */
export async function verifyOtp(payload: OtpVerifyPayload): Promise<AuthTokenResponse> {
  const { data } = await apiClient.post<AuthTokenResponse>('/auth/verify-otp', payload);
  return data;
}
