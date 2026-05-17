import type { Metadata } from 'next';
import { ListingsFeedView } from '@/features/listings/ListingsFeedView';

export const metadata: Metadata = {
  title: 'Browse Rentals — RentNear',
  description: 'Rent anything from your neighbours. Browse cameras, tools, sports gear and more.',
};

export default function ListingsPage() {
  return <ListingsFeedView />;
}
