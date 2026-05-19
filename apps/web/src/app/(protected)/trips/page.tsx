'use client';

import { useMyTrips, useUpdateBookingStatus } from '@/features/bookings/hooks/useBookings';
import { TripCard } from '@/features/bookings/components/TripCard';
import { Loader2, Palmtree } from 'lucide-react';
import Link from 'next/link';
import { BookingStatus } from '@rentnear/types';

export default function TripsPage() {
  const { data: trips, isLoading } = useMyTrips();
  const {
    mutate: updateStatus,
    isPending: isUpdating,
    variables: updatingVars,
  } = useUpdateBookingStatus();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-hero text-neutral-900">My Trips</h1>
        <p className="mt-1 text-sm text-neutral-600">Track your upcoming and past rentals.</p>
      </div>

      {!trips || trips.length === 0 ? (
        <div className="white-card flex flex-col items-center gap-3 py-16 text-center">
          <Palmtree className="h-10 w-10 text-neutral-300" />
          <p className="text-sm text-neutral-600">No trips booked yet.</p>
          <Link
            href="/listings"
            className="text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            Start exploring →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              booking={trip}
              onCancel={() =>
                updateStatus({ bookingId: trip.id, input: { status: BookingStatus.CANCELLED } })
              }
              isCancelling={isUpdating && updatingVars?.bookingId === trip.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
