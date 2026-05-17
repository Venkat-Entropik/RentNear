'use client';

// ──────────────────────────────────────────────────────────────────────────────
// CreateListingView.tsx — 4-step guided creation flow
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useCreateListing, useUpdateListing } from './hooks/useListings';
import { CreateListingForm } from './components/CreateListingForm';
import { LocationStep } from './components/LocationStep';
import { PublishStep } from './components/PublishStep';
import type { CreateListingValues, CreateStep } from './types';
import type { ListingPublic } from '@rentnear/types';

type PartialDetails = Partial<CreateListingValues>;

export function CreateListingView() {
  const router = useRouter();
  const [step, setStep] = useState<CreateStep>('details');
  const [details, setDetails] = useState<PartialDetails>({});
  const [listing, setListing] = useState<ListingPublic | null>(null);
  const [published, setPublished] = useState(false);

  const { mutateAsync: createListing, isPending: creating } = useCreateListing();
  const { mutateAsync: updateListing } = useUpdateListing();

  const STEPS: CreateStep[] = ['details', 'location', 'media', 'publish'];
  const stepIdx = STEPS.indexOf(step);

  // Step 1 → 2
  const handleDetails = (values: CreateListingValues) => {
    setDetails(values);
    setStep('location');
  };

  // Step 2 → 3: create the draft
  const handleLocation = async ({ city, state, pincode }: { city: string; state: string; pincode: string }) => {
    const payload = { ...details, city, state, pincode } as CreateListingValues;

    if (!listing) {
      const created = await createListing({
        categoryId: payload.categoryId,
        title: payload.title,
        description: payload.description,
        pricePerDay: payload.pricePerDay,
        ...(payload.deposit ? { deposit: payload.deposit } : {}),
        city,
        state,
        pincode,
      });
      setListing(created);
    } else {
      const updated = await updateListing({
        id: listing.id,
        input: { city, state, pincode },
      });
      setListing(updated);
    }

    setStep('media');
  };

  if (published && listing) {
    return (
      <div className="mx-auto max-w-[390px] px-4 py-10 text-center">
        <div className="white-card flex flex-col items-center gap-4 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <div>
            <h2 className="text-h2 text-neutral-900">Listing Published!</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Your listing is now live and visible to renters nearby.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <button
              onClick={() => router.push(`/listings/${listing.id}` as Parameters<typeof router.push>[0])}
              className="btn-primary w-full"
            >
              View Listing
            </button>
            <button
              onClick={() => router.push('/listings/mine' as Parameters<typeof router.push>[0])}
              className="w-full rounded-pill border border-neutral-200 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              My Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[390px] px-4 py-6 sm:max-w-xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-hero text-neutral-900">Create Listing</h1>
        {/* Step progress */}
        <div className="mt-4 flex items-center gap-1.5">
          {STEPS.slice(0, 3).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= stepIdx ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="white-card p-6">
        {step === 'details' && (
          <CreateListingForm defaultValues={details} onNext={handleDetails} />
        )}
        {step === 'location' && (
          <LocationStep
            defaultValues={
              details.city && details.state && details.pincode
                ? { city: details.city, state: details.state, pincode: details.pincode }
                : undefined
            }
            onNext={(vals) => void handleLocation(vals)}
            onBack={() => setStep('details')}
          />
        )}
        {(step === 'media' || step === 'publish') && listing && (
          <PublishStep
            listing={listing}
            onBack={() => setStep('location')}
            onPublished={(published) => {
              setListing(published);
              setPublished(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
