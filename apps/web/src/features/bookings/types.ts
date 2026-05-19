import { z } from 'zod';

export const createBookingSchema = z
  .object({
    startDate: z.date({
      required_error: 'Start date is required',
      invalid_type_error: 'That is not a valid date',
    }),
    endDate: z.date({
      required_error: 'End date is required',
      invalid_type_error: 'That is not a valid date',
    }),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  });

export type CreateBookingValues = z.infer<typeof createBookingSchema>;
