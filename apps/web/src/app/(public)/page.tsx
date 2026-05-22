// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/app/(public)/page.tsx
//
// Root Home Page
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { HomeView } from '@/features/home/HomeView';

export const metadata: Metadata = {
  title: 'RentNear — Rent Anything from Your Neighbours',
  description: 'Rent tools, gadgets, vehicles, and more from people near you.',
};

export default function HomePage() {
  return <HomeView />;
}
