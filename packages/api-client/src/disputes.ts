import { apiClient } from './client';
import type { DisputePublic, DisputesPage } from '@rentnear/types';

/**
 * POST /disputes
 */
export async function createDispute(data: {
  bookingId: string;
  reason: string;
}): Promise<DisputePublic> {
  const res = await apiClient.post<DisputePublic>('/disputes', data);
  return res.data;
}

/**
 * GET /disputes
 */
export async function getUserDisputes(): Promise<DisputePublic[]> {
  const res = await apiClient.get<DisputePublic[]>('/disputes');
  return res.data;
}

/**
 * GET /admin/disputes
 */
export async function getAdminDisputes(page = 1, limit = 20): Promise<DisputesPage> {
  const res = await apiClient.get<DisputesPage>('/admin/disputes', { params: { page, limit } });
  return res.data;
}

/**
 * PATCH /admin/disputes/:id
 */
export async function updateDisputeStatus(
  id: string,
  data: { status: string; adminNotes?: string },
): Promise<DisputePublic> {
  const res = await apiClient.patch<DisputePublic>(`/admin/disputes/${id}`, data);
  return res.data;
}
