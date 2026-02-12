import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useCampaignStore = create((set) => ({
  campaigns: [],
  currentCampaign: null,
  isLoading: false,
  error: null,

  createCampaign: async (campaignData) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/campaigns/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create campaign");
      }

      set((state) => ({
        campaigns: [data.data, ...state.campaigns],
        isLoading: false,
        currentCampaign: data.data,
      }));

      return { success: true, data: data.data };
    } catch (err) {
      console.error("Store error:", err);
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  clearError: () => set({ error: null }),

  activateCampaign: async (campaignId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/campaigns/${campaignId}/activate`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to activate campaign");
      }

      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === campaignId
            ? {
                ...campaign,
                status: "scheduled",
                scheduledAt: data.data.scheduledAt,
                totalRecipients: data.data.recipientsCount,
                pendingRecipients: data.data.recipientsCount,
              }
            : campaign,
        ),
        isLoading: false,
      }));

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  pauseCampaign: async (campaignId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/campaigns/${campaignId}/pause`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to pause campaign");
      }

      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: "paused" }
            : campaign,
        ),
        isLoading: false,
      }));

      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  resumeCampaign: async (campaignId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/campaigns/${campaignId}/resume`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resume campaign");
      }

      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: "running" }
            : campaign,
        ),
        isLoading: false,
      }));

      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  fetchCampaigns: async () => {
    try {
      set({ isLoading: true });

      const res = await fetch(`${API_URL}/campaigns`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch campaigns");
      }

      set({ campaigns: data.data || [], isLoading: false });
      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  getCampaign: async (campaignId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/campaigns/${campaignId}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch campaign");
      }

      set({ currentCampaign: data.data, isLoading: false });
      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  updateCampaign: async (campaignId, updateData) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/campaigns/${campaignId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update campaign");
      }

      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === campaignId ? { ...campaign, ...data.data } : campaign,
        ),
        currentCampaign: data.data,
        isLoading: false,
      }));

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  deleteCampaign: async (campaignId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/campaigns/${campaignId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete campaign");
      }

      set((state) => ({
        campaigns: state.campaigns.filter(
          (campaign) => campaign.id !== campaignId,
        ),
        isLoading: false,
      }));

      return { success: true, message: data.message };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },
}));
