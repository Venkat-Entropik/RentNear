import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000),
});

export type CreateReviewFormValues = z.infer<typeof createReviewSchema>;
