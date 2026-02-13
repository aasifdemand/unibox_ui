// hooks/useSmtp.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const smtpKeys = {
  all: ["smtp"],
  messages: (mailboxId, page, folder) => [
    "smtp",
    mailboxId,
    "messages",
    page,
    folder,
  ],
  message: (mailboxId, messageId) => ["smtp", mailboxId, "message", messageId],
  folders: (mailboxId) => ["smtp", mailboxId, "folders"],
  status: (mailboxId) => ["smtp", mailboxId, "status"],
  sent: (mailboxId) => ["smtp", mailboxId, "sent"],
  drafts: (mailboxId) => ["smtp", mailboxId, "drafts"],
  trash: (mailboxId) => ["smtp", mailboxId, "trash"],
  spam: (mailboxId) => ["smtp", mailboxId, "spam"],
  archive: (mailboxId) => ["smtp", mailboxId, "archive"],
};

// =========================
// QUERIES
// =========================

// Get SMTP messages
export const useSmtpMessagesQuery = (
  mailboxId,
  page = 1,
  limit = 10,
  folder = "INBOX",
) => {
  return useQuery({
    queryKey: smtpKeys.messages(mailboxId, page, folder),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/messages?page=${page}&limit=${limit}&folder=${encodeURIComponent(folder)}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch messages");
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!mailboxId,
  });
};

// Get sent messages
export const useSmtpSentMessagesQuery = (mailboxId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: smtpKeys.sent(mailboxId, page),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/sent?page=${page}&limit=${limit}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch sent messages");
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get draft messages
export const useSmtpDraftMessagesQuery = (mailboxId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: smtpKeys.drafts(mailboxId, page),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/drafts?page=${page}&limit=${limit}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch drafts");
      return data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!mailboxId,
  });
};

// Get trash messages
export const useSmtpTrashMessagesQuery = (mailboxId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: smtpKeys.trash(mailboxId, page),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/trash?page=${page}&limit=${limit}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch trash messages");
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get spam messages
export const useSmtpSpamMessagesQuery = (mailboxId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: smtpKeys.spam(mailboxId, page),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/spam?page=${page}&limit=${limit}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch spam messages");
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get archive messages
export const useSmtpArchiveMessagesQuery = (
  mailboxId,
  page = 1,
  limit = 10,
) => {
  return useQuery({
    queryKey: smtpKeys.archive(mailboxId, page),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/archive?page=${page}&limit=${limit}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch archive messages");
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get single message
export const useSmtpMessageQuery = (mailboxId, messageId, folder = "INBOX") => {
  return useQuery({
    queryKey: smtpKeys.message(mailboxId, messageId),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/messages/${messageId}?folder=${encodeURIComponent(folder)}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch message");
      return data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!mailboxId && !!messageId,
  });
};

// Get folders
export const useSmtpFoldersQuery = (mailboxId) => {
  return useQuery({
    queryKey: smtpKeys.folders(mailboxId),
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/folders`,
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

// Get mailbox status
export const useSmtpStatusQuery = (mailboxId) => {
  return useQuery({
    queryKey: smtpKeys.status(mailboxId),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/mailboxes/smtp/${mailboxId}/status`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get status");
      return data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!mailboxId,
  });
};

// =========================
// MUTATIONS
// =========================

// Mark as read
export const useMarkSmtpAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, folder = "INBOX" }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/messages/${messageId}/read?folder=${encodeURIComponent(folder)}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark as read");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ["smtp", mailboxId] });
    },
  });
};

// Mark as unread
export const useMarkSmtpAsUnreadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, folder = "INBOX" }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/messages/${messageId}/unread?folder=${encodeURIComponent(folder)}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark as unread");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ["smtp", mailboxId] });
    },
  });
};

// Delete message
export const useDeleteSmtpMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, folder = "INBOX" }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/messages/${messageId}?folder=${encodeURIComponent(folder)}`,
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
      queryClient.invalidateQueries({ queryKey: ["smtp", mailboxId] });
    },
  });
};

// Move message
export const useMoveSmtpMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mailboxId,
      messageId,
      sourceFolder,
      targetFolder,
    }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/messages/${messageId}/move`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceFolder, targetFolder }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to move message");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ["smtp", mailboxId] });
    },
  });
};

// Sync mailbox
export const useSyncSmtpMailboxMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, folder = "INBOX" }) => {
      let url = `${API_URL}/mailboxes/smtp/${mailboxId}/sync`;
      if (folder) url += `?folder=${encodeURIComponent(folder)}`;

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to sync mailbox");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ["smtp", mailboxId] });
      queryClient.invalidateQueries({ queryKey: ["mailboxes"] });
    },
  });
};

// Disconnect mailbox
export const useDisconnectSmtpMailboxMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/disconnect`,
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
      queryClient.removeQueries({ queryKey: ["smtp", mailboxId] });
      queryClient.invalidateQueries({ queryKey: ["mailboxes"] });
    },
  });
};
