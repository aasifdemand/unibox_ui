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
  profile: (mailboxId) => ["outlook", mailboxId, "profile"],
  search: (mailboxId, query) => ["outlook", mailboxId, "search", query],
  attachments: (mailboxId, messageId) => [
    "outlook",
    mailboxId,
    "attachments",
    messageId,
  ],
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
      if (pageParam) url += `&skipToken=${pageParam}`;
      if (folderId && folderId !== "inbox") url += `&folderId=${folderId}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextSkipToken,
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
      if (pageParam) url += `&skipToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch sent messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextSkipToken,
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
      if (pageParam) url += `&skipToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch trash messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextSkipToken,
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
      if (pageParam) url += `&skipToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch spam messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextSkipToken,
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
      if (pageParam) url += `&skipToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch archive messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextSkipToken,
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
      if (pageParam) url += `&skipToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch outbox messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextSkipToken,
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
      if (pageParam) url += `&skipToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch drafts");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextSkipToken,
    initialPageParam: null,
    staleTime: 1 * 60 * 1000,
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
    staleTime: 30 * 60 * 1000,
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

// Get profile
export const useOutlookProfileQuery = (mailboxId) => {
  return useQuery({
    queryKey: outlookKeys.profile(mailboxId),
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/profile`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
      return data.data;
    },
    staleTime: 60 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Search messages
export const useOutlookSearchQuery = (mailboxId, query, top = 10) => {
  return useInfiniteQuery({
    queryKey: outlookKeys.search(mailboxId, query),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/search?query=${encodeURIComponent(query)}&top=${top}`;
      if (pageParam) url += `&skipToken=${pageParam}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to search messages");
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextSkipToken,
    initialPageParam: null,
    enabled: !!mailboxId && !!query,
    staleTime: 1 * 60 * 1000,
  });
};

// Get attachments
export const useOutlookAttachmentsQuery = (mailboxId, messageId) => {
  return useQuery({
    queryKey: outlookKeys.attachments(mailboxId, messageId),
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/attachments`,
        { credentials: "include" },
      );
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
export const useSendOutlookMessageMutation = () => {
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
      saveToSent = true,
    }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/send`,
        {
          method: "POST",
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
            saveToSent,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "sent"],
      });
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "outbox"],
      });
    },
  });
};

// Reply to message
export const useReplyToOutlookMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mailboxId,
      messageId,
      body,
      html,
      replyAll,
      attachments,
    }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/reply`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body, html, replyAll, attachments }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reply");
      return data;
    },
    onSuccess: (_, { mailboxId, messageId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "sent"],
      });
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "message", messageId],
      });
    },
  });
};

// Forward message
export const useForwardOutlookMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mailboxId,
      messageId,
      to,
      body,
      html,
      attachments,
    }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/forward`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, body, html, attachments }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to forward message");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "sent"],
      });
    },
  });
};

// Create draft
export const useCreateOutlookDraftMutation = () => {
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
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/drafts`,
        {
          method: "POST",
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
      if (!res.ok) throw new Error(data.message || "Failed to create draft");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "drafts"],
      });
    },
  });
};

// Update draft
export const useUpdateOutlookDraftMutation = () => {
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
    }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/drafts/${messageId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, cc, bcc, subject, body, html }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update draft");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "drafts"],
      });
    },
  });
};

// Delete draft
export const useDeleteOutlookDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/drafts/${messageId}`,
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
        queryKey: ["outlook", mailboxId, "drafts"],
      });
    },
  });
};

// Send draft
export const useSendOutlookDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/drafts/${messageId}/send`,
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
        queryKey: ["outlook", mailboxId, "drafts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "sent"],
      });
    },
  });
};

// Create reply draft
export const useCreateOutlookReplyDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, replyAll = false }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/createReplyDraft`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ replyAll }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to create reply draft");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "drafts"],
      });
    },
  });
};

// Create forward draft
export const useCreateOutlookForwardDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/createForwardDraft`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to create forward draft");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "drafts"],
      });
    },
  });
};

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

// Mark as unread
export const useMarkOutlookAsUnreadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/unread`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark as unread");
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

// Toggle flag (star)
export const useToggleOutlookFlagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, flagStatus }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/flag`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flagStatus }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle flag");
      return data;
    },
    onSuccess: (_, { mailboxId, messageId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "messages"],
      });
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "message", messageId],
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

// Move message
export const useMoveOutlookMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, destinationFolderId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/move`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationFolderId }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to move message");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "messages"],
      });
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "folders"],
      });
    },
  });
};

// Copy message
export const useCopyOutlookMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, destinationFolderId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/copy`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationFolderId }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to copy message");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "messages"],
      });
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "folders"],
      });
    },
  });
};

// Batch operations
export const useBatchOutlookOperationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mailboxId,
      messageIds,
      operation,
      destinationFolderId,
    }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/batch`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageIds, operation, destinationFolderId }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to perform batch operation");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ["outlook", mailboxId] });
    },
  });
};

// Create folder
export const useCreateOutlookFolderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, displayName, parentFolderId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/folders`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName, parentFolderId }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create folder");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "folders"],
      });
    },
  });
};

// Update folder
export const useUpdateOutlookFolderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, folderId, displayName }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/folders/${folderId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update folder");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "folders"],
      });
    },
  });
};

// Delete folder
export const useDeleteOutlookFolderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, folderId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/folders/${folderId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete folder");
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "folders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["outlook", mailboxId, "messages"],
      });
    },
  });
};

// Download attachment
export const useDownloadOutlookAttachment = () => {
  return useMutation({
    mutationFn: async ({ mailboxId, messageId, attachmentId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/attachments/${attachmentId}`,
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
