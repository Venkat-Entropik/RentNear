import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPaymentOrder, verifyPayment } from '@rentnear/api-client';
import { bookingsKeys } from '../../bookings/hooks/useBookings';
import type { VerifyPaymentInput } from '@rentnear/types';

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (bookingId: string) => createPaymentOrder(bookingId),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VerifyPaymentInput) => verifyPayment(input),
    onSuccess: () => {
      // Invalidate trips so the booking status updates from CONFIRMED -> COMPLETED
      queryClient.invalidateQueries({ queryKey: bookingsKeys.trips() });
    },
  });
}
