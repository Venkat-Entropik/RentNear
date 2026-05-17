// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/app/layout.tsx
//
// Root App Router layout — wraps the entire app with:
//  - React Query provider (server state)
//  - Zustand hydration (no provider needed — store is global)
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: {
    template: '%s | RentNear',
    default: 'RentNear — Rent Anything from Your Neighbours',
  },
  description:
    'RentNear is a peer-to-peer neighbourhood rental platform. Rent tools, gadgets, vehicles, and more from people near you.',
  keywords: ['rental', 'peer to peer', 'neighbourhood', 'rent', 'share economy'],
  authors: [{ name: 'RentNear' }],
  openGraph: {
    type: 'website',
    siteName: 'RentNear',
    title: 'RentNear — Rent Anything from Your Neighbours',
    description: 'Peer-to-peer neighbourhood rental platform',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
