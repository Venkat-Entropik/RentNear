'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/home/HomeView.tsx
//
// Pixel-perfect implementation of the Figma Home Page design.
// ──────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, MapPin, Star, Heart, Package, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import { useListings, useCategories } from '@/features/listings/hooks/useListings';
import type { ListingPublic } from '@rentnear/types';

// ── Stat badge data ───────────────────────────────────────────────────────────
const STATS = [
  { icon: Package,      label: '5000+ Items',       sub: 'Across Chennai' },
  { icon: ShieldCheck,  label: 'Verified Users',     sub: 'Trusted community' },
  { icon: CreditCard,   label: 'Secure Payments',    sub: '100% safe & secure' },
];

// ── How It Works steps ───────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Search',
    desc: 'Find what you need near your location.',
    icon: '🔍',
  },
  {
    step: 2,
    title: 'Book',
    desc: 'Choose dates and book securely.',
    icon: '📅',
  },
  {
    step: 3,
    title: 'Pick Up or Delivery',
    desc: 'Collect the item or get it delivered.',
    icon: '📦',
  },
  {
    step: 4,
    title: 'Use & Return',
    desc: 'Return on time and rate your experience.',
    icon: '⭐',
  },
];

// ── Product card ─────────────────────────────────────────────────────────────
function HomeListingCard({ listing }: { listing: ListingPublic }) {
  const [wished, setWished] = useState(false);
  const primaryMedia = listing.media.find((m) => m.isPrimary) ?? listing.media[0];

  return (
    <Link
      href={`/listings/${listing.id}` as any}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative h-40 w-full bg-neutral-100 overflow-hidden">
        {primaryMedia ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryMedia.url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-neutral-300">
            <Package className="h-12 w-12" />
          </div>
        )}
        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); setWished((w) => !w); }}
          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white shadow flex items-center justify-center transition-transform active:scale-90"
        >
          <Heart
            className="h-4 w-4 transition-colors"
            fill={wished ? '#ef4444' : 'none'}
            stroke={wished ? '#ef4444' : '#9CA3AF'}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:text-primary-500 transition-colors">
          {listing.title}
        </h3>

        {/* Price + Rating */}
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-bold text-neutral-900">
              ₹{listing.pricePerDay.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-neutral-400 font-normal"> /day</span>
          </div>
          {listing.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-neutral-700">
                {listing.rating.toFixed(1)}
              </span>
              {listing.reviewCount > 0 && (
                <span className="text-xs text-neutral-400">({listing.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="mt-1.5 flex items-center gap-1 text-xs text-neutral-400">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">{listing.city}, {listing.state}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Main HomeView ─────────────────────────────────────────────────────────────
export function HomeView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: listingsData, isLoading: listingsLoading } = useListings({ page: 1, limit: 8 });
  const { data: categories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    router.push((`/listings?${params.toString()}`) as any);
  };

  // Slice to show up to 7 categories + "View All"
  const displayedCategories = (categories ?? []).slice(0, 7);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 320 }}>
        {/* Background image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1400&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a2e27]/90 via-[#0a2e27]/70 to-[#0a2e27]/40" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {/* Headline */}
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl max-w-xl">
            Need it briefly?{' '}
            <br />
            Rent it{' '}
            <span className="text-[#4CAF50]">locally.</span>
          </h1>
          <p className="mt-3 text-sm text-white/75 max-w-sm sm:text-base">
            Rent tools, gear, and equipment from trusted<br className="hidden sm:block" />
            neighbors near you.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 flex items-center gap-0 max-w-md">
            <div className="flex flex-1 items-center bg-white rounded-l-xl overflow-hidden shadow-lg">
              <Search className="ml-4 h-4 w-4 flex-shrink-0 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you need?"
                className="flex-1 px-3 py-3.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none bg-transparent"
              />
              <div className="h-full flex items-center border-l border-neutral-200 px-3 gap-1 text-sm text-neutral-500 bg-white cursor-pointer whitespace-nowrap">
                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                Near me
                <svg className="h-3.5 w-3.5 text-neutral-400 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              className="h-full px-5 py-3.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-r-xl transition-colors"
            >
              Search
            </button>
          </form>

          {/* Stats Badges */}
          <div className="mt-6 flex flex-wrap gap-3">
            {STATS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5">
                <Icon className="h-3.5 w-3.5 text-white/80 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white leading-none">{label}</p>
                  <p className="text-[10px] text-white/60 leading-none mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Categories ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">Popular Categories</h2>
          <Link
            href="/listings"
            className="flex items-center gap-0.5 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
          >
            View all categories
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {displayedCategories.map((cat) => (
            <Link
              key={cat.id}
              href={(`/listings?categoryId=${cat.id}`) as any}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all duration-200 min-w-[72px]"
            >
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-xl">
                {cat.icon ?? '📦'}
              </div>
              <span className="text-xs font-medium text-neutral-700 text-center leading-tight line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
          {/* View All tile */}
          <Link
            href="/listings"
            className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all duration-200 min-w-[72px]"
          >
            <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <span className="text-xs font-medium text-neutral-700 text-center leading-tight">
              View All
            </span>
          </Link>
        </div>
      </section>

      {/* ── Popular Near You ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">Popular Near You</h2>
          <Link
            href="/listings"
            className="flex items-center gap-0.5 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
          >
            See all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {listingsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="h-40 bg-neutral-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-neutral-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : listingsData && listingsData.data.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {listingsData.data.slice(0, 8).map((listing) => (
              <HomeListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-neutral-200 mb-3" />
            <p className="text-sm text-neutral-500">No listings yet. Be the first to list something!</p>
            <Link href="/listings/new" className="mt-4 btn-primary text-sm px-5 py-2.5">
              List an Item
            </Link>
          </div>
        )}
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-neutral-900 mb-5">How It Works</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map(({ step, title, desc, icon }) => (
            <div
              key={step}
              className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm"
            >
              {/* Step number circle */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white font-bold text-sm mb-3">
                {step}
              </div>
              <div className="text-2xl mb-1.5">{icon}</div>
              <h3 className="text-sm font-semibold text-neutral-900 leading-tight">{title}</h3>
              <p className="mt-1 text-xs text-neutral-500 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Become a Host CTA ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl bg-primary-900 px-8 py-8 sm:py-10">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">Have something to share?</h2>
            <p className="mt-1.5 text-sm text-white/70">List your items and start earning.</p>
          </div>
          <Link
            href="/listings/new"
            className="ml-4 flex-shrink-0 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            Become a Host
          </Link>
        </div>
      </section>
    </div>
  );
}
