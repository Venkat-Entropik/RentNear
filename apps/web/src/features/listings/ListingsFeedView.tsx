'use client';

// ──────────────────────────────────────────────────────────────────────────────
// ListingsFeedView.tsx — Public browse feed with filters + pagination
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Map, List } from 'lucide-react';
import { useListings } from './hooks/useListings';
import { ListingFilters } from './components/ListingFilters';
import { ListingGrid } from './components/ListingGrid';
import type { ListingsQuery } from '@rentnear/types';
import dynamic from 'next/dynamic';

const ListingsMap = dynamic(() => import('./components/ListingsMap'), { ssr: false });

export function ListingsFeedView() {
  const [query, setQuery] = useState<ListingsQuery>({ page: 1, limit: 20 });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { data, isLoading, isFetching } = useListings(query);

  const totalPages = data ? Math.ceil(data.total / (query.limit ?? 20)) : 0;
  const currentPage = query.page ?? 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-hero text-neutral-900">Browse Rentals</h1>
        <p className="mt-1 text-body text-neutral-600">
          {data ? `${data.total} item${data.total !== 1 ? 's' : ''} available near you` : 'Find anything to rent from your neighbours'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ListingFilters value={query} onChange={setQuery} />
      </div>

      {viewMode === 'map' ? (
        <div className="flex h-[calc(100vh-250px)] gap-6 overflow-hidden rounded-xl border border-neutral-200">
          <div className="w-1/3 flex flex-col p-4 bg-white overflow-y-auto border-r border-neutral-200">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : (
              <ListingGrid
                listings={data?.data ?? []}
                emptyMessage="No listings found on map."
              />
            )}
          </div>
          <div className="w-2/3 h-full relative z-0">
            {data && <ListingsMap listings={data.data} />}
          </div>
        </div>
      ) : (
        <>
          {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* Subtle fetching indicator */}
          {isFetching && !isLoading && (
            <div className="mb-4 flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Updating…
            </div>
          )}

          <ListingGrid
            listings={data?.data ?? []}
            emptyMessage={
              query.city || query.categoryId
                ? 'No listings match your filters. Try broadening your search.'
                : 'No listings yet. Be the first to list something!'
            }
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                disabled={currentPage <= 1}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm text-neutral-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
          )}
        </>
      )}

      {/* Floating Toggle Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-pill shadow-xl font-medium text-sm hover:bg-neutral-800 transition-transform active:scale-95"
        >
          {viewMode === 'list' ? (
            <><Map className="h-4 w-4" /> Show Map</>
          ) : (
            <><List className="h-4 w-4" /> Show List</>
          )}
        </button>
      </div>
    </div>
  );
}
