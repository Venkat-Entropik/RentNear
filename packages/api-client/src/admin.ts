import { apiClient } from './client';
import type { AdminStats, AdminUsersPage, AdminListingsPage } from '@rentnear/types';

/**
 * GET /admin/stats
 */
export async function getAdminStats(): Promise<AdminStats> {
  const res = await apiClient.get<AdminStats>('/admin/stats');
  return res.data;
}

/**
 * GET /admin/users
 */
export async function getAdminUsers(page = 1, limit = 20): Promise<AdminUsersPage> {
  const res = await apiClient.get<AdminUsersPage>('/admin/users', { params: { page, limit } });
  return res.data;
}

/**
 * GET /admin/listings
 */
export async function getAdminListings(page = 1, limit = 20): Promise<AdminListingsPage> {
  const res = await apiClient.get<AdminListingsPage>('/admin/listings', {
    params: { page, limit },
  });
  return res.data;
}

/**
 * POST /admin/promote-me
 * Temporary test endpoint
 */
export async function promoteMeToAdmin(): Promise<{ success: boolean; message: string }> {
  const res = await apiClient.post('/admin/promote-me');
  return res.data;
}
