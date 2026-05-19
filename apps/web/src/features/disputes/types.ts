import { z } from 'zod';

export const createDisputeSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(10, 'Please provide at least 10 characters explaining the issue.'),
});

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
