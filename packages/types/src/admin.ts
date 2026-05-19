export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalBookings: number;
  totalPayments: number;
  totalRevenue: number;
}

export interface AdminUserPublic {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string; // ISO
}

export interface AdminUsersPage {
  data: AdminUserPublic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminListingPublic {
  id: string;
  title: string;
  pricePerDay: number;
  isPublished: boolean;
  ownerName: string;
  categoryName: string;
  createdAt: string; // ISO
}

export interface AdminListingsPage {
  data: AdminListingPublic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
