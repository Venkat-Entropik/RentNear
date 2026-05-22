'use client';

import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, Clock, CheckCircle2, XCircle, CreditCard, Star } from 'lucide-react';
import type { BookingPublic } from '@rentnear/types';
import { useRazorpay } from 'react-razorpay';
import { useCreatePaymentOrder, useVerifyPayment } from '@/features/payments/hooks/usePayments';
import { ReviewModal } from '@/features/reviews/components/ReviewModal';
import { DisputeModal } from '@/features/disputes/components/DisputeModal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

interface TripCardProps {
  booking: BookingPublic;
  onCancel?: () => void;
  isCancelling?: boolean;
}

export function TripCard({ booking, onCancel, isCancelling }: TripCardProps) {
  const { Razorpay } = useRazorpay();
  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useCreatePaymentOrder();
  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const router = useRouter();

  const listing = booking.listing;
  if (!listing) return null;

  const photo = listing.media?.[0];

  const statusColors = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-success-light text-success border-success-200',
    REJECTED: 'bg-red-50 text-danger border-red-200',
    CANCELLED: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    COMPLETED: 'bg-primary-50 text-primary-700 border-primary-200',
  };

  const StatusIcon = {
    PENDING: Clock,
    CONFIRMED: CheckCircle2,
    REJECTED: XCircle,
    CANCELLED: XCircle,
    COMPLETED: CheckCircle2,
  }[booking.status];

  const handlePayNow = async () => {
    try {
      // 1. Create order on backend
      const order = await createOrder(booking.id);

      // 2. Open Razorpay Checkout
      const rzp = new Razorpay({
        key: process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] || 'rzp_test_placeholder', // Should be exposed in .env.local
        amount: order.amount,
        currency: 'INR',
        name: 'RentNear',
        description: `Payment for ${listing.title}`,
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          // 3. Verify on backend
          await verifyPayment({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        theme: {
          color: '#0E7060', // primary-500
        },
      });

      rzp.on('payment.failed', function (response: any) {
        console.error('Payment Failed', response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err) {
      console.error('Failed to initiate payment', err);
      alert('Could not start payment process. Please try again.');
    }
  };

  return (
    <div className="white-card flex flex-col sm:flex-row overflow-hidden">
      {/* Thumbnail */}
      <div className="h-48 w-full sm:h-auto sm:w-48 flex-shrink-0 bg-neutral-100 relative">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-300">
            <MapPin className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold ${statusColors[booking.status]}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {booking.status}
              </span>
              <h3 className="mt-2 text-lg font-bold text-neutral-900">{listing.title}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                {listing.city}
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xl font-bold text-neutral-900">
                ₹{Number(booking.totalPrice).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-neutral-500">Total</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-neutral-50 p-3 text-sm text-neutral-700">
            <Calendar className="h-4 w-4 text-primary-500" />
            <span className="font-medium">
              {format(parseISO(booking.startDate), 'MMM d, yyyy')}
            </span>
            <span className="text-neutral-400">→</span>
            <span className="font-medium">{format(parseISO(booking.endDate), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-3 flex-wrap">
          <button
            onClick={() => router.push(`/inbox?listingId=${listing.id}` as any)}
            className="rounded-pill border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </button>

          {booking.status === 'PENDING' && onCancel && (
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className="rounded-pill border border-neutral-200 px-4 py-2 text-sm font-medium text-danger hover:bg-red-50 disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Request'}
            </button>
          )}

          {booking.status === 'CONFIRMED' && (
            <button
              onClick={handlePayNow}
              disabled={isCreatingOrder}
              className="btn-primary flex items-center gap-1.5 px-6 py-2"
            >
              <CreditCard className="h-4 w-4" />
              {isCreatingOrder ? 'Processing...' : 'Pay Now'}
            </button>
          )}

          {booking.status === 'COMPLETED' && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="rounded-pill bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-100 transition-colors"
            >
              Write a Review
            </button>
          )}

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

      {/* Review Modal */}
      <ReviewModal
        booking={booking}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />

      {/* Dispute Modal */}
      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        bookingId={booking.id}
      />
    </div>
  );
}
