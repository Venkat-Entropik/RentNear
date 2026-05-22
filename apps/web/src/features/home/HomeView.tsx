'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/home/HomeView.tsx
//
// Landing page showcasing all recent products.
// ──────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { useListings } from '@/features/listings/hooks/useListings';
import { ListingGrid } from '@/features/listings/components/ListingGrid';

export function HomeView() {
  // Fetch a set of recent listings for the home page.
  // We can just fetch the first page by default.
  const { data, isLoading } = useListings({ page: 1, limit: 12 });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full bg-primary-600 px-4 py-20 text-center sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,transparent_100%)]" />
        
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-up">
            Rent Anything from Your Neighbours
          </h1>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Why buy when you can rent? Find cameras, tools, camping gear, and more from trusted people in your community.
          </p>
          
          <div className="mt-10 flex justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/listings"
              className="flex items-center gap-2 rounded-pill bg-white px-6 py-3 text-base font-medium text-primary-600 shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              <Search className="h-5 w-5" />
              Explore All Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
              Recently Added
            </h2>
            <p className="mt-2 text-neutral-600">
              Discover the latest items available for rent near you.
            </p>
          </div>
          <Link
            href="/listings"
            className="hidden sm:inline-flex text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline underline-offset-4"
          >
            View All &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <ListingGrid
            listings={data?.data ?? []}
            emptyMessage="No listings yet. Be the first to list something!"
          />
        )}
        
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/listings"
            className="btn-outline w-full justify-center"
          >
            View All Items
          </Link>
        </div>
      </section>
    </div>
  );
}
