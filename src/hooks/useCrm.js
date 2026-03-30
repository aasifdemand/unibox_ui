import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Fetch the CRM pipeline (stages and leads).
 */
export const useCrmPipeline = () => {
  return useQuery({
    queryKey: ['crm-pipeline'],
    queryFn: async () => {
      const res = await api.get('/crm/pipeline');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch pipeline');
      return data.data;
    },
  });
};

/**
 * Fetch available reply categories for mapping.
 */
export const useReplyCategories = () => {
  return useQuery({
    queryKey: ['crm-reply-categories'],
    queryFn: async () => {
      const res = await api.get('/crm/reply-categories');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch reply categories');
      return data.data;
    },
  });
};

/**
 * Move a lead to a specific stage.
 */
export const useMoveLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, stageId }) => {
      const res = await api.post('/crm/leads/move', { leadId, stageId });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to move lead');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline'] });
    },
  });
};

/**
 * Add a new CRM stage.
 */
export const useAddCrmStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color, replyCategory }) => {
      const res = await api.post('/crm/stages', { name, color, replyCategory });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add column');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline'] });
    },
  });
};

/**
 * Reorder CRM stages.
 */
export const useReorderCrmStages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stageIds) => {
      const res = await api.put('/crm/stages/reorder', { stageIds });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reorder columns');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline'] });
    },
  });
};

/**
 * Delete a CRM stage (leads are reassigned to first stage).
 */
export const useDeleteCrmStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stageId) => {
      const res = await api.delete(`/crm/stages/${stageId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete stage');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline'] });
    },
  });
};

/**
 * Update a lead's value, notes, or tags.
 */
export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, value, notes, tags }) => {
      const res = await api.patch(`/crm/leads/${leadId}`, { value, notes, tags });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update lead');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline'] });
    },
  });
};
