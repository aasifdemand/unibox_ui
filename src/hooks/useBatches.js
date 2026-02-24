// hooks/useBatches.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const batchKeys = {
  all: ['batches'],
  lists: () => [...batchKeys.all, 'list'],
  list: (filters) => [...batchKeys.lists(), { filters }],
  details: () => [...batchKeys.all, 'detail'],
  detail: (id) => [...batchKeys.details(), id],
  status: (id) => [...batchKeys.all, 'status', id],
  results: (id) => [...batchKeys.all, 'results', id],
};

// =========================
// FETCH ALL BATCHES
// =========================
const fetchBatches = async () => {
  const res = await fetch(`${API_URL}/lists/batches`, {
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch batches');
  return data.data || [];
};

export const useBatches = () => {
  return useQuery({
    queryKey: batchKeys.lists(),
    queryFn: fetchBatches,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =========================
// GET BATCH STATUS WITH VERIFICATION RESULTS
// =========================
const fetchBatchStatus = async (batchId) => {
  const res = await fetch(`${API_URL}/lists/batch/${batchId}/status`, {
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch batch status');
  return data.data;
};

export const useBatchStatus = (batchId) => {
  return useQuery({
    queryKey: batchKeys.status(batchId),
    queryFn: () => fetchBatchStatus(batchId),
    enabled: !!batchId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: (query) => {
      // Refetch if still processing
      const data = query.state.data;
      if (data && data.verification?.unverified > 0) {
        return 5000; // 5 seconds
      }
      return false;
    },
  });
};

// =========================
// GET FILTERED VERIFICATION RESULTS
// =========================
export const useVerificationResults = (batchId, filters = {}) => {
  const { data: batchStatus } = useBatchStatus(batchId);

  if (!batchStatus?.allRecords) return [];

  let filtered = [...batchStatus.allRecords];

  // Filter by verification status
  if (filters.status) {
    filtered = filtered.filter((record) => record.verificationStatus === filters.status);
  }

  // Filter by email search
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(
      (record) =>
        record.email?.toLowerCase().includes(searchTerm) ||
        record.name?.toLowerCase().includes(searchTerm),
    );
  }

  // Filter by risk level
  if (filters.riskLevel) {
    filtered = filtered.filter((record) => record.verificationMeta?.risk === filters.riskLevel);
  }

  // Filter by deliverability
  if (filters.deliverability) {
    filtered = filtered.filter(
      (record) => record.verificationMeta?.deliverability === filters.deliverability,
    );
  }

  return filtered;
};

// =========================
// GET VERIFICATION SUMMARY
// =========================
export const useVerificationSummary = (batchId) => {
  const { data: batchStatus } = useBatchStatus(batchId);

  if (!batchStatus?.verification) return null;

  return {
    total:
      batchStatus.verification.valid +
      batchStatus.verification.invalid +
      batchStatus.verification.risky +
      batchStatus.verification.unverified,
    valid: batchStatus.verification.valid,
    invalid: batchStatus.verification.invalid,
    risky: batchStatus.verification.risky,
    unverified: batchStatus.verification.unverified,
    breakdown: batchStatus.verificationBreakdown || {},
  };
};

// =========================
// GET VERIFICATION DISTRIBUTION
// =========================
export const useVerificationDistribution = (batchId) => {
  const { data: batchStatus } = useBatchStatus(batchId);

  if (!batchStatus?.verificationBreakdown) return [];

  return Object.entries(batchStatus.verificationBreakdown).map(([status, count]) => ({
    status,
    count,
    percentage: ((count / batchStatus.batch.totalRecords) * 100).toFixed(1),
  }));
};

// =========================
// GET HIGH RISK EMAILS
// =========================
export const useHighRiskEmails = (batchId) => {
  const { data: batchStatus } = useBatchStatus(batchId);

  if (!batchStatus?.allRecords) return [];

  return batchStatus.allRecords.filter(
    (record) =>
      record.verificationStatus === 'invalid' ||
      record.verificationStatus === 'risky' ||
      record.verificationMeta?.risk === 'high' ||
      record.verificationMeta?.deliverability === 'low',
  );
};

// =========================
// GET VALID EMAILS FOR SENDING
// =========================
export const useValidEmailsForSending = (batchId) => {
  const { data: batchStatus } = useBatchStatus(batchId);

  if (!batchStatus?.allRecords) return [];

  return batchStatus.allRecords.filter(
    (record) =>
      record.verificationStatus === 'valid' &&
      record.verificationStatus !== 'risky' &&
      record.verificationStatus !== 'invalid' &&
      (!record.verificationMeta ||
        (record.verificationMeta?.risk !== 'high' &&
          record.verificationMeta?.deliverability !== 'low')),
  );
};

// =========================
// GET VERIFICATION TOTALS FOR DASHBOARD
// =========================
export const useVerificationTotals = () => {
  const { data: batches = [] } = useBatches();

  return batches.reduce(
    (acc, batch) => {
      const v = batch.verification || {};
      acc.verified += v.verified || 0;
      acc.invalid += v.invalid || 0;
      acc.unverified += v.unverified || 0;
      return acc;
    },
    { verified: 0, invalid: 0, unverified: 0 },
  );
};

// =========================
// UPLOAD BATCH
// =========================
const uploadBatch = async (formData) => {
  const res = await fetch(`${API_URL}/lists/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
};

export const useUploadBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
    },
  });
};

// =========================
// DELETE BATCH
// =========================
const deleteBatch = async (batchId) => {
  const res = await fetch(`${API_URL}/lists/batch/${batchId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete batch');
  return data;
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBatch,
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.removeQueries({ queryKey: batchKeys.status(batchId) });
      queryClient.removeQueries({ queryKey: batchKeys.detail(batchId) });
    },
  });
};

// =========================
// RETRY BATCH
// =========================
const retryBatch = async (batchId) => {
  const res = await fetch(`${API_URL}/lists/batch/${batchId}/retry`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to retry batch');
  return data;
};

export const useRetryBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryBatch,
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: batchKeys.status(batchId) });
    },
  });
};

