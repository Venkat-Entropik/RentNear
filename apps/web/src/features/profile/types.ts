// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/profile/types.ts
// Zod validation schemas for all profile-related forms.
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';
import { DocType } from '@rentnear/types';

// ── Update Profile ─────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be 80 characters or less')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  avatarUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

// ── Create Address ────────────────────────────────────────────────────────

export const createAddressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(40),
  street: z.string().min(1, 'Street address is required').max(200),
  city: z.string().min(1, 'City is required').max(80),
  state: z.string().min(1, 'State is required').max(80),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  isDefault: z.boolean().optional(),
});

export type CreateAddressValues = z.infer<typeof createAddressSchema>;

// ── Submit KYC ────────────────────────────────────────────────────────────

export const submitKycSchema = z.object({
  docType: z.nativeEnum(DocType),
  docNumber: z.string().min(8, 'Document number too short').max(20, 'Document number too long'),
  frontUrl: z.string().url('Front image URL is required'),
  backUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  selfieUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export type SubmitKycValues = z.infer<typeof submitKycSchema>;

// ── KYC step machine ──────────────────────────────────────────────────────
export type KycStep = 'select-doc' | 'enter-details' | 'review';
