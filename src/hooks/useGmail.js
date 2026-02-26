import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getPersistentFolders, setPersistentFolders } from '../routes/dashboard/mailboxes/utils/persistent-cache';

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const gmailKeys = {
  all: ['gmail'],
  messages: (mailboxId, labelIds) => ['gmail', mailboxId, 'messages', { labelIds }],
  message: (mailboxId, messageId) => ['gmail', mailboxId, 'message', messageId],
  labels: (mailboxId) => ['gmail', mailboxId, 'labels'],
  sent: (mailboxId) => ['gmail', mailboxId, 'sent'],
  trash: (mailboxId) => ['gmail', mailboxId, 'trash'],
  spam: (mailboxId) => ['gmail', mailboxId, 'spam'],
  starred: (mailboxId) => ['gmail', mailboxId, 'starred'],
  important: (mailboxId) => ['gmail', mailboxId, 'important'],
  drafts: (mailboxId) => ['gmail', mailboxId, 'drafts'],
  threads: (mailboxId) => ['gmail', mailboxId, 'threads'],
  profile: (mailboxId) => ['gmail', mailboxId, 'profile'],
  search: (mailboxId, query) => ['gmail', mailboxId, 'search', query],
  attachments: (mailboxId, messageId) => ['gmail', mailboxId, 'attachments', messageId],
};

// =========================
// QUERIES
// =========================

// Get Gmail messages with pagination
export const useGmailMessagesQuery = (mailboxId, labelIds = ['INBOX'], maxResults = 10) => {
  return useInfiniteQuery({
    queryKey: gmailKeys.messages(mailboxId, labelIds),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/messages?maxResults=${maxResults}`;
      if (pageParam) url += `&pageToken=${pageParam}`;
      if (labelIds) url += `&labelIds=${labelIds.join(',')}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch messages');
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get sent messages
export const useGmailSentMessagesQuery = (mailboxId, maxResults = 10) => {
  return useInfiniteQuery({
    queryKey: gmailKeys.sent(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/sent?maxResults=${maxResults}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch sent messages');
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get trash messages
export const useGmailTrashMessagesQuery = (mailboxId, maxResults = 10) => {
  return useInfiniteQuery({
    queryKey: gmailKeys.trash(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/trash?maxResults=${maxResults}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch trash messages');
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get spam messages
export const useGmailSpamMessagesQuery = (mailboxId, maxResults = 10) => {
  return useInfiniteQuery({
    queryKey: gmailKeys.spam(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/spam?maxResults=${maxResults}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch spam messages');
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get starred messages
export const useGmailStarredMessagesQuery = (mailboxId, maxResults = 10) => {
  return useInfiniteQuery({
    queryKey: gmailKeys.starred(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/starred?maxResults=${maxResults}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch starred messages');
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get important messages
export const useGmailImportantMessagesQuery = (mailboxId, maxResults = 10) => {
  return useInfiniteQuery({
    queryKey: gmailKeys.important(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/important?maxResults=${maxResults}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch important messages');
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 2 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get drafts
export const useGmailDraftsQuery = (mailboxId, maxResults = 10) => {
  return useInfiniteQuery({
    queryKey: gmailKeys.drafts(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/drafts?maxResults=${maxResults}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch drafts');
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 1 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get single message
export const useGmailMessageQuery = (mailboxId, messageId) => {
  return useQuery({
    queryKey: gmailKeys.message(mailboxId, messageId),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch message');
      return data.data;
    },
    staleTime: 30 * 60 * 1000,
    enabled: !!mailboxId && !!messageId,
  });
};

// Get labels
export const useGmailLabelsQuery = (mailboxId) => {
  const query = useQuery({
    queryKey: gmailKeys.labels(mailboxId),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/labels`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch labels');
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!mailboxId,
    placeholderData: () => getPersistentFolders('gmail', mailboxId),
  });

  useEffect(() => {
    if (query.data && !query.isPlaceholderData) {
      setPersistentFolders('gmail', mailboxId, query.data);
    }
  }, [query.data, query.isPlaceholderData, mailboxId]);

  return query;
};

// Get threads
export const useGmailThreadsQuery = (mailboxId, labelIds = ['INBOX'], maxResults = 10) => {
  return useInfiniteQuery({
    queryKey: gmailKeys.threads(mailboxId),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/threads?maxResults=${maxResults}`;
      if (pageParam) url += `&pageToken=${pageParam}`;
      if (labelIds) url += `&labelIds=${labelIds.join(',')}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch threads');
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    staleTime: 5 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Get profile
export const useGmailProfileQuery = (mailboxId) => {
  return useQuery({
    queryKey: gmailKeys.profile(mailboxId),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/profile`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
      return data.data;
    },
    staleTime: 60 * 60 * 1000,
    enabled: !!mailboxId,
  });
};

// Search messages
export const useGmailSearchQuery = (mailboxId, query, maxResults = 10) => {
  return useInfiniteQuery({
    queryKey: gmailKeys.search(mailboxId, query),
    queryFn: async ({ pageParam = null }) => {
      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/search?query=${encodeURIComponent(query)}&maxResults=${maxResults}`;
      if (pageParam) url += `&pageToken=${pageParam}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to search messages');
      return data.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    enabled: !!mailboxId && !!query,
    staleTime: 1 * 60 * 1000,
  });
};

// Get message attachments
export const useGmailAttachmentsQuery = (mailboxId, messageId) => {
  return useQuery({
    queryKey: gmailKeys.attachments(mailboxId, messageId),
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/attachments`,
        { credentials: 'include' },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch attachments');
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
export const useSendGmailMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, to, cc, bcc, subject, body, html, attachments }) => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, cc, bcc, subject, body, html, attachments }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send email');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ['gmail', mailboxId, 'sent'] });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'messages'],
      });
    },
  });
};

// Reply to message
export const useReplyToGmailMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, body, html, replyAll, attachments }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/reply`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body, html, replyAll, attachments }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reply');
      return data;
    },
    onSuccess: (_, { mailboxId, messageId }) => {
      queryClient.invalidateQueries({ queryKey: ['gmail', mailboxId, 'sent'] });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'message', messageId],
      });
    },
  });
};

// Forward message
export const useForwardGmailMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, to, body, html, attachments }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/forward`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, body, html, attachments }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to forward message');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ['gmail', mailboxId, 'sent'] });
    },
  });
};

// Create draft
export const useCreateGmailDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, to, cc, bcc, subject, body, html, attachments }) => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/drafts`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          cc,
          bcc,
          subject,
          body,
          html,
          attachments,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create draft');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'drafts'],
      });
    },
  });
};

// Update draft
export const useUpdateGmailDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, draftId, to, cc, bcc, subject, body, html, attachments }) => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/drafts/${draftId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          cc,
          bcc,
          subject,
          body,
          html,
          attachments,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update draft');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'drafts'],
      });
    },
  });
};

// Delete draft
export const useDeleteGmailDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, draftId }) => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/drafts/${draftId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete draft');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'drafts'],
      });
    },
  });
};

