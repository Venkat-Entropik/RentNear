import type { Metadata } from 'next';
import { CreateListingView } from '@/features/listings/CreateListingView';

export const metadata: Metadata = {
  title: 'Create Listing — RentNear',
  description: 'List your items for rent and earn from things you own.',
};

export default function NewListingPage() {
  return <CreateListingView />;
}
