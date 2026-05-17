import type { Metadata } from 'next';
import { ListingDetailView } from '@/features/listings/ListingDetailView';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Listing Detail — RentNear',
};

export default function ListingDetailPage({ params }: Props) {
  return <ListingDetailView id={params.id} />;
}
