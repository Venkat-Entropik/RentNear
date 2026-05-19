'use client';

import { format, parseISO, differenceInDays } from 'date-fns';
import { Calendar, User, Check, X, MessageSquare } from 'lucide-react';
import type { BookingPublic } from '@rentnear/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DisputeModal } from '@/features/disputes/components/DisputeModal';

interface RequestCardProps {
  booking: BookingPublic;
  onApprove?: () => void;
  onReject?: () => void;
  isUpdating?: boolean;
}

export function RequestCard({ booking, onApprove, onReject, isUpdating }: RequestCardProps) {
  const router = useRouter();
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  const listing = booking.listing;
  const renter = booking.renter;
  if (!listing || !renter) return null;

  const days = differenceInDays(parseISO(booking.endDate), parseISO(booking.startDate)) + 1;

  return (
    <div className="white-card overflow-hidden">
      <div className="border-b border-neutral-100 bg-neutral-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900">
              {renter.name || 'A user'} wants to rent
            </p>
            <p className="text-sm font-medium text-primary-600">{listing.title}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">
              Dates
            </p>
            <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
              <Calendar className="h-4 w-4 text-neutral-400" />
              {format(parseISO(booking.startDate), 'MMM d')} -{' '}
              {format(parseISO(booking.endDate), 'MMM d')}
              <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                {days} days
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">
              Earnings
            </p>
            <p className="text-lg font-bold text-success">
              ₹{Number(booking.totalPrice).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {booking.status === 'PENDING' ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={onReject}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 rounded-pill border border-neutral-200 py-2.5 text-sm font-medium text-danger hover:bg-red-50 disabled:opacity-50"
            >
              <X className="h-4 w-4" /> Decline
            </button>
            <button
              onClick={onApprove}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 btn-primary py-2.5 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Approve
            </button>
          </div>
        ) : (
          <div className="mt-5 rounded-[12px] bg-neutral-50 p-3 text-center text-sm font-medium text-neutral-700">
            Status: {booking.status}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3 flex-wrap">
          <button
            onClick={() => router.push(`/inbox?listingId=${listing.id}` as any)}
            className="rounded-pill border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </button>

          {['CONFIRMED', 'COMPLETED'].includes(booking.status) && (
            <button
              onClick={() => setIsDisputeModalOpen(true)}
              className="rounded-pill border border-neutral-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              Report Issue
            </button>
          )}
        </div>
      </div>

      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        bookingId={booking.id}
      />
    </div>
  );
}
