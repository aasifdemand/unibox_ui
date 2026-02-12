import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useUploadStore = create((set, get) => ({
  batches: [],
  batchDetails: null, // Store detailed batch info
  verificationResults: [], // Store verification results
  isLoading: false,
  isLoadingDetails: false,
  error: null,

  fetchBatches: async () => {
    try {
      set({ isLoading: true });

      const res = await fetch(`${API_URL}/lists/batches`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch upload batches");
      }

      set({ batches: data.data || [], isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Get detailed batch status with verification results
  getBatchStatus: async (batchId) => {
    try {
      set({ isLoadingDetails: true, error: null });

      const res = await fetch(`${API_URL}/lists/batch/${batchId}/status`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch batch status");
      }

      set({
        batchDetails: data.data,
        verificationResults: data.data.allRecords || [],
        isLoadingDetails: false,
      });

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoadingDetails: false });
      return { success: false, error: err.message };
    }
  },

  // Get verification results with filters
  getVerificationResults: (filters = {}) => {
    const results = get().verificationResults;
    if (!results.length) return [];

    let filtered = [...results];

    // Filter by verification status
    if (filters.status) {
      filtered = filtered.filter(
        (record) => record.verificationStatus === filters.status,
      );
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

    // Filter by risk level (if field exists)
    if (filters.riskLevel && results[0]?.riskLevel !== undefined) {
      filtered = filtered.filter(
        (record) => record.riskLevel === filters.riskLevel,
      );
    }

    // Filter by deliverability (if field exists)
    if (filters.deliverability && results[0]?.deliverability !== undefined) {
      filtered = filtered.filter(
        (record) => record.deliverability === filters.deliverability,
      );
    }

    return filtered;
  },

  getVerificationSummary: () => {
    const v = get().batchDetails?.verification;
    if (!v) return null;

    return {
      total: v.valid + v.invalid + v.risky + v.unverified,
      valid: v.valid,
      invalid: v.invalid,
      risky: v.risky,
      unverified: v.unverified,
      breakdown: get().batchDetails.verificationBreakdown || {},
    };
  },

  // Get verification status distribution
  getVerificationDistribution: () => {
    const batchDetails = get().batchDetails;
    if (!batchDetails?.verificationBreakdown) return [];

    return Object.entries(batchDetails.verificationBreakdown).map(
      ([status, count]) => ({
        status,
        count,
        percentage: ((count / batchDetails.batch.totalRecords) * 100).toFixed(
          1,
        ),
      }),
    );
  },

  // Get high-risk emails (updated to match backend fields)
  getHighRiskEmails: () => {
    const results = get().verificationResults;
    return results.filter(
      (record) =>
        record.verificationStatus === "invalid" ||
        record.verificationStatus === "risky" ||
        record.verificationMeta?.risk === "high" ||
        record.verificationMeta?.deliverability === "low",
    );
  },

  // Get valid emails for sending (updated to match backend fields)
  getValidEmailsForSending: () => {
    const results = get().verificationResults;
    return results.filter(
      (record) =>
        record.verificationStatus === "valid" &&
        record.verificationStatus !== "risky" &&
        record.verificationStatus !== "invalid" &&
        (!record.verificationMeta ||
          (record.verificationMeta?.risk !== "high" &&
            record.verificationMeta?.deliverability !== "low")),
    );
  },

  // Export verification results
  exportVerificationResults: async (batchId, format = "csv") => {
    try {
      set({ isLoading: true });

      // First get the batch details if not already loaded
      if (!get().batchDetails || get().batchDetails.batch.id !== batchId) {
        await get().getBatchStatus(batchId);
      }

      const results = get().verificationResults;

      // Format results for export
      const exportData = results.map((record) => ({
        Email: record.email || "",
        Name: record.name || "",
        Status: record.status || "",
        VerificationStatus: record.verificationStatus || "unverified",
        VerifiedAt: record.verifiedAt
          ? new Date(record.verifiedAt).toLocaleString()
          : "",
        FailureReason: record.failureReason || "",
        CreatedAt: record.createdAt
          ? new Date(record.createdAt).toLocaleString()
          : "",
        // Include verification metadata if available
        ...(record.verificationMeta &&
        typeof record.verificationMeta === "object"
          ? Object.keys(record.verificationMeta).reduce((acc, key) => {
              acc[`Verification_${key}`] = record.verificationMeta[key];
              return acc;
            }, {})
          : {}),
      }));

      let content, fileName, mimeType;

      switch (format.toLowerCase()) {
        case "csv":
          content = convertToCSV(exportData);
          fileName = `verification-results-${batchId}.csv`;
          mimeType = "text/csv";
          break;
        case "json":
          content = JSON.stringify(exportData, null, 2);
          fileName = `verification-results-${batchId}.json`;
          mimeType = "application/json";
          break;
        case "xlsx":
          content = convertToXLSX(exportData);
          fileName = `verification-results-${batchId}.xlsx`;
          mimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
        default:
          throw new Error("Unsupported export format");
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Clear batch details
  clearBatchDetails: () => {
    set({
      batchDetails: null,
      verificationResults: [],
    });
  },

  // Derived totals for dashboard
  getVerificationTotals: () => {
    const batches = get().batches;

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
  },

  // Upload batch
  uploadBatch: async (formData) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/lists/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      await get().fetchBatches();
      set({ isLoading: false });

      return { success: true, data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  deleteBatch: async (batchId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/lists/batch/${batchId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete batch");
      }

      // Remove from local state
      set((state) => ({
        batches: state.batches.filter((batch) => batch.id !== batchId),
        isLoading: false,
      }));

      return { success: true, data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Retry batch
  retryBatch: async (batchId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/lists/batch/${batchId}/retry`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to retry batch");
      }

      await get().fetchBatches();
      set({ isLoading: false });

      return { success: true, data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Export batch
  exportBatch: async (batchId, format = "csv") => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(
        `${API_URL}/lists/batch/${batchId}/export?format=${format}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to export batch");
      }

      // Create and trigger download from blob
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `batch-${batchId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper functions for export
const convertToCSV = (data) => {
  if (!data.length) return "";

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((item) =>
    Object.values(item)
      .map((value) =>
        typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value,
      )
      .join(","),
  );

  return [headers, ...rows].join("\n");
};

const convertToXLSX = (data) => {
  // This would require XLSX library
  // For now, return CSV as fallback
  return convertToCSV(data);
};
