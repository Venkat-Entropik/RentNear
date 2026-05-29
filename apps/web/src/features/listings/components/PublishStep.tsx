'use client';

// PublishStep.tsx — Step 4: photo upload + publish

import { useState } from 'react';
import { ArrowLeft, Rocket, Loader2 } from 'lucide-react';
import { MediaUploader } from './MediaUploader';
import { usePublishListing } from '../hooks/useListings';
import type { ListingPublic } from '@rentnear/types';

interface PublishStepProps {
  listing: ListingPublic;
  onBack: () => void;
  onPublished: (listing: ListingPublic) => void;
}

export function PublishStep({ listing, onBack, onPublished }: PublishStepProps) {
  const [uploadedCount, setUploadedCount] = useState(0);
  const { mutate: publish, isPending, error } = usePublishListing();

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h2 className="text-h2 text-neutral-900">Add Photos & Publish</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Upload at least 1 photo before publishing. You can add up to 10.
        </p>
      </div>

      {/* Media uploader */}
      <MediaUploader
        listingId={listing.id}
        existingMedia={listing.media}
        onUploaded={() => setUploadedCount((c) => c + 1)}
      />

      {/* Error */}
      {error && (
        <div className="alert-error text-sm">
          {(error as { message?: string }).message ?? 'Failed to publish. Please try again.'}
        </div>
      )}

      {/* Publish CTA */}
      <button
        type="button"
        disabled={isPending || listing.media.length + uploadedCount === 0}
        onClick={() => publish(listing.id, { onSuccess: onPublished })}
        className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
        Publish Listing
      </button>

      {listing.media.length + uploadedCount === 0 && (
        <p className="text-center text-xs text-neutral-400">Add at least 1 photo to publish</p>
      )}
    </div>
  );
}
