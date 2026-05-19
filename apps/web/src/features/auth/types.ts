// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/auth/types.ts
//
// Feature-local type re-exports and form schema definitions.
// Keeps the feature self-contained — form validation co-located with the feature.
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Re-exports from shared types ──────────────────────────────────────────────
export type { UserPublic, AuthTokenResponse, SendOtpResponse, AuthStep } from '@rentnear/types';

// ── Zod form schemas ──────────────────────────────────────────────────────────

/**
 * Phone input form schema.
 * Validates Indian mobile numbers in various formats:
 *  - "+919876543210"
 *  - "9876543210"
 */
export const phoneFormSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((val) => {
      const cleaned = val.replace(/\s+/g, '');
      // Accept 10-digit or +91 prefixed Indian numbers
      return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
    }, 'Please enter a valid 10-digit Indian mobile number'),
});

export type PhoneFormValues = z.infer<typeof phoneFormSchema>;

/**
 * OTP form schema.
 * Validates exactly 6 numeric digits.
 */
export const otpFormSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export type OtpFormValues = z.infer<typeof otpFormSchema>;

/**
 * Normalises a phone input to E.164 (+91XXXXXXXXXX).
 * Strips spaces and adds the +91 prefix if absent.
 */
export function normalisePhone(raw: string): string {
  const cleaned = raw.replace(/\s+/g, '').replace(/^0/, '');
  return cleaned.startsWith('+91') ? cleaned : `+91${cleaned}`;
}
