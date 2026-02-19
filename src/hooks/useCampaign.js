// hooks/useCampaigns.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const campaignKeys = {
  all: ["campaigns"],
  lists: () => [...campaignKeys.all, "list"],
  list: (filters) => [...campaignKeys.lists(), { filters }],
  details: () => [...campaignKeys.all, "detail"],
  detail: (id) => [...campaignKeys.details(), id],
  replies: (id) => [...campaignKeys.detail(id), "replies"],
  recipientReplies: (campaignId, recipientId) => [
    ...campaignKeys.all,
    "replies",
    { campaignId, recipientId },
  ],
};

// =========================
// FETCH ALL CAMPAIGNS
// =========================
const fetchCampaigns = async () => {
  const res = await fetch(`${API_URL}/campaigns`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch campaigns");
  return data.data || [];
};

export const useCampaigns = () => {
  return useQuery({
    queryKey: campaignKeys.lists(),
    queryFn: fetchCampaigns,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =========================
// FETCH SINGLE CAMPAIGN
// =========================
const fetchCampaign = async (campaignId) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch campaign");
  return data.data;
};

export const useCampaign = (campaignId) => {
  return useQuery({
    queryKey: campaignKeys.detail(campaignId),
    queryFn: () => fetchCampaign(campaignId),
    enabled: !!campaignId,
    staleTime: 2 * 60 * 1000,
  });
};

// =========================
// FETCH CAMPAIGN REPLIES
// =========================
const fetchCampaignReplies = async (campaignId) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}/replies`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch replies");
  return data.data || [];
};

export const useCampaignReplies = (campaignId) => {
  return useQuery({
    queryKey: campaignKeys.replies(campaignId),
    queryFn: () => fetchCampaignReplies(campaignId),
    enabled: !!campaignId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: () => {
      // Refetch if there are pending replies or campaign is running

      const campaign = queryClient.getQueryData(
        campaignKeys.detail(campaignId),
      );
      if (campaign?.status === "running" || campaign?.status === "sending") {
        return 10000; // 10 seconds
      }
      return false;
    },
  });
};

// =========================
// FETCH RECIPIENT REPLY
// =========================
const fetchRecipientReply = async ({ campaignId, recipientId }) => {
  const res = await fetch(
    `${API_URL}/campaigns/${campaignId}/replies?recipientId=${recipientId}`,
    {
      credentials: "include",
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Failed to fetch recipient reply");
  return data.data;
};

export const useRecipientReply = (campaignId, recipientId) => {
  return useQuery({
    queryKey: campaignKeys.recipientReplies(campaignId, recipientId),
    queryFn: () => fetchRecipientReply({ campaignId, recipientId }),
    enabled: !!campaignId && !!recipientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// =========================
// CREATE CAMPAIGN
// =========================
const createCampaign = async (campaignData) => {
  const res = await fetch(`${API_URL}/campaigns/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(campaignData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create campaign");
  return data.data;
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: (newCampaign) => {
      // Update campaigns list cache
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return [newCampaign, ...old];
      });
      // Set as current campaign
      queryClient.setQueryData(
        campaignKeys.detail(newCampaign.id),
        newCampaign,
      );
    },
  });
};

// =========================
// UPDATE CAMPAIGN
// =========================
const updateCampaign = async ({ campaignId, ...updateData }) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update campaign");
  return data.data;
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCampaign,
    onSuccess: (updatedCampaign, { campaignId }) => {
      // Update in lists
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return old.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, ...updatedCampaign }
            : campaign,
        );
      });
      // Update detail query
      queryClient.setQueryData(
        campaignKeys.detail(campaignId),
        updatedCampaign,
      );
    },
  });
};

// =========================
// DELETE CAMPAIGN
// =========================
const deleteCampaign = async (campaignId) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete campaign");
  return { campaignId, message: data.message };
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: (_, campaignId) => {
      // Remove from lists
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return old.filter((campaign) => campaign.id !== campaignId);
      });
      // Remove detail query
      queryClient.removeQueries({ queryKey: campaignKeys.detail(campaignId) });
      // Remove replies queries
      queryClient.removeQueries({ queryKey: campaignKeys.replies(campaignId) });
    },
  });
};

// =========================
// ACTIVATE CAMPAIGN
// =========================
const activateCampaign = async (campaignId) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}/activate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to activate campaign");
  return data.data;
};

export const useActivateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateCampaign,
    onSuccess: (data, campaignId) => {
      // Update campaign status in lists
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return old.map((campaign) =>
          campaign.id === campaignId
            ? {
                ...campaign,
                status: "scheduled",
                scheduledAt: data.scheduledAt,
                totalRecipients: data.recipientsCount,
                pendingRecipients: data.recipientsCount,
              }
            : campaign,
        );
      });
      // Update detail query
      queryClient.setQueryData(campaignKeys.detail(campaignId), (old) => ({
        ...old,
        status: "scheduled",
        scheduledAt: data.scheduledAt,
        totalRecipients: data.recipientsCount,
        pendingRecipients: data.recipientsCount,
      }));
    },
  });
};

