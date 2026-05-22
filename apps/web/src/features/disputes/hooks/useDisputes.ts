import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createDispute,
  getUserDisputes,
  getAdminDisputes,
  updateDisputeStatus,
} from '@rentnear/api-client';

export const disputeKeys = {
  all: ['disputes'] as const,
  user: () => [...disputeKeys.all, 'user'] as const,
  admin: (page: number) => [...disputeKeys.all, 'admin', page] as const,
};

export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDispute,
    onSuccess: () => {
      alert('Dispute submitted successfully');
      queryClient.invalidateQueries({ queryKey: disputeKeys.user() });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Failed to submit dispute');
    },
  });
}

export function useUserDisputes() {
  return useQuery({
    queryKey: disputeKeys.user(),
    queryFn: getUserDisputes,
  });
}

export function useAdminDisputes(page = 1) {
  return useQuery({
    queryKey: disputeKeys.admin(page),
    queryFn: () => getAdminDisputes(page),
  });
}

export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; adminNotes?: string } }) =>
      updateDisputeStatus(id, data),
    onSuccess: () => {
      alert('Dispute updated');
      queryClient.invalidateQueries({ queryKey: disputeKeys.admin(1) });
    },
    onError: () => {
      alert('Failed to update dispute');
    },
  });
}
