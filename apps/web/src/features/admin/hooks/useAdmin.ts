import { useQuery } from '@tanstack/react-query';
import { getAdminStats, getAdminUsers, getAdminListings } from '@rentnear/api-client';

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  users: (page: number) => [...adminKeys.all, 'users', page] as const,
  listings: (page: number) => [...adminKeys.all, 'listings', page] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: getAdminStats,
  });
}

export function useAdminUsers(page = 1) {
  return useQuery({
    queryKey: adminKeys.users(page),
    queryFn: () => getAdminUsers(page),
  });
}

export function useAdminListings(page = 1) {
  return useQuery({
    queryKey: adminKeys.listings(page),
    queryFn: () => getAdminListings(page),
  });
}
