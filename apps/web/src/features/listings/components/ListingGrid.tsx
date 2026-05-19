'use client';

import { ListingCard } from './ListingCard';
import type { ListingPublic } from '@rentnear/types';
import { PackageOpen } from 'lucide-react';

interface ListingGridProps {
  listings: ListingPublic[];
  emptyMessage?: string;
}

export function ListingGrid({ listings, emptyMessage = 'No listings found.' }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="white-card flex flex-col items-center gap-3 py-16 text-center">
        <PackageOpen className="h-10 w-10 text-neutral-300" />
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
