'use client';

// ──────────────────────────────────────────────────────────────────────────────
// ListingFilters.tsx — City, category, price range filter bar
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCategories } from '../hooks/useListings';
import type { ListingsQuery } from '@rentnear/types';

interface ListingFiltersProps {
  value: ListingsQuery;
  onChange: (q: ListingsQuery) => void;
}

export function ListingFilters({ value, onChange }: ListingFiltersProps) {
  const { data: categories = [] } = useCategories();
  const [cityInput, setCityInput] = useState(value.city ?? '');
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const submitCity = () => {
    const q: ListingsQuery = { page: 1, limit: value.limit ?? 20 };
    if (cityInput) q.city = cityInput;
    if (value.categoryId) q.categoryId = value.categoryId;
    if (value.minPrice !== undefined) q.minPrice = value.minPrice;
    if (value.maxPrice !== undefined) q.maxPrice = value.maxPrice;
    onChange(q);
  };

  const clearAll = () => {
    setCityInput('');
    onChange({ page: 1, limit: 20 });
  };

  const hasFilters = value.city || value.categoryId || value.minPrice || value.maxPrice;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCity()}
            className="input-field pl-10"
            placeholder="Search by city…"
          />
        </div>
        <button onClick={submitCity} className="btn-primary px-4 py-3 text-sm">
          Search
        </button>
        <button
          onClick={() => setShowPriceFilter((v) => !v)}
          className={`flex items-center gap-1.5 rounded-[12px] border px-3 py-3 text-sm font-medium transition-colors ${
            showPriceFilter || value.minPrice || value.maxPrice
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Price range */}
      {showPriceFilter && (
        <div className="flex items-center gap-2 animate-fade-in">
          <input
            type="number"
            min={0}
            placeholder="Min ₹"
            value={value.minPrice ?? ''}
            onChange={(e) => {
              const q: ListingsQuery = { ...value, page: 1 };
              if (e.target.value) { q.minPrice = parseInt(e.target.value); } else { delete q.minPrice; }
              onChange(q);
            }}
            className="input-field w-28 text-sm"
          />
          <span className="text-neutral-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max ₹"
            value={value.maxPrice ?? ''}
            onChange={(e) => {
              const q: ListingsQuery = { ...value, page: 1 };
              if (e.target.value) { q.maxPrice = parseInt(e.target.value); } else { delete q.maxPrice; }
              onChange(q);
            }}
            className="input-field w-28 text-sm"
          />
          <span className="text-xs text-neutral-500">per day</span>
        </div>
      )}

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            const q: ListingsQuery = { page: 1, limit: value.limit ?? 20 };
            if (value.city) q.city = value.city;
            if (value.minPrice !== undefined) q.minPrice = value.minPrice;
            if (value.maxPrice !== undefined) q.maxPrice = value.maxPrice;
            onChange(q);
          }}
          className={`rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors ${
            !value.categoryId
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-neutral-200 text-neutral-600 hover:border-primary-300'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              const q: ListingsQuery = { ...value, page: 1 };
              if (value.categoryId === cat.id) { delete q.categoryId; } else { q.categoryId = cat.id; }
              onChange(q);
            }}
            className={`flex items-center gap-1 rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors ${
              value.categoryId === cat.id
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-200 text-neutral-600 hover:border-primary-300'
            }`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Active filter count / clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-danger"
        >
          <X className="h-3.5 w-3.5" />
          Clear all filters
        </button>
      )}
    </div>
  );
}
