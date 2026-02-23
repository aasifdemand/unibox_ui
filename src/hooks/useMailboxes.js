// hooks/useMailboxes.js
import { useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const mailboxKeys = {
  all: ["mailboxes"],
  lists: (params) => [...mailboxKeys.all, "list", params],
  detail: (id) => [...mailboxKeys.all, "detail", id],
};

// Fetch mailboxes with pagination and search
const fetchMailboxes = async ({ search = "", page = 1, limit = 10, type = "all" } = {}) => {
  const queryParams = new URLSearchParams({
    search,
    page: page.toString(),
    limit: limit.toString(),
    type,
  });

  const res = await fetch(`${API_URL}/mailboxes?${queryParams}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch mailboxes");
  }

  return await res.json();
};

// Transform sender to mailbox format
const transformSenderToMailbox = (sender) => {
  // Determine the correct type based on the sender's properties
  let type = sender.type;

  if (sender.microsoftId) {
    type = "outlook";
  } else if (sender.googleId) {
    type = "gmail";
  } else if (sender.smtpHost) {
    type = "smtp";
  }

  return {
    id: sender.id,
    type: type,
    email: sender.email,
    displayName: sender.displayName,
    domain: sender.domain,
    isVerified: sender.isVerified,
    isActive: sender.isActive !== undefined ? sender.isActive : true,
    createdAt: sender.createdAt,
    updatedAt: sender.updatedAt,
    lastSyncAt: sender.lastInboxSyncAt || sender.lastUsedAt || null,
    expiresAt: sender.expiresAt,
    stats: {
      dailySent: sender.dailySentCount || 0,
    },
  };
};

// Fetch mailboxes with pagination
export const useMailboxes = ({
  search = "",
  page = 1,
  limit = 10,
  type = "all",
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: mailboxKeys.lists({ search, page, limit, type }),
    queryFn: async () => {
      const response = await fetchMailboxes({ search, page, limit, type });
      const { data, meta } = response;

      const transformedData = (data || []).map(transformSenderToMailbox);

      return {
        mailboxes: transformedData,
        meta: meta || {
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
    retry: 1,
  });
};

// Get mailbox by ID
export const useMailbox = (mailboxId) => {
  return useQuery({
    queryKey: mailboxKeys.detail(mailboxId),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/mailboxes/${mailboxId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Mailbox not found");
      }

      const response = await res.json();
      return transformSenderToMailbox(response.data);
    },
    enabled: !!mailboxId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

// Optional: Add a mutation for refreshing mailboxes
export const useRefreshMailboxes = () => {
  const queryClient = useQueryClient();

  return {
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: mailboxKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mailboxKeys.all });
    },
  };
};
