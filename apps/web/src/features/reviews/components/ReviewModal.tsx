'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Star, Loader2 } from 'lucide-react';
import { createReviewSchema, type CreateReviewFormValues } from '../types';
import { useCreateReview } from '../hooks/useReviews';
import type { BookingPublic } from '@rentnear/types';

interface ReviewModalProps {
  booking: BookingPublic;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewModal({ booking, isOpen, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const { mutateAsync: createReview, isPending } = useCreateReview();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateReviewFormValues>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateReviewFormValues) => {
    try {
      await createReview({
        listingId: booking.listingId,
        input: data,
      });
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-neutral-100 p-6">
          <h2 className="text-xl font-semibold text-neutral-900">Write a Review</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <p className="text-sm text-neutral-600 mb-6">
            How was your experience renting <strong>{booking.listing?.title}</strong>? Your feedback
            helps the community.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => {
                    setRating(star);
                    setValue('rating', star, { shouldValidate: true });
                  }}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-primary-500 text-primary-500'
                        : 'text-neutral-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && <p className="mt-1 text-sm text-danger">{errors.rating.message}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-2">
              Share your experience
            </label>
            <textarea
              id="comment"
              rows={4}
              placeholder="What went well? Was the item as described? How was the owner?"
              className="input-field resize-none"
              {...register('comment')}
            />
            {errors.comment && <p className="mt-1 text-sm text-danger">{errors.comment.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-3 text-base flex justify-center items-center"
          >
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
