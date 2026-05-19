'use client';

import { useOwnerRequests, useUpdateBookingStatus } from '@/features/bookings/hooks/useBookings';
import { RequestCard } from '@/features/bookings/components/RequestCard';
import { Loader2, Inbox } from 'lucide-react';
import { BookingStatus } from '@rentnear/types';

export default function HostRequestsPage() {
  const { data: requests, isLoading } = useOwnerRequests();
  const { mutate: updateStatus, isPending: isUpdating, variables: updatingVars } = useUpdateBookingStatus();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  // Split requests into pending vs resolved (for better UI organization)
  const pendingRequests = requests?.filter((r) => r.status === 'PENDING') ?? [];
  const resolvedRequests = requests?.filter((r) => r.status !== 'PENDING') ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-hero text-neutral-900">Booking Requests</h1>
        <p className="mt-1 text-sm text-neutral-600">Review and manage rental requests for your listings.</p>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="white-card flex flex-col items-center gap-3 py-16 text-center">
          <Inbox className="h-10 w-10 text-neutral-300" />
          <p className="text-sm text-neutral-600">You don&apos;t have any booking requests yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pendingRequests.length > 0 && (
            <section>
              <h2 className="mb-3 text-h3 text-neutral-900">Action Required ({pendingRequests.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    booking={req}
                    isUpdating={isUpdating && updatingVars?.bookingId === req.id}
                    onApprove={() => updateStatus({ bookingId: req.id, input: { status: BookingStatus.CONFIRMED } })}
                    onReject={() => updateStatus({ bookingId: req.id, input: { status: BookingStatus.REJECTED } })}
                  />
                ))}
              </div>
            </section>
          )}

          {resolvedRequests.length > 0 && (
            <section>
              <h2 className="mb-3 text-h3 text-neutral-900">Past & Resolved</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resolvedRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    booking={req}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
