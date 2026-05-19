'use client';
// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/listings/types.ts
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

export const createListingSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be 2000 characters or less'),
  pricePerDay: z
    .number({ invalid_type_error: 'Enter a valid price' })
    .positive('Price must be greater than 0')
    .max(99999, 'Price seems too high'),
  deposit: z.number({ invalid_type_error: 'Enter a valid deposit' }).min(0).max(99999).optional(),
  city: z.string().min(1, 'City is required').max(80),
  state: z.string().min(1, 'State is required').max(80),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
});

export type CreateListingValues = z.infer<typeof createListingSchema>;

// Step machine for multi-step create flow
export type CreateStep = 'details' | 'location' | 'media' | 'publish';
