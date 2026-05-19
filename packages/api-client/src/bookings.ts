import { apiClient } from './client';
import type { BookingPublic, CreateBookingInput, UpdateBookingStatusInput } from '@rentnear/types';

/**
 * POST /listings/:id/bookings
 * Create a new booking request.
 */
export async function createBooking(
  listingId: string,
  input: CreateBookingInput,
): Promise<BookingPublic> {
  const res = await apiClient.post<BookingPublic>(`/listings/${listingId}/bookings`, input);
  return res.data;
}

/**
 * GET /bookings/trips
 * Get all bookings made by the current user (renter).
 */
export async function getMyTrips(): Promise<BookingPublic[]> {
  const res = await apiClient.get<BookingPublic[]>('/bookings/trips');
  return res.data;
}

/**
 * GET /bookings/requests
 * Get all incoming booking requests for the owner's listings.
 */
export async function getOwnerRequests(): Promise<BookingPublic[]> {
  const res = await apiClient.get<BookingPublic[]>('/bookings/requests');
  return res.data;
}

/**
 * PATCH /bookings/:id/status
 * Update the status of a booking (confirm, reject, cancel).
 */
export async function updateBookingStatus(
  bookingId: string,
  input: UpdateBookingStatusInput,
): Promise<BookingPublic> {
  const res = await apiClient.patch<BookingPublic>(`/bookings/${bookingId}/status`, input);
  return res.data;
}
