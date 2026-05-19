import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBooking,
  getMyTrips,
  getOwnerRequests,
  updateBookingStatus,
} from '@rentnear/api-client';
import type { CreateBookingInput, UpdateBookingStatusInput, BookingPublic } from '@rentnear/types';

export const bookingsKeys = {
  all: ['bookings'] as const,
  trips: () => [...bookingsKeys.all, 'trips'] as const,
  requests: () => [...bookingsKeys.all, 'requests'] as const,
};

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, input }: { listingId: string; input: CreateBookingInput }) =>
      createBooking(listingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.trips() });
    },
  });
}

export function useMyTrips() {
  return useQuery({
    queryKey: bookingsKeys.trips(),
    queryFn: getMyTrips,
  });
}

export function useOwnerRequests() {
  return useQuery({
    queryKey: bookingsKeys.requests(),
    queryFn: getOwnerRequests,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, input }: { bookingId: string; input: UpdateBookingStatusInput }) =>
      updateBookingStatus(bookingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.trips() });
      queryClient.invalidateQueries({ queryKey: bookingsKeys.requests() });
    },
  });
}
