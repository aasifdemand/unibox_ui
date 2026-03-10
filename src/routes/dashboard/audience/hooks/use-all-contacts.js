// hooks/useAllContacts.js
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

const fetchAllContacts = async (params = {}) => {
    // Send limit, page, searchTerm, filterStatus
    const searchParams = new URLSearchParams({
        limit: params.limit || 10,
        page: params.page || 1,
        searchTerm: params.searchTerm || '',
        filterStatus: params.filterStatus || 'all'
    });

    const res = await fetch(`${API_URL}/lists/contacts?${searchParams.toString()}`, {
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch contacts');
    return data.data; // { contacts: [...], pagination: { total, page, limit, pages } }
};

export const useAllContacts = (params = {}) => {
    const { data, isLoading } = useQuery({
        queryKey: ['contacts', params],
        queryFn: () => fetchAllContacts(params),
        keepPreviousData: true,
    });

    return {
        contacts: data?.contacts || [],
        pagination: data?.pagination || { total: 0, page: 1, limit: 10, pages: 0 },
        isLoading,
    };
};
