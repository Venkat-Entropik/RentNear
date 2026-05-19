'use client';

// ──────────────────────────────────────────────────────────────────────────────
// ListingDetailView.tsx — Full single listing page
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { MapPin, ChevronLeft, ChevronRight, Star, Calendar, Phone, Loader2, AlertCircle } from 'lucide-react';
import { useListing } from './hooks/useListings';

import { BookingWidget } from '@/features/bookings/components/BookingWidget';
import { useListingReviews } from '@/features/reviews/hooks/useReviews';
import { ReviewCard } from '@/features/reviews/components/ReviewCard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRouter } from 'next/navigation';

export function ListingDetailView({ id }: { id: string }) {
  const { data: listing, isLoading, error } = useListing(id);
  const { data: reviewsData, isLoading: isLoadingReviews } = useListingReviews(id);
  const { user } = useAuthStore();
  const router = useRouter();
  const [photoIdx, setPhotoIdx] = useState(0);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-neutral-300" />
        <p className="mt-4 text-sm text-neutral-500">Listing not found or unavailable.</p>
      </div>
    );
  }

  const photos = listing.media;
  const photo = photos[photoIdx];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left column: Images, Info, Owner */}
        <div>
          {/* Photo carousel */}
          <div className="relative mb-6 h-64 overflow-hidden rounded-[16px] bg-neutral-100 sm:h-96">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.url} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-300">
                <MapPin className="h-12 w-12" />
              </div>
            )}

            {/* Nav arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                  className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === photoIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Category badge */}
            <span className="absolute left-3 top-3 rounded-pill bg-white/90 px-2.5 py-1 text-xs font-medium text-neutral-700 backdrop-blur-sm">
              {listing.category.icon} {listing.category.name}
            </span>
          </div>

          {/* Title + Location */}
          <div className="mb-6 border-b border-neutral-200 pb-6">
            <h1 className="text-h2 text-neutral-900">{listing.title}</h1>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              {listing.city}, {listing.state} — {listing.pincode}
            </div>
          </div>

          {/* Owner */}
          <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 ring-2 ring-primary-100">
                <span className="text-base font-semibold">
                  {listing.ownerName?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-neutral-900">Hosted by {listing.ownerName ?? 'Owner'}</p>
                <p className="text-sm text-neutral-500">Listed {new Date(listing.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {user && user.id !== listing.ownerId && (
              <button
                onClick={() => router.push(`/inbox?listingId=${listing.id}` as any)}
                className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                Message Owner
              </button>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-h3 mb-3 text-neutral-900">About this item</h2>
            <p className="whitespace-pre-line text-body text-neutral-700">
              {listing.description}
            </p>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 border-t border-neutral-100 pt-10">
            <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary-500 fill-current" />
              {listing.rating.toFixed(1)} · {listing.reviewCount} Reviews
            </h3>

            <div className="flex items-center gap-4 text-sm text-neutral-600 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-primary-500 fill-current" />
                <span className="font-medium text-neutral-900">{listing.rating.toFixed(1)}</span>
                <span>({listing.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="mt-8">
              {isLoadingReviews ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : reviewsData && reviewsData.data.length > 0 ? (
                <div className="space-y-2">
                  {reviewsData.data.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-neutral-50 rounded-2xl">
                  <p className="text-neutral-500 font-medium">No reviews yet.</p>
                  <p className="text-neutral-400 text-sm mt-1">Be the first to rent and review this item.</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-h3 mb-3 text-neutral-900">About this item</h2>
            <p className="whitespace-pre-line text-body text-neutral-700">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Right column: Booking Widget */}
        <div className="relative">
          <div className="sticky top-6">
            <BookingWidget 
              listingId={listing.id} 
              pricePerDay={Number(listing.pricePerDay)} 
              deposit={listing.deposit ? Number(listing.deposit) : undefined} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
