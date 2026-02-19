import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const smtpKeys = {
  all: ["smtp"],
  messages: (mailboxId, folder, page = 1) => [
    "smtp",
    mailboxId,
    "messages",
    folder,
    page,
  ],
  message: (mailboxId, messageId) => ["smtp", mailboxId, "message", messageId],
  folders: (mailboxId) => ["smtp", mailboxId, "folders"],
  status: (mailboxId) => ["smtp", mailboxId, "status"],
  sent: (mailboxId, page = 1) => ["smtp", mailboxId, "sent", page],
  drafts: (mailboxId, page = 1) => ["smtp", mailboxId, "drafts", page],
  trash: (mailboxId, page = 1) => ["smtp", mailboxId, "trash", page],
  spam: (mailboxId, page = 1) => ["smtp", mailboxId, "spam", page],
  archive: (mailboxId, page = 1) => ["smtp", mailboxId, "archive", page],
  search: (mailboxId, query) => ["smtp", mailboxId, "search", query],
  attachments: (mailboxId, messageId) => [
    "smtp",
    mailboxId,
    "attachments",
    messageId,
  ],
};

// =========================
// QUERIES
// =========================

// Get SMTP messages
export const useSmtpMessagesQuery = (
  mailboxId,
  page = 1,
  folder = "INBOX",
) => {
  return useQuery({
    queryKey: smtpKeys.messages(mailboxId, folder),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/messages?page=${page}&limit=10&folder=${encodeURIComponent(folder)}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch messages");
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get sent messages
export const useSmtpSentMessagesQuery = (mailboxId, page = 1) => {
  return useQuery({
    queryKey: smtpKeys.sent(mailboxId),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/sent?page=${page}&limit=10`;
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
export const useSmtpDraftMessagesQuery = (mailboxId, page = 1) => {
  return useQuery({
    queryKey: smtpKeys.drafts(mailboxId),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/drafts?page=${page}&limit=10`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch drafts");
      return data.data;
    },
    staleTime: 1 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get trash messages
export const useSmtpTrashMessagesQuery = (mailboxId, page = 1) => {
  return useQuery({
    queryKey: smtpKeys.trash(mailboxId),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/trash?page=${page}&limit=10`;
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
export const useSmtpSpamMessagesQuery = (mailboxId, page = 1) => {
  return useQuery({
    queryKey: smtpKeys.spam(mailboxId),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/spam?page=${page}&limit=10`;
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
export const useSmtpArchiveMessagesQuery = (mailboxId, page = 1) => {
  return useQuery({
    queryKey: smtpKeys.archive(mailboxId),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/archive?page=${page}&limit=10`;
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
    staleTime: 30 * 60 * 1000,
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
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch folders");
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
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
    staleTime: 1 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Search messages
export const useSmtpSearchQuery = (
  mailboxId,
  query,
  folder = "INBOX",
  limit = 50,
) => {
  return useQuery({
    queryKey: smtpKeys.search(mailboxId, query),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/search?query=${encodeURIComponent(query)}&folder=${encodeURIComponent(folder)}&limit=${limit}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to search messages");
      return data.data;
    },
    staleTime: 1 * 60 * 1000,
    enabled: !!mailboxId && !!query,
  });
};

// Get attachments
export const useSmtpAttachmentsQuery = (
  mailboxId,
  messageId,
  folder = "INBOX",
) => {
  return useQuery({
    queryKey: smtpKeys.attachments(mailboxId, messageId),
    queryFn: async () => {
      const url = `${API_URL}/mailboxes/smtp/${mailboxId}/messages/${messageId}/attachments?folder=${encodeURIComponent(folder)}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch attachments");
      return data.data;
    },
    staleTime: 30 * 60 * 1000,
    enabled: !!mailboxId && !!messageId,
  });
};

// =========================
// MUTATIONS
// =========================

// Send email
export const useSendSmtpMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mailboxId,
      to,
      cc,
      bcc,
      subject,
      body,
      html,
      attachments,
    }) => {
      const res = await fetch(`${API_URL}/mailboxes/smtp/${mailboxId}/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, cc, bcc, subject, body, html, attachments }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ["smtp", mailboxId, "sent"] });
    },
  });
};

// Create draft
export const useCreateSmtpDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mailboxId,
      to,
      cc,
      bcc,
      subject,
      body,
      html,
      attachments,
    }) => {
      const res = await fetch(`${API_URL}/mailboxes/smtp/${mailboxId}/drafts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, cc, bcc, subject, body, html, attachments }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create draft");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["smtp", mailboxId, "drafts"],
      });
    },
  });
};

// Update draft
export const useUpdateSmtpDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mailboxId,
      messageId,
      to,
      cc,
      bcc,
      subject,
      body,
      html,
      attachments,
    }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/drafts/${messageId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to,
            cc,
            bcc,
            subject,
            body,
            html,
            attachments,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update draft");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["smtp", mailboxId, "drafts"],
      });
    },
  });
};

// Delete draft
export const useDeleteSmtpDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/drafts/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete draft");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["smtp", mailboxId, "drafts"],
      });
    },
  });
};

// Send draft
export const useSendSmtpDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/drafts/${messageId}/send`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send draft");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["smtp", mailboxId, "drafts"],
      });
      queryClient.invalidateQueries({ queryKey: ["smtp", mailboxId, "sent"] });
    },
  });
};

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

// Toggle flag (star)
export const useToggleSmtpFlagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, flagged, folder = "INBOX" }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/messages/${messageId}/flag`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flagged, folder }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle flag");
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

// Copy message
export const useCopySmtpMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mailboxId,
      messageId,
      sourceFolder = "INBOX",
      targetFolder,
    }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/messages/${messageId}/copy`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceFolder, targetFolder }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to copy message");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ["smtp", mailboxId] });
    },
  });
};

// Batch operations
export const useBatchSmtpOperationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mailboxId,
      messageIds,
      operation,
      targetFolder,
      folder = "INBOX",
    }) => {
      const res = await fetch(`${API_URL}/mailboxes/smtp/${mailboxId}/batch`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds, operation, targetFolder, folder }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to perform batch operation");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ["smtp", mailboxId] });
    },
  });
};

// Download attachment
export const useDownloadSmtpAttachment = () => {
  return useMutation({
    mutationFn: async ({
      mailboxId,
      messageId,
      attachmentId,
      folder = "INBOX",
    }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/messages/${messageId}/attachments/${attachmentId}?folder=${encodeURIComponent(folder)}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to download attachment");
      }
      return res.blob();
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