// Send draft
export const useSendGmailDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, draftId }) => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/drafts/${draftId}/send`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send draft');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'drafts'],
      });
      queryClient.invalidateQueries({ queryKey: ['gmail', mailboxId, 'sent'] });
    },
  });
};

// Mark as read
export const useMarkGmailAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/read`,
        {
          method: 'PUT',
          credentials: 'include',
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to mark as read');
      return data;
    },
    onSuccess: (_, { mailboxId, messageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'messages'],
      });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'message', messageId],
      });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'labels'],
      });
    },
  });
};

// Mark as unread
export const useMarkGmailAsUnreadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/unread`,
        {
          method: 'PUT',
          credentials: 'include',
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to mark as unread');
      return data;
    },
    onSuccess: (_, { mailboxId, messageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'messages'],
      });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'message', messageId],
      });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'labels'],
      });
    },
  });
};

// Toggle star
export const useToggleGmailStarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, starred }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/star`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ starred }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to toggle star');
      return data;
    },
    onSuccess: (_, { mailboxId, messageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'messages'],
      });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'message', messageId],
      });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'starred'],
      });
    },
  });
};

// Toggle important
export const useToggleGmailImportantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, important }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/important`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ important }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to toggle important');
      return data;
    },
    onSuccess: (_, { mailboxId, messageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'messages'],
      });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'message', messageId],
      });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'important'],
      });
    },
  });
};

// Delete message
export const useDeleteGmailMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete message');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ['gmail', mailboxId] });
    },
  });
};

// Permanently delete message
export const usePermanentlyDeleteGmailMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/permanent`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to permanently delete message');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ['gmail', mailboxId] });
    },
  });
};

// Modify labels
export const useModifyGmailLabelsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageId, addLabelIds = [], removeLabelIds = [] }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/labels`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addLabelIds, removeLabelIds }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to modify labels');
      return data;
    },
    onSuccess: (_, { mailboxId, messageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'messages'],
      });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'message', messageId],
      });
      queryClient.invalidateQueries({
        queryKey: ['gmail', mailboxId, 'labels'],
      });
    },
  });
};

// Batch operations
export const useBatchGmailOperationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, messageIds, operation, labelIds }) => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/batch`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds, operation, labelIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to perform batch operation');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ['gmail', mailboxId] });
    },
  });
};

// Download attachment
export const useDownloadGmailAttachment = () => {
  return useMutation({
    mutationFn: async ({ mailboxId, messageId, attachmentId }) => {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/attachments/${attachmentId}`,
        { credentials: 'include' },
      );
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to download attachment');
      }
      return res.blob();
    },
  });
};

// Sync mailbox
export const useSyncGmailMailboxMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId, folderId = 'INBOX' }) => {
      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/sync`;
      if (folderId) url += `?folderId=${folderId}`;

      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to sync mailbox');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.invalidateQueries({ queryKey: ['gmail', mailboxId] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });
};

// Refresh token
export const useRefreshGmailTokenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId }) => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to refresh token');
      return data;
    },
    onSuccess: (data, { mailboxId }) => {
      if (data.data?.expiresAt) {
        queryClient.setQueryData(['mailboxes', 'detail', mailboxId], (old) => ({
          ...old,
          expiresAt: data.data.expiresAt,
        }));
      }
    },
  });
};

// Disconnect mailbox
export const useDisconnectGmailMailboxMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mailboxId }) => {
      const res = await fetch(`${API_URL}/mailboxes/gmail/${mailboxId}/disconnect`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to disconnect');
      return data;
    },
    onSuccess: (_, { mailboxId }) => {
      queryClient.removeQueries({ queryKey: ['gmail', mailboxId] });
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });
};
