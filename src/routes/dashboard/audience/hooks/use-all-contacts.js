// hooks/useAllContacts.js
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../lib/api';

const fetchAllContacts = async (params = {}, signal) => {
  const searchParams = new URLSearchParams({
    limit: params.limit || 10,
    page: params.page || 1,
    searchTerm: params.searchTerm || '',
    filterStatus: Array.isArray(params.filterStatus)
      ? params.filterStatus.length !== 0 ? params.filterStatus.join(',') : 'all'
      : params.filterStatus || 'all',
  });

  const res = await api.get(`/lists/contacts?${searchParams.toString()}`, { signal });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to fetch contacts');
  }
  const data = await res.json();
  return data.data;
};

export const useAllContacts = (params = {}) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['contacts', params],
    queryFn: ({ signal }) => fetchAllContacts(params, signal),
    keepPreviousData: true,
  });

  return {
    contacts: data?.contacts || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10, pages: 0 },
    isLoading,
    refetch,
  };
};