// =========================
// PAUSE CAMPAIGN
// =========================
const pauseCampaign = async (campaignId) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}/pause`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to pause campaign");
  return data;
};

export const usePauseCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pauseCampaign,
    onSuccess: (data, campaignId) => {
      console.log("✅ Campaign paused successfully, invalidating cache");

      // Force refetch of all campaign queries
      queryClient.invalidateQueries({
        queryKey: campaignKeys.lists(),
        refetchType: "active",
      });

      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(campaignId),
        refetchType: "active",
      });

      // Also directly update the cache for immediate UI feedback
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return old.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: "paused" }
            : campaign,
        );
      });

      queryClient.setQueryData(campaignKeys.detail(campaignId), (old) => ({
        ...old,
        status: "paused",
      }));
    },
    onError: (error) => {
      console.error("❌ Failed to pause campaign:", error);
    },
  });
};

// =========================
// RESUME CAMPAIGN
// =========================
const resumeCampaign = async (campaignId) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}/resume`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to resume campaign");
  return data;
};

export const useResumeCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resumeCampaign,
    onSuccess: (_, campaignId) => {
      // Update campaign status
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return old.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: "running" }
            : campaign,
        );
      });
      queryClient.setQueryData(campaignKeys.detail(campaignId), (old) => ({
        ...old,
        status: "running",
      }));
    },
  });
};

// =========================
// DUPLICATE CAMPAIGN
// =========================
const duplicateCampaign = async (campaignId) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}/duplicate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to duplicate campaign");
  return data.data;
};

export const useDuplicateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateCampaign,
    onSuccess: (newCampaign) => {
      // Add to lists
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return [newCampaign, ...old];
      });
    },
  });
};

// =========================
// GET CAMPAIGN STATS
// =========================
const fetchCampaignStats = async (campaignId) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}/stats`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Failed to fetch campaign stats");
  return data.data;
};

export const useCampaignStats = (campaignId) => {
  return useQuery({
    queryKey: [...campaignKeys.detail(campaignId), "stats"],
    queryFn: () => fetchCampaignStats(campaignId),
    enabled: !!campaignId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: () => {
      // Refetch if campaign is running
      const campaign = queryClient.getQueryData(
        campaignKeys.detail(campaignId),
      );
      if (campaign?.status === "running" || campaign?.status === "sending") {
        return 10000; // 10 seconds
      }
      return false;
    },
  });
};

// =========================
// BULK CAMPAIGN OPERATIONS
// =========================
const bulkDeleteCampaigns = async (campaignIds) => {
  const res = await fetch(`${API_URL}/campaigns/bulk/delete`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ campaignIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete campaigns");
  return { campaignIds, message: data.message };
};

export const useBulkDeleteCampaigns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteCampaigns,
    onSuccess: (_, campaignIds) => {
      // Remove from lists
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return old.filter((campaign) => !campaignIds.includes(campaign.id));
      });
      // Remove individual detail queries
      campaignIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: campaignKeys.detail(id) });
        queryClient.removeQueries({ queryKey: campaignKeys.replies(id) });
      });
    },
  });
};

const bulkPauseCampaigns = async (campaignIds) => {
  const res = await fetch(`${API_URL}/campaigns/bulk/pause`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ campaignIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to pause campaigns");
  return { campaignIds, message: data.message };
};

export const useBulkPauseCampaigns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkPauseCampaigns,
    onSuccess: (_, campaignIds) => {
      // Update status in lists
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return old.map((campaign) =>
          campaignIds.includes(campaign.id)
            ? { ...campaign, status: "paused" }
            : campaign,
        );
      });
      // Update individual detail queries
      campaignIds.forEach((id) => {
        queryClient.setQueryData(campaignKeys.detail(id), (old) => ({
          ...old,
          status: "paused",
        }));
      });
    },
  });
};

const bulkResumeCampaigns = async (campaignIds) => {
  const res = await fetch(`${API_URL}/campaigns/bulk/resume`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ campaignIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to resume campaigns");
  return { campaignIds, message: data.message };
};

export const useBulkResumeCampaigns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkResumeCampaigns,
    onSuccess: (_, campaignIds) => {
      // Update status in lists
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return old.map((campaign) =>
          campaignIds.includes(campaign.id)
            ? { ...campaign, status: "running" }
            : campaign,
        );
      });
      // Update individual detail queries
      campaignIds.forEach((id) => {
        queryClient.setQueryData(campaignKeys.detail(id), (old) => ({
          ...old,
          status: "running",
        }));
      });
    },
  });
};

// =========================
// ARCHIVE / UNARCHIVE CAMPAIGN
// =========================
const archiveCampaign = async (campaignId) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}/archive`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to archive campaign");
  return data;
};

export const useArchiveCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveCampaign,
    onSuccess: (_, campaignId) => {
      // Update status
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return old.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: "archived" }
            : campaign,
        );
      });
      queryClient.setQueryData(campaignKeys.detail(campaignId), (old) => ({
        ...old,
        status: "archived",
      }));
    },
  });
};

const unarchiveCampaign = async (campaignId) => {
  const res = await fetch(`${API_URL}/campaigns/${campaignId}/unarchive`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to unarchive campaign");
  return data;
};

export const useUnarchiveCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchiveCampaign,
    onSuccess: (_, campaignId) => {
      // Update status
      queryClient.setQueryData(campaignKeys.lists(), (old = []) => {
        return old.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: "draft" }
            : campaign,
        );
      });
      queryClient.setQueryData(campaignKeys.detail(campaignId), (old) => ({
        ...old,
        status: "draft",
      }));
    },
  });
};
