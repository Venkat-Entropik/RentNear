'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/components/Header.tsx
// ──────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/authStore';
import { MapPin, Search, Calendar, Inbox, User, Plus } from 'lucide-react';

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200 shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-white">
            <MapPin className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            RentNear
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            href="/listings"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Browse</span>
          </Link>

          {user ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link
                  href={'/admin' as any}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
                >
                  Admin
                </Link>
              )}
              <Link
                href={'/trips' as any}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Trips</span>
              </Link>
              <Link
                href={'/host/requests' as any}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                <Inbox className="h-4 w-4" />
                <span className="hidden sm:inline">Requests</span>
              </Link>
              <div className="mx-1 h-5 w-px bg-neutral-200" />
              <Link
                href="/listings/new"
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">List Item</span>
              </Link>
              <Link
                href="/profile"
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-2 ring-transparent transition-all hover:ring-primary-200"
              >
                <User className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <Link
              href="/auth"
              className="ml-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              Log In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
