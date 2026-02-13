// hooks/useOutlook.js
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const outlookKeys = {
  all: ["outlook"],
  messages: (mailboxId, folderId) => [
    "outlook",
    mailboxId,
    "messages",
    folderId,
  ],
  message: (mailboxId, messageId) => [
    "outlook",
    mailboxId,
    "message",
    messageId,
  ],
  folders: (mailboxId) => ["outlook", mailboxId, "folders"],
  sent: (mailboxId) => ["outlook", mailboxId, "sent"],
  trash: (mailboxId) => ["outlook", mailboxId, "trash"],
  spam: (mailboxId) => ["outlook", mailboxId, "spam"],
  archive: (mailboxId) => ["outlook", mailboxId, "archive"],
  outbox: (mailboxId) => ["outlook", mailboxId, "outbox"],
  drafts: (mailboxId) => ["outlook", mailboxId, "drafts"],
};

// =========================
// QUERIES
// =========================

// Get Outlook messages
export const useOutlookMessagesQuery = (
  mailboxId,
  folderId = "inbox",
  top = 10,
) => {
  return useInfiniteQuery({
    queryKey: outlookKeys.messages(mailboxId, folderId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/messages?top=${top}`;
      if (pageParam) url += `&pageToken=${pageParam}`;
      if (folderId && folderId !== "inbox") url += `&folderId=${folderId}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get sent messages
export const useOutlookSentMessagesQuery = (mailboxId, top = 10) => {
  return useInfiniteQuery({
    queryKey: outlookKeys.sent(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/sent?top=${top}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch sent messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get trash messages
export const useOutlookTrashMessagesQuery = (mailboxId, top = 10) => {
  return useInfiniteQuery({
    queryKey: outlookKeys.trash(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/trash?top=${top}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch trash messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get spam messages
export const useOutlookSpamMessagesQuery = (mailboxId, top = 10) => {
  return useInfiniteQuery({
    queryKey: outlookKeys.spam(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/spam?top=${top}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch spam messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get archive messages
export const useOutlookArchiveMessagesQuery = (mailboxId, top = 10) => {
  return useInfiniteQuery({
    queryKey: outlookKeys.archive(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/archive?top=${top}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch archive messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get outbox messages
export const useOutlookOutboxMessagesQuery = (mailboxId, top = 10) => {
  return useInfiniteQuery({
    queryKey: outlookKeys.outbox(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/outbox?top=${top}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch outbox messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get drafts
export const useOutlookDraftsQuery = (mailboxId, top = 10) => {
  return useInfiniteQuery({
    queryKey: outlookKeys.drafts(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/drafts?top=${top}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch drafts");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!mailboxId,
  });
};

// Get single message
export const useOutlookMessageQuery = (mailboxId, messageId) => {
  return useQuery({
    queryKey: outlookKeys.message(mailboxId, messageId),
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch message");
      return data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!mailboxId && !!messageId,
  });
};

// Get folders
export const useOutlookFoldersQuery = (mailboxId) => {
  return useQuery({
    queryKey: outlookKeys.folders(mailboxId),
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/folders`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch folders");
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!mailboxId,
  });
};

// =========================
// MUTATIONS
// =========================

// Mark as read
export const useMarkOutlookAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/read`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark as read");
      return data;
    },
    onSuccess: (_, { mailboxId, messageId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "messages"],
      });
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "message", messageId],
      });
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "folders"],
      });
    },
  });
};

// Delete message
export const useDeleteOutlookMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete message");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ["outlook", mailboxId] });
    },
  });
};

// Sync mailbox
export const useSyncOutlookMailboxMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, folderId = "inbox" }) => {
      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/sync`;
      if (folderId) url += `?folderId=${folderId}`;

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to sync mailbox");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ["outlook", mailboxId] });
      queryClient.invalidateQueries({ queryKey: ["mailboxes"] });
    },
  });
};

// Refresh token
export const useRefreshOutlookTokenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to refresh token");
      return data;
    },
    onSuccess: (data, { mailboxId }) => {
      if (data.data?.expiresAt) {
        queryClient.setQueryData(["mailboxes", "detail", mailboxId], (old) => ({
          ...old,
          expiresAt: data.data.expiresAt,
        }));
      }
    },
  });
};

// Disconnect mailbox
export const useDisconnectOutlookMailboxMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/disconnect`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to disconnect");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.removeQueries({ queryKey: ["outlook", mailboxId] });
      queryClient.invalidateQueries({ queryKey: ["mailboxes"] });
    },
  });
};
