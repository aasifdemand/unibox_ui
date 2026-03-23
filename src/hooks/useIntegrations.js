import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

/**
 * Fetch all user integrations.
 */
export const useIntegrations = () => {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/integrations`, { credentials: 'include' });
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
      const res = await fetch(`${API_URL}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, type, authType, credentials }),
        credentials: 'include',
      });
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
      const res = await fetch(`${API_URL}/integrations/${service}`, {
        method: 'DELETE',
        credentials: 'include',
      });
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
      const res = await fetch(`${API_URL}/integrations/${service}/sync`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to sync integration');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};
