import { create } from "zustand";
import { useSenderStore } from "./sender.store";

const API_URL = import.meta.env.VITE_API_URL;

export const useMailboxStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  mailboxes: [],
  currentMailbox: null,
  messages: [],
  currentMessage: null,
  folders: [],

  isLoading: false,
  isLoadingMessages: false,
  isSyncing: false,
  error: null,

  pagination: {
    nextPageToken: null,
    currentPage: 1,
  },

  // =========================
  // FETCH ALL MAILBOXES
  // =========================
  fetchMailboxes: async () => {
    try {
      set({ isLoading: true, error: null });

      await useSenderStore.getState().fetchSenders();
      const senders = useSenderStore.getState().senders;

      const mailboxes = senders.map((sender) => ({
        id: sender.id,
        type: sender.type,
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
      }));

      mailboxes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      set({ mailboxes, isLoading: false });
      return { success: true, data: mailboxes };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET MAILBOX BY ID
  // =========================
  getMailboxById: async (mailboxId) => {
    try {
      set({ isLoading: true, error: null });

      let mailbox = get().mailboxes.find((m) => m.id === mailboxId);

      if (!mailbox) {
        await useSenderStore.getState().fetchSenders();
        const senders = useSenderStore.getState().senders;
        const sender = senders.find((s) => s.id === mailboxId);
        if (!sender) throw new Error("Mailbox not found");

        mailbox = {
          id: sender.id,
          type: sender.type,
          email: sender.email,
          displayName: sender.displayName,
          domain: sender.domain,
          isVerified: sender.isVerified,
          isActive: sender.isActive !== undefined ? sender.isActive : true,
          createdAt: sender.createdAt,
          updatedAt: sender.updatedAt,
          lastSyncAt: sender.lastInboxSyncAt || sender.lastUsedAt || null,
          expiresAt: sender.expiresAt,
        };
      }

      set({ currentMailbox: mailbox, isLoading: false });
      return { success: true, data: mailbox };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET GMAIL MESSAGES (INBOX) - FIXED
  // =========================
  getGmailMessages: async (
    mailboxId,
    pageToken = null,
    maxResults = 10,
    labelIds = ["INBOX"],
  ) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/messages?maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      if (labelIds) url += `&labelIds=${labelIds.join(",")}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch messages");

      // ✅ FIX: Make sure we're using the correct path
      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken, // This is correct
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      // ✅ FIX: Return the entire data.data object, not just messages
      return {
        success: true,
        data: data.data, // Return the whole data object, not just messages
      };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },
  // =========================
  // GET GMAIL SENT MESSAGES
  // =========================
  getGmailSentMessages: async (
    mailboxId,
    pageToken = null,
    maxResults = 10,
  ) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/sent?maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch sent messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET GMAIL TRASH MESSAGES
  // =========================
  getGmailTrashMessages: async (
    mailboxId,
    pageToken = null,
    maxResults = 10,
  ) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/trash?maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch trash messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET GMAIL SPAM MESSAGES
  // =========================
  getGmailSpamMessages: async (
    mailboxId,
    pageToken = null,
    maxResults = 10,
  ) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/spam?maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch spam messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET GMAIL STARRED MESSAGES
  // =========================
  getGmailStarredMessages: async (
    mailboxId,
    pageToken = null,
    maxResults = 10,
  ) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/starred?maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch starred messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET GMAIL IMPORTANT MESSAGES
  // =========================
  getGmailImportantMessages: async (
    mailboxId,
    pageToken = null,
    maxResults = 10,
  ) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/important?maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch important messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET OUTLOOK MESSAGES (INBOX)
  // =========================
  getOutlookMessages: async (
    mailboxId,
    pageToken = null,
    top = 10,
    folderId = "inbox",
  ) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/messages?top=${top}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      if (folderId && folderId !== "inbox") url += `&folderId=${folderId}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET OUTLOOK SENT MESSAGES
  // =========================
  getOutlookSentMessages: async (mailboxId, pageToken = null, top = 10) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/sent?top=${top}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch sent messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET OUTLOOK TRASH MESSAGES
  // =========================
  getOutlookTrashMessages: async (mailboxId, pageToken = null, top = 10) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/trash?top=${top}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch trash messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET OUTLOOK SPAM MESSAGES
  // =========================
  getOutlookSpamMessages: async (mailboxId, pageToken = null, top = 10) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/spam?top=${top}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch spam messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET OUTLOOK ARCHIVE MESSAGES
  // =========================
  getOutlookArchiveMessages: async (mailboxId, pageToken = null, top = 10) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/archive?top=${top}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch archive messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET OUTLOOK OUTBOX MESSAGES
  // =========================
  getOutlookOutboxMessages: async (mailboxId, pageToken = null, top = 10) => {
    try {
      set({ isLoadingMessages: true, error: null });

      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/outbox?top=${top}`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch outbox messages");

      set((state) => ({
        messages: pageToken
          ? [...state.messages, ...data.data.messages]
          : data.data.messages,
        isLoadingMessages: false,
        pagination: {
          nextPageToken: data.data.nextPageToken,
          currentPage: pageToken ? state.pagination.currentPage + 1 : 1,
        },
      }));

      return { success: true, data: data.data.messages };
    } catch (err) {
      set({ error: err.message, isLoadingMessages: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET SINGLE MESSAGE (Gmail)
  // =========================
  getGmailMessage: async (mailboxId, messageId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch message");

      set({ currentMessage: data.data, isLoading: false });
      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET SINGLE MESSAGE (Outlook)
  // =========================
  getOutlookMessage: async (mailboxId, messageId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch message");

      set({ currentMessage: data.data, isLoading: false });
      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // MARK AS READ (Gmail)
  // =========================
  markGmailAsRead: async (mailboxId, messageId) => {
    try {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}/read`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to mark as read");

      set((state) => ({
        messages: state.messages.map((msg) =>
          (msg.id || msg.messageId) === messageId
            ? {
                ...msg,
                isRead: true,
                unread: false,
                labelIds: msg.labelIds?.filter((id) => id !== "UNREAD"),
              }
            : msg,
        ),
        currentMessage:
          (state.currentMessage?.id || state.currentMessage?.messageId) ===
          messageId
            ? { ...state.currentMessage, isRead: true, unread: false }
            : state.currentMessage,
      }));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // =========================
  // MARK AS READ (Outlook)
  // =========================
  markOutlookAsRead: async (mailboxId, messageId) => {
    try {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}/read`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to mark as read");

      set((state) => ({
        messages: state.messages.map((msg) =>
          (msg.id || msg.messageId) === messageId
            ? { ...msg, isRead: true, unread: false }
            : msg,
        ),
        currentMessage:
          (state.currentMessage?.id || state.currentMessage?.messageId) ===
          messageId
            ? { ...state.currentMessage, isRead: true, unread: false }
            : state.currentMessage,
      }));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // =========================
  // DELETE MESSAGE (Gmail)
  // =========================
  deleteGmailMessage: async (mailboxId, messageId) => {
    try {
      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/messages/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete message");

      set((state) => ({
        messages: state.messages.filter(
          (msg) => (msg.id || msg.messageId) !== messageId,
        ),
        currentMessage:
          (state.currentMessage?.id || state.currentMessage?.messageId) ===
          messageId
            ? null
            : state.currentMessage,
      }));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // =========================
  // DELETE MESSAGE (Outlook)
  // =========================
  deleteOutlookMessage: async (mailboxId, messageId) => {
    try {
      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/messages/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete message");

      set((state) => ({
        messages: state.messages.filter(
          (msg) => (msg.id || msg.messageId) !== messageId,
        ),
        currentMessage:
          (state.currentMessage?.id || state.currentMessage?.messageId) ===
          messageId
            ? null
            : state.currentMessage,
      }));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET GMAIL LABELS
  // =========================
  getGmailLabels: async (mailboxId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/labels`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch labels");

      set({ folders: data.data || [], isLoading: false });
      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // GET OUTLOOK FOLDERS
  // =========================
  getOutlookFolders: async (mailboxId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/folders`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch folders");

      set({ folders: data.data?.folders || data.data || [], isLoading: false });
      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // SYNC GMAIL MAILBOX
  // =========================
  syncGmailMailbox: async (mailboxId, folderId = "INBOX") => {
    try {
      set({ isSyncing: true, error: null });

      let url = `${API_URL}/mailboxes/gmail/${mailboxId}/sync`;
      if (folderId) url += `?folderId=${folderId}`;

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to sync mailbox");

      set((state) => ({
        mailboxes: state.mailboxes.map((m) =>
          m.id === mailboxId
            ? { ...m, lastSyncAt: new Date().toISOString() }
            : m,
        ),
        currentMailbox:
          state.currentMailbox?.id === mailboxId
            ? { ...state.currentMailbox, lastSyncAt: new Date().toISOString() }
            : state.currentMailbox,
        isSyncing: false,
      }));

      return { success: true };
    } catch (err) {
      set({ error: err.message, isSyncing: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // SYNC OUTLOOK MAILBOX
  // =========================
  syncOutlookMailbox: async (mailboxId, folderId = "inbox") => {
    try {
      set({ isSyncing: true, error: null });

      let url = `${API_URL}/mailboxes/outlook/${mailboxId}/sync`;
      if (folderId) url += `?folderId=${folderId}`;

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to sync mailbox");

      set((state) => ({
        mailboxes: state.mailboxes.map((m) =>
          m.id === mailboxId
            ? { ...m, lastSyncAt: new Date().toISOString() }
            : m,
        ),
        currentMailbox:
          state.currentMailbox?.id === mailboxId
            ? { ...state.currentMailbox, lastSyncAt: new Date().toISOString() }
            : state.currentMailbox,
        isSyncing: false,
      }));

      return { success: true };
    } catch (err) {
      set({ error: err.message, isSyncing: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // REFRESH GMAIL TOKEN
  // =========================
  refreshGmailToken: async (mailboxId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to refresh token");

      if (data.data?.expiresAt) {
        set((state) => ({
          mailboxes: state.mailboxes.map((m) =>
            m.id === mailboxId ? { ...m, expiresAt: data.data.expiresAt } : m,
          ),
          currentMailbox:
            state.currentMailbox?.id === mailboxId
              ? { ...state.currentMailbox, expiresAt: data.data.expiresAt }
              : state.currentMailbox,
        }));
      }

      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // REFRESH OUTLOOK TOKEN
  // =========================
  refreshOutlookToken: async (mailboxId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to refresh token");

      if (data.data?.expiresAt) {
        set((state) => ({
          mailboxes: state.mailboxes.map((m) =>
            m.id === mailboxId ? { ...m, expiresAt: data.data.expiresAt } : m,
          ),
          currentMailbox:
            state.currentMailbox?.id === mailboxId
              ? { ...state.currentMailbox, expiresAt: data.data.expiresAt }
              : state.currentMailbox,
        }));
      }

      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // DISCONNECT GMAIL MAILBOX
  // =========================
  disconnectGmailMailbox: async (mailboxId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(
        `${API_URL}/mailboxes/gmail/${mailboxId}/disconnect`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to disconnect");

      set((state) => ({
        mailboxes: state.mailboxes.filter((m) => m.id !== mailboxId),
        currentMailbox:
          state.currentMailbox?.id === mailboxId ? null : state.currentMailbox,
        messages: state.currentMailbox?.id === mailboxId ? [] : state.messages,
        currentMessage:
          state.currentMailbox?.id === mailboxId ? null : state.currentMessage,
        folders: state.currentMailbox?.id === mailboxId ? [] : state.folders,
        isLoading: false,
      }));

      await useSenderStore.getState().deleteSender(mailboxId, "gmail");
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // DISCONNECT OUTLOOK MAILBOX
  // =========================
  disconnectOutlookMailbox: async (mailboxId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(
        `${API_URL}/mailboxes/outlook/${mailboxId}/disconnect`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to disconnect");

      set((state) => ({
        mailboxes: state.mailboxes.filter((m) => m.id !== mailboxId),
        currentMailbox:
          state.currentMailbox?.id === mailboxId ? null : state.currentMailbox,
        messages: state.currentMailbox?.id === mailboxId ? [] : state.messages,
        currentMessage:
          state.currentMailbox?.id === mailboxId ? null : state.currentMessage,
        folders: state.currentMailbox?.id === mailboxId ? [] : state.folders,
        isLoading: false,
      }));

      await useSenderStore.getState().deleteSender(mailboxId, "outlook");
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // DISCONNECT SMTP MAILBOX
  // =========================
  disconnectSmtpMailbox: async (mailboxId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(
        `${API_URL}/mailboxes/smtp/${mailboxId}/disconnect`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to disconnect");

      set((state) => ({
        mailboxes: state.mailboxes.filter((m) => m.id !== mailboxId),
        currentMailbox:
          state.currentMailbox?.id === mailboxId ? null : state.currentMailbox,
        isLoading: false,
      }));

      await useSenderStore.getState().deleteSender(mailboxId, "smtp");
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // =========================
  // CLEAR FUNCTIONS
  // =========================
  clearMessages: () => set({ messages: [], currentMessage: null }),
  clearCurrentMailbox: () => {
    set({
      currentMailbox: null,
      messages: [],
      currentMessage: null,
      folders: [],
      pagination: { nextPageToken: null, currentPage: 1 },
    });
  },
  clearError: () => set({ error: null }),
}));
