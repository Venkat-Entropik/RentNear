'use client';

import Link from 'next/link';
import { Plus, Pencil, Eye, Trash2, Loader2, PackageOpen } from 'lucide-react';
import { useMyListings, useDeleteListing } from '@/features/listings/hooks/useListings';
import type { Metadata } from 'next';

export default function MyListingsPage() {
  const { data: listings = [], isLoading } = useMyListings();
  const { mutate: remove, isPending: isDeleting, variables: deletingId } = useDeleteListing();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-hero text-neutral-900">My Listings</h1>
          <p className="mt-1 text-sm text-neutral-600">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/listings/new"
          className="btn-primary flex items-center gap-1.5 px-4 py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      {/* Empty state */}
      {listings.length === 0 && (
        <div className="white-card flex flex-col items-center gap-3 py-16 text-center">
          <PackageOpen className="h-10 w-10 text-neutral-300" />
          <p className="text-sm text-neutral-600">You haven&apos;t listed anything yet.</p>
          <Link href="/listings/new" className="text-sm font-medium text-primary-500 hover:text-primary-600">
            Create your first listing →
          </Link>
        </div>
      )}

      {/* Listings */}
      <div className="space-y-3">
        {listings.map((listing) => {
          const photo = listing.media.find((m) => m.isPrimary) ?? listing.media[0];
          return (
            <div key={listing.id} className="white-card flex items-center gap-4 p-4">
              {/* Thumbnail */}
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[12px] bg-neutral-100">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.url} alt={listing.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PackageOpen className="h-6 w-6 text-neutral-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{listing.title}</p>
                <p className="text-xs text-neutral-500">₹{listing.pricePerDay.toLocaleString('en-IN')}/day · {listing.city}</p>
                <span className={`mt-1 inline-block rounded-pill px-2 py-0.5 text-xs font-medium ${
                  listing.isPublished
                    ? 'bg-success-light text-success'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {listing.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5">
                <Link
                  href={`/listings/${listing.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="View"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => remove(listing.id)}
                  disabled={isDeleting && deletingId === listing.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-50 hover:text-danger disabled:opacity-50"
                  aria-label="Delete"
                >
                  {isDeleting && deletingId === listing.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
