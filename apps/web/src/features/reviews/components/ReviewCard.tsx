import { format, parseISO } from 'date-fns';
import { Star } from 'lucide-react';
import type { ReviewPublic } from '@rentnear/types';

export function ReviewCard({ review }: { review: ReviewPublic }) {
  return (
    <div className="flex gap-4 border-b border-neutral-100 py-6 last:border-0">
      <img
        src={
          review.user?.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${review.user?.name || 'User'}`
        }
        alt={review.user?.name || 'User'}
        className="h-12 w-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-neutral-900">
            {review.user?.name || 'Anonymous User'}
          </h4>
          <span className="text-sm text-neutral-500">
            {format(parseISO(review.createdAt), 'MMM yyyy')}
          </span>
        </div>
        <div className="mt-1 flex items-center text-primary-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-neutral-200'}`}
            />
          ))}
        </div>
        <p className="mt-3 text-neutral-700 leading-relaxed">{review.comment}</p>
      </div>
    </div>
  );
}
