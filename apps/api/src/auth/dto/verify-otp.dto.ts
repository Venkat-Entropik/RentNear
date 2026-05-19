// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/auth/dto/verify-otp.dto.ts
//
// Data Transfer Object for POST /auth/verify-otp
// ──────────────────────────────────────────────────────────────────────────────

import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import type { OtpVerifyPayload } from '@rentnear/types';

/**
 * Validated request body for the verify-OTP endpoint.
 * Implements OtpVerifyPayload from shared types.
 */
export class VerifyOtpDto implements OtpVerifyPayload {
  /**
   * Must match the phone used in send-otp.
   */
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('IN', {
    message: 'phone must be a valid Indian phone number in E.164 format',
  })
  phone!: string;

  /**
   * The 6-digit numeric OTP received via SMS.
   * Exactly 6 characters — prevents brute-force partial guessing.
   */
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'otp must be exactly 6 digits' })
  otp!: string;
}