// =========================
// EXPORT BATCH
// =========================
const exportBatch = async ({ batchId, format = 'csv' }) => {
  const res = await fetch(`${API_URL}/lists/batch/${batchId}/export?format=${format}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to export batch');
  }

  return { blob: await res.blob(), batchId, format };
};

export const useExportBatch = () => {
  return useMutation({
    mutationFn: exportBatch,
    onSuccess: ({ blob, batchId, format }) => {
      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-${batchId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
};

// =========================
// CLEAR BATCH DETAILS (not a mutation, just a helper)
// =========================
export const clearBatchDetails = (queryClient) => {
  queryClient.removeQueries({ queryKey: batchKeys.details() });
};

// =========================
// EXPORT VERIFICATION RESULTS (client-side)
// =========================
const convertToCSV = (data) => {
  if (!data.length) return '';

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((item) =>
    Object.values(item)
      .map((value) => (typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value))
      .join(','),
  );

  return [headers, ...rows].join('\n');
};

export const useExportVerificationResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId, format = 'csv' }) => {
      // Get batch status from cache or fetch it
      const batchStatus = queryClient.getQueryData(batchKeys.status(batchId));

      if (!batchStatus?.allRecords) {
        throw new Error('No verification results found');
      }

      const results = batchStatus.allRecords;

      // Format results for export
      const exportData = results.map((record) => ({
        Email: record.email || '',
        Name: record.name || '',
        Status: record.status || '',
        VerificationStatus: record.verificationStatus || 'unverified',
        VerifiedAt: record.verifiedAt ? new Date(record.verifiedAt).toLocaleString() : '',
        FailureReason: record.failureReason || '',
        CreatedAt: record.createdAt ? new Date(record.createdAt).toLocaleString() : '',
        ...(record.verificationMeta && typeof record.verificationMeta === 'object'
          ? Object.keys(record.verificationMeta).reduce((acc, key) => {
              acc[`Verification_${key}`] = record.verificationMeta[key];
              return acc;
            }, {})
          : {}),
      }));

      let content, fileName, mimeType;

      switch (format.toLowerCase()) {
        case 'csv':
          content = convertToCSV(exportData);
          fileName = `verification-results-${batchId}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          fileName = `verification-results-${batchId}.json`;
          mimeType = 'application/json';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      return { content, fileName, mimeType };
    },
    onSuccess: ({ content, fileName, mimeType }) => {
      // Trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
};
