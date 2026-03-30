import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Fetch all user integrations.
 */
export const useIntegrations = () => {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const res = await api.get('/integrations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch integrations');
      return data.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });
};

/**
 * Connect or update an integration.
 */
export const useConnectIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ service, type, authType, credentials }) => {
      const res = await api.post('/integrations', { service, type, authType, credentials });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to connect integration');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};

/**
 * Disconnect an integration.
 */
export const useDisconnectIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (service) => {
      const res = await api.delete(`/integrations/${service}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to disconnect integration');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};

/**
 * Trigger a manual sync for an integration.
 */
export const useSyncIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (service) => {
      const res = await api.post(`/integrations/${service}/sync`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to sync integration');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};
