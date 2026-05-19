export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface BookingPublic {
  id: string;
  listingId: string;
  renterId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalPrice: number;
  status: BookingStatus;
  createdAt: string; // ISO string

  // We optionally include listing details and renter details if fetched with joins
  listing?: {
    id: string;
    title: string;
    pricePerDay: number;
    city: string;
    ownerId: string;
    media: { url: string; isPrimary: boolean }[];
  };

  renter?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface CreateBookingInput {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface UpdateBookingStatusInput {
  status: BookingStatus;
}
