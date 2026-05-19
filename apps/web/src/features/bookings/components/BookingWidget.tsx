'use client';

import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Calendar, Loader2 } from 'lucide-react';
import { useCreateBooking } from '../hooks/useBookings';

interface BookingWidgetProps {
  listingId: string;
  pricePerDay: number;
  deposit?: number | null | undefined;
}

export function BookingWidget({ listingId, pricePerDay, deposit }: BookingWidgetProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const { mutate: requestBooking, isPending, error, isSuccess } = useCreateBooking();

  const handleBooking = () => {
    if (!startDate || !endDate) return;
    requestBooking({
      listingId,
      input: { startDate, endDate },
    });
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    return differenceInDays(end, start) + 1;
  };

  const days = calculateDays();
  const rentalCost = days * pricePerDay;
  const totalCost = rentalCost + (deposit ? Number(deposit) : 0);

  if (isSuccess) {
    return (
      <div className="white-card p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-light">
          <Calendar className="h-6 w-6 text-success" />
        </div>
        <h3 className="text-h3 text-neutral-900">Request Sent!</h3>
        <p className="mt-2 text-sm text-neutral-600">
          The owner will review your booking request. You can check its status in your Trips.
        </p>
      </div>
    );
  }

  return (
    <div className="white-card p-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-neutral-900">
            ₹{pricePerDay.toLocaleString('en-IN')}
          </span>
          <span className="ml-1 text-sm text-neutral-500">/day</span>
        </div>
      </div>

      <div className="mb-4 rounded-[12px] border border-neutral-200 overflow-hidden">
        <div className="flex border-b border-neutral-200">
          <div className="flex-1 border-r border-neutral-200 p-3">
            <label className="block text-[10px] font-bold uppercase text-neutral-900">Check-in</label>
            <input
              type="date"
              className="mt-1 w-full bg-transparent text-sm focus:outline-none"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1 p-3">
            <label className="block text-[10px] font-bold uppercase text-neutral-900">Check-out</label>
            <input
              type="date"
              className="mt-1 w-full bg-transparent text-sm focus:outline-none"
              value={endDate}
              min={startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {days > 0 && (
        <div className="mb-4 space-y-2 text-sm text-neutral-600">
          <div className="flex justify-between">
            <span>₹{pricePerDay.toLocaleString('en-IN')} x {days} days</span>
            <span>₹{rentalCost.toLocaleString('en-IN')}</span>
          </div>
          {deposit && (
            <div className="flex justify-between">
              <span>Refundable deposit</span>
              <span>₹{Number(deposit).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="my-3 border-t border-neutral-200" />
          <div className="flex justify-between font-bold text-neutral-900">
            <span>Total</span>
            <span>₹{totalCost.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert-error mb-4 text-sm">
          {(error as { message?: string }).message ?? 'Failed to request booking.'}
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={isPending || !startDate || !endDate || days <= 0}
        className="btn-primary w-full py-3 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Request to Book'}
      </button>
      <p className="mt-3 text-center text-xs text-neutral-500">
        You won&apos;t be charged yet
      </p>
    </div>
  );
}
