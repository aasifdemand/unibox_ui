import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch the CRM pipeline (stages and leads).
 */
export const useCrmPipeline = () => {
  return useQuery({
    queryKey: ['crm-pipeline'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/crm/pipeline`, { credentials: 'include' });
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
      const res = await fetch(`${API_URL}/crm/reply-categories`, { credentials: 'include' });
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
      const res = await fetch(`${API_URL}/crm/leads/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, stageId }),
        credentials: 'include',
      });
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
      const res = await fetch(`${API_URL}/crm/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, replyCategory }),
        credentials: 'include',
      });
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
      const res = await fetch(`${API_URL}/crm/stages/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageIds }),
        credentials: 'include',
      });
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
      const res = await fetch(`${API_URL}/crm/stages/${stageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
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
      const res = await fetch(`${API_URL}/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, notes, tags }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update lead');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pipeline'] });
    },
  });
};
