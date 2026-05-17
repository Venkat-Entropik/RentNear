'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/listings/components/ListingCard.tsx
// ──────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { MapPin, Star, Clock } from 'lucide-react';
import type { ListingPublic } from '@rentnear/types';

interface ListingCardProps {
  listing: ListingPublic;
}

export function ListingCard({ listing }: ListingCardProps) {
  const primaryMedia = listing.media.find((m) => m.isPrimary) ?? listing.media[0];
  const hasMedia = Boolean(primaryMedia);

  return (
    <Link
      href={`/listings/${listing.id}` as Parameters<typeof Link>[0]['href']}
      id={`listing-card-${listing.id}`}
      className="group block animate-fade-in"
    >
      <div className="white-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
        {/* Image */}
        <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
          {hasMedia ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryMedia!.url}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <MapPin className="h-8 w-8 text-neutral-300" />
            </div>
          )}
          {/* Category badge */}
          <span className="absolute left-3 top-3 rounded-pill bg-white/90 px-2.5 py-1 text-xs font-medium text-neutral-700 backdrop-blur-sm">
            {listing.category.name}
          </span>
          {/* Draft badge */}
          {!listing.isPublished && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-pill bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              Draft
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900 group-hover:text-primary-500">
            {listing.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{listing.city}, {listing.state}</span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <span className="text-lg font-bold text-neutral-900">
                ₹{listing.pricePerDay.toLocaleString('en-IN')}
              </span>
              <span className="ml-1 text-xs text-neutral-500">/day</span>
            </div>
            {listing.deposit && (
              <span className="text-xs text-neutral-400">
                +₹{listing.deposit.toLocaleString('en-IN')} deposit
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
