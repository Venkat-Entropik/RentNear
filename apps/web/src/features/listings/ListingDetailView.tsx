'use client';

// ──────────────────────────────────────────────────────────────────────────────
// ListingDetailView.tsx — Full single listing page
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { MapPin, ChevronLeft, ChevronRight, Star, Calendar, Phone, Loader2, AlertCircle } from 'lucide-react';
import { useListing } from './hooks/useListings';

export function ListingDetailView({ id }: { id: string }) {
  const { data: listing, isLoading, error } = useListing(id);
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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Photo carousel */}
      <div className="relative mb-5 h-64 overflow-hidden rounded-[16px] bg-neutral-100 sm:h-80">
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

      {/* Title + price */}
      <div className="mb-4">
        <h1 className="text-h2 text-neutral-900">{listing.title}</h1>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          {listing.city}, {listing.state} — {listing.pincode}
        </div>
      </div>

      {/* Price card */}
      <div className="white-card mb-4 flex items-center justify-between p-4">
        <div>
          <span className="text-2xl font-bold text-neutral-900">
            ₹{listing.pricePerDay.toLocaleString('en-IN')}
          </span>
          <span className="ml-1 text-sm text-neutral-500">/day</span>
          {listing.deposit && (
            <p className="mt-0.5 text-xs text-neutral-400">
              +₹{listing.deposit.toLocaleString('en-IN')} refundable deposit
            </p>
          )}
        </div>
        <button id="listing-rent-btn" className="btn-primary flex items-center gap-1.5 px-5 py-3 text-sm">
          <Calendar className="h-4 w-4" />
          Rent Now
        </button>
      </div>

      {/* Description */}
      <div className="white-card mb-4 p-4">
        <h2 className="mb-2 text-sm font-semibold text-neutral-900">About this item</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
          {listing.description}
        </p>
      </div>

      {/* Owner */}
      <div className="white-card flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500 ring-2 ring-primary-100">
            <span className="text-sm font-semibold">
              {listing.ownerName?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{listing.ownerName ?? 'Owner'}</p>
            <p className="text-xs text-neutral-500">Listed {new Date(listing.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 rounded-pill border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          <Phone className="h-3.5 w-3.5" />
          Contact
        </button>
      </div>
    </div>
  );
}
