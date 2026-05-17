// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/auth/dto/send-otp.dto.ts
//
// Data Transfer Object for POST /auth/send-otp
// class-validator decorators are evaluated by the global ValidationPipe.
// ──────────────────────────────────────────────────────────────────────────────

import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import type { OtpRequestPayload } from '@rentnear/types';

/**
 * Validated request body for the send-OTP endpoint.
 * Implements OtpRequestPayload from shared types to keep API and client in sync.
 */
export class SendOtpDto implements OtpRequestPayload {
  /**
   * Phone number in E.164 format (+91XXXXXXXXXX for Indian numbers).
   * @IsPhoneNumber('IN') validates Indian phone numbers.
   * Change locale to undefined for international support.
   */
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('IN', {
    message: 'phone must be a valid Indian phone number in E.164 format (e.g. +919876543210)',
  })
  phone!: string;
}
