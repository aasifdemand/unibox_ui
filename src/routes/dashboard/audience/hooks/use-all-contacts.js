// hooks/useAllContacts.js
// Fetches contacts from ALL batches and provides a flat list for the Audience table.
import { useQueries } from '@tanstack/react-query';
import { useBatches, batchKeys } from '../../../../hooks/useBatches';

const API_URL = import.meta.env.VITE_API_URL;

const fetchBatchStatus = async (batchId) => {
    const res = await fetch(`${API_URL}/lists/batch/${batchId}/status`, {
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch batch status');
    return data.data;
};

/**
 * Returns all contacts across all uploaded batches as a flat array.
 * Each contact has a `sourceBatch` field injected for reference.
 */
export const useAllContacts = () => {
    const { data: batches = [], isLoading: isLoadingBatches } = useBatches();

    const batchQueries = useQueries({
        queries: batches.map((batch) => ({
            queryKey: batchKeys.status(batch.id),
            queryFn: () => fetchBatchStatus(batch.id),
            staleTime: 60 * 1000,
            enabled: !!batch.id,
        })),
    });

    const isLoading = isLoadingBatches || batchQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle');

    const contacts = batchQueries.flatMap((query, idx) => {
        const records = query.data?.allRecords || [];
        const batch = batches[idx];
        return records.map((r) => ({
            ...r,
            sourceBatch: batch?.originalFilename || '',
        }));
    });

    return { contacts, isLoading };
};
