import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// Query keys
export const mailboxKeys = {
  all: ['mailboxes'],
  lists: (params) => [...mailboxKeys.all, 'list', params],
  detail: (id) => [...mailboxKeys.all, 'detail', id],
};

// Fetch mailboxes with pagination and search
const fetchMailboxes = async ({ search = '', page = 1, limit = 10, type = 'all', signal } = {}) => {
  const queryParams = new URLSearchParams({
    search,
    page: page.toString(),
    limit: limit.toString(),
    type,
  });

  const res = await api.get(`/senders?${queryParams}`, { signal });
  return await res.json();
};

// Transform sender to mailbox format
const transformSenderToMailbox = (sender) => {
  return {
    id: sender.id,
    type: sender.type,
    email: sender.email,
    displayName: sender.displayName,
    domain: sender.domain,
    isVerified: sender.isVerified,
    isActive: sender.isActive !== undefined ? sender.isActive : true,
    createdAt: sender.createdAt,
    updatedAt: sender.updatedAt,
    lastSyncAt: (() => {
      const dates = [sender.lastInboxSyncAt, sender.lastUsedAt].filter(Boolean);
      if (dates.length === 0) return null;
      return dates.sort((a, b) => new Date(b) - new Date(a))[0];
    })(),
    expiresAt: sender.expiresAt,
    /* Configuration Fields */
    minTimeGap: sender.minTimeGap || 1,
    designation: sender.designation || '',
    signature: sender.signature || '',
    bccEmail: sender.bccEmail || '',
    replyToAddress: sender.replyToAddress || '',
    useCustomTrackingDomain: sender.useCustomTrackingDomain || false,
    customTrackingDomain: sender.customTrackingDomain || '',
    /* Dynamic Stats Header */
    campaignCount: sender.campaignCount || 0,
    leadCount: sender.leadCount || 0,
    stats: {
      dailySent: sender.dailySentCount || 0,
      dailyLimit: sender.dailyLimit || 500,
      reputationScore: sender.stats?.reputationScore || 0,
      healthStatus: sender.stats?.healthStatus || 'unknown',
      warmupEnabled: sender.warmupEnabled || false,
      warmupStatus: sender.warmupStatus || 'disabled',
      warmupDailyLimit: sender.warmupDailyLimit || 20,
      warmupCurrentSent: sender.warmupCurrentSent || 0,
      warmupReplyRate: sender.warmupReplyRate || 0.3,
    },
  };
};

// Fetch mailboxes with pagination
export const useMailboxes = ({
  search = '',
  page = 1,
  limit = 10,
  type = 'all',
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: mailboxKeys.lists({ search, page, limit, type }),
    queryFn: async ({ signal }) => {
      const response = await fetchMailboxes({ search, page, limit, type, signal });
      const { data, pagination } = response;

      const transformedData = (data || []).map(transformSenderToMailbox);

      return {
        mailboxes: transformedData,
        meta: pagination || {
          total: transformedData.length,
          page,
          limit,
          totalPages: 1,
        },
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    retry: 1,
  });
};

// Get mailbox by ID
export const useMailbox = (mailboxId) => {
  return useQuery({
    queryKey: mailboxKeys.detail(mailboxId),
    queryFn: async ({ signal }) => {
      const res = await api.get(`/senders/${mailboxId}`, { signal });
      const response = await res.json();
      return transformSenderToMailbox(response.data);
    },
    enabled: !!mailboxId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

// Invalidating queries
export const useRefreshMailboxes = () => {
  const queryClient = useQueryClient();

  return {
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: mailboxKeys.all });
    },
  };
};

export const useUpdateMailbox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await api.put(`/senders/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mailboxKeys.all });
    },
  });
};

export const useUpdateWarmupSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderId, ...settings }) => {
      const res = await api.put(`/senders/${senderId}/warmup`, settings);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mailboxKeys.all });
    },
  });
};

export const useDisconnectMailbox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mailboxId) => {
      const res = await api.delete(`/mailboxes/${mailboxId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to disconnect');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mailboxKeys.all });
    },
  });
};
