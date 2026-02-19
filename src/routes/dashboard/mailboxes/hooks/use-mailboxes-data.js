/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useMessageFilters } from "./index";
import {
  formatMessageDate,
  getSenderInfo,
  getSubject,
  getPreview,
  getInitials,
  getProviderIcon,
  timeAgo,
} from "../utils/utils";

import { useMailboxes } from "../../../../hooks/useMailboxes";
import { useGmailData } from "./use-gmail-data";
import { useOutlookData } from "./use-outlook-data";
import { useSmtpData } from "./use-smtp-data";
import { getProviderMessageId } from "../utils/getmessage-id";

const PAGE_SIZE = 10;

export const useMailboxesData = () => {
  const queryClient = useQueryClient();

  // =========================
  // LOCAL STATE
  // =========================
  const [selectedMailbox, setSelectedMailbox] = useState(null);
  const [view, setView] = useState("list");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showAllFolders, setShowAllFolders] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [showStats, setShowStats] = useState(true);
  const [currentMessageId, setCurrentMessageId] = useState(null);

  // Filter state
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterStarred, setFilterStarred] = useState(false);
  const [filterAttachments, setFilterAttachments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");

  const [isComposing, setIsComposing] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

  // =========================
  // MAILBOXES
  // =========================
  const {
    data: mailboxes = [],
    isLoading: isLoadingMailboxes,
    refetch: refetchMailboxes,
  } = useMailboxes();

  // =========================
  // PROVIDER DATA HOOKS
  // =========================
  const gmail = useGmailData(
    selectedMailbox,
    selectedFolder,
    currentMessageId,
    PAGE_SIZE,
    searchQuery,
  );
  const outlook = useOutlookData(
    selectedMailbox,
    selectedFolder,
    currentMessageId,
    PAGE_SIZE,
    searchQuery,
  );
  const smtp = useSmtpData(
    selectedMailbox,
    selectedFolder,
    currentMessageId,
    currentPage,
    PAGE_SIZE,
    searchQuery,
  );

  // Helpers to get the right provider data
  const getProvider = () => {
    if (!selectedMailbox) return null;
    if (selectedMailbox.type === "gmail") return gmail;
    if (selectedMailbox.type === "outlook") return outlook;
    if (selectedMailbox.type === "smtp") return smtp;
    return null;
  };

  const provider = getProvider();

  // =========================
  // DERIVED DATA
  // =========================

  const messages = useMemo(() => {
    if (!selectedMailbox || !provider) return [];

    if (searchQuery) {
      const searchData = provider.queries.search?.data;
      if (selectedMailbox.type === "smtp") return searchData?.messages || [];
      return searchData?.pages?.flatMap((p) => p.messages) || [];
    }

    const q = provider.queries;
    const pageIndex = currentPage - 1;

    if (selectedMailbox.type === "gmail") {
      if (!selectedFolder)
        return q.messages.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "SENT")
        return q.sent.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "TRASH")
        return q.trash.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "SPAM")
        return q.spam.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "STARRED")
        return q.starred.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "IMPORTANT")
        return q.important.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "DRAFT")
        return q.drafts.data?.pages[pageIndex]?.drafts || [];
      return q.messages.data?.pages[pageIndex]?.messages || [];
    }

    if (selectedMailbox.type === "outlook") {
      if (!selectedFolder)
        return q.messages.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "sentitems")
        return q.sent.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "deleteditems")
        return q.trash.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "junkemail")
        return q.spam.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "archive")
        return q.archive.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "outbox")
        return q.outbox.data?.pages[pageIndex]?.messages || [];
      if (selectedFolder.id === "drafts")
        return q.drafts.data?.pages[pageIndex]?.messages || [];
      return q.messages.data?.pages[pageIndex]?.messages || [];
    }

    if (selectedMailbox.type === "smtp") {
      if (!selectedFolder) return q.messages.data?.messages || [];
      if (selectedFolder.name === "SENT") return q.sent.data?.messages || [];
      if (selectedFolder.name === "DRAFTS")
        return q.drafts.data?.messages || [];
      if (selectedFolder.name === "TRASH") return q.trash.data?.messages || [];
      if (selectedFolder.name === "SPAM") return q.spam.data?.messages || [];
      if (selectedFolder.name === "ARCHIVE")
        return q.archive.data?.messages || [];
      return q.messages.data?.messages || [];
    }

    return [];
  }, [
    selectedMailbox,
    selectedFolder,
    currentPage,
    searchQuery,
    provider?.queries,
  ]);

  const folders = useMemo(() => {
    if (!selectedMailbox) return [];
    if (selectedMailbox.type === "gmail")
      return gmail.queries.labels.data || [];
    if (selectedMailbox.type === "outlook")
      return outlook.queries.folders.data?.folders || [];
    if (selectedMailbox.type === "smtp")
      return smtp.queries.folders.data?.folders || [];
    return [];
  }, [
    selectedMailbox,
    gmail.queries.labels.data,
    outlook.queries.folders.data,
    smtp.queries.folders.data,
  ]);

  const currentMessage = provider?.queries.message?.data;
  const currentAttachments = provider?.queries.attachments?.data;

  // Filters
  const filters = useMessageFilters({
    messages,
    filterUnread,
    filterStarred,
    filterAttachments,
    searchQuery,
    dateRange,
  });

  const filteredMessages = useMemo(() => filters.apply(), [filters, messages]);

  // Pagination updates
  useEffect(() => {
    if (!selectedMailbox || !provider) return;

    if (searchQuery) {
      const searchData = provider.queries.search?.data;
      if (selectedMailbox.type === "smtp") {
        setHasNextPage(false);
        setTotalMessages(searchData?.totalCount || 0);
      } else {
        setHasNextPage(provider.queries.search.hasNextPage);
        setTotalMessages(searchData?.pages[0]?.totalResults || 0);
      }
      return;
    }

    const q = provider.queries;
    const pageIndex = currentPage - 1;

    let total = 0;
    let hasNext = false;

    if (selectedMailbox.type === "gmail") {
      const query = !selectedFolder
        ? q.messages
        : selectedFolder.id === "SENT"
          ? q.sent
          : selectedFolder.id === "TRASH"
            ? q.trash
            : selectedFolder.id === "SPAM"
              ? q.spam
              : selectedFolder.id === "STARRED"
                ? q.starred
                : selectedFolder.id === "IMPORTANT"
                  ? q.important
                  : selectedFolder.id === "DRAFT"
                    ? q.drafts
                    : q.messages;

      total = query.data?.pages[0]?.totalResults || 0;
      hasNext =
        query.hasNextPage || currentPage < (query.data?.pages.length || 0);
    } else if (selectedMailbox.type === "outlook") {
      const query = !selectedFolder
        ? q.messages
        : selectedFolder.id === "sentitems"
          ? q.sent
          : selectedFolder.id === "deleteditems"
            ? q.trash
            : selectedFolder.id === "junkemail"
              ? q.spam
              : selectedFolder.id === "archive"
                ? q.archive
                : selectedFolder.id === "outbox"
                  ? q.outbox
                  : selectedFolder.id === "drafts"
                    ? q.drafts
                    : q.messages;

      total = query.data?.pages[0]?.totalResults || 0; // Outlook might not provide totalResults in standard way, use fallback
      hasNext =
        query.hasNextPage || currentPage < (query.data?.pages.length || 0);
    } else if (selectedMailbox.type === "smtp") {
      const query = !selectedFolder
        ? q.messages
        : selectedFolder.name === "SENT"
          ? q.sent
          : selectedFolder.name === "DRAFTS"
            ? q.drafts
            : selectedFolder.name === "TRASH"
              ? q.trash
              : selectedFolder.name === "SPAM"
                ? q.spam
                : selectedFolder.name === "ARCHIVE"
                  ? q.archive
                  : q.messages;

      total = query.data?.totalCount || 0;
      hasNext = currentPage * PAGE_SIZE < total;
    }

    setTotalMessages(total);
    setHasNextPage(hasNext);
    setHasPreviousPage(currentPage > 1);
  }, [
    selectedMailbox,
    selectedFolder,
    currentPage,
    searchQuery,
    provider?.queries,
  ]);

  // =========================
  // HANDLERS
  // =========================

  const handleSelectMailbox = useCallback((mailbox) => {
    setSelectedMailbox(mailbox);
    setSelectedFolder(null); // Reset folder when changing mailbox
    setView("messages");
    setCurrentPage(1);
    setSelectedMessages([]);
    setSearchQuery("");
  }, []);

  const handleSelectFolder = useCallback((folder) => {
    setSelectedFolder(folder);
    setCurrentPage(1);
    setSelectedMessages([]);
    setSearchQuery("");
    setView("messages");
  }, []);

  const handleSelectMessage = useCallback(
    async (message) => {
      if (!selectedMailbox) return;
      const messageId = getProviderMessageId(message, selectedMailbox.type);
      if (!messageId) {
        toast.error("Invalid message ID");
        return;
      }
      setCurrentMessageId(messageId);
      setView("message");
    },
    [selectedMailbox],
  );

  const handleMarkMessageAsRead = useCallback(
    async (messageId) => {
      if (!selectedMailbox || !provider) return;
      try {
        await provider.mutations.markAsRead.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageId,
          folder: selectedFolder?.name || "INBOX",
        });
        toast.success("Marked as read");
      } catch (e) {
        toast.error("Failed to mark as read");
      }
    },
    [selectedMailbox, provider, selectedFolder],
  );

  const handleMarkMessageAsUnread = useCallback(
    async (messageId) => {
      if (!selectedMailbox || !provider) return;
      try {
        await provider.mutations.markAsUnread.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageId,
          folder: selectedFolder?.name || "INBOX",
        });
        toast.success("Marked as unread");
      } catch (e) {
        toast.error("Failed to mark as unread");
      }
    },
    [selectedMailbox, provider, selectedFolder],
  );

  const handleToggleStar = useCallback(
    async (messageId, currentStarred) => {
      if (!selectedMailbox || !provider) return;
      try {
        if (selectedMailbox.type === "gmail") {
          await provider.mutations.toggleStar.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId,
            starred: !currentStarred,
          });
        } else {
          await provider.mutations.toggleFlag.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId,
            flagStatus: !currentStarred ? "flagged" : "normal",
            flagged: !currentStarred, // for SMTP
            folder: selectedFolder?.name || "INBOX",
          });
        }
        toast.success(
          !currentStarred ? "Message starred" : "Message unstarred",
        );
      } catch (e) {
        toast.error("Failed to toggle star");
      }
    },
    [selectedMailbox, provider, selectedFolder],
  );

  const handleToggleImportant = useCallback(
    async (messageId, currentImportant) => {
      if (!selectedMailbox || !provider || selectedMailbox.type !== "gmail")
        return;
      try {
        await gmail.mutations.toggleImportant.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageId,
          important: !currentImportant,
        });
        toast.success(
          !currentImportant ? "Marked as important" : "Removed importance",
        );
      } catch (e) {
        toast.error("Failed to toggle importance");
      }
    },
    [selectedMailbox, provider, gmail.mutations],
  );

  const handleDeleteMessage = useCallback(
    async (messageId) => {
      if (!selectedMailbox || !provider) return;
      if (!window.confirm("Are you sure you want to delete this message?"))
        return;
      try {
        await provider.mutations.deleteMessage.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageId,
          folder: selectedFolder?.name || "INBOX",
        });
        toast.success("Message deleted");
        setView("messages");
        setCurrentMessageId(null);
      } catch (e) {
        toast.error("Failed to delete message");
      }
    },
    [selectedMailbox, provider, selectedFolder],
  );

  const handleMoveMessage = useCallback(
    async (messageId, targetFolder) => {
      if (!selectedMailbox || !provider) return;
      try {
        await provider.mutations.moveMessage.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageId,
          destinationFolderId: targetFolder, // Outlook
          sourceFolder: selectedFolder?.name, // SMTP
          targetFolder, // SMTP
        });
        toast.success("Message moved");
      } catch (e) {
        toast.error("Failed to move message");
      }
    },
    [selectedMailbox, provider, selectedFolder],
  );

  const handleCopyMessage = useCallback(
    async (messageId, targetFolder) => {
      if (!selectedMailbox || !provider) return;
      try {
        await provider.mutations.copyMessage.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageId,
          destinationFolderId: targetFolder, // Outlook
          sourceFolder: selectedFolder?.name, // SMTP
          targetFolder, // SMTP
        });
        toast.success("Message copied");
      } catch (e) {
        toast.error("Failed to copy message");
      }
    },
    [selectedMailbox, provider, selectedFolder],
  );

  const handleSendMessage = useCallback(
    async (data) => {
      if (!selectedMailbox || !provider) return;
      try {
        const mut = provider.mutations;
        let res;
        if (replyToMessage) {
          res = await mut.reply.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId: getProviderMessageId(
              replyToMessage,
              selectedMailbox.type,
            ),
            ...data,
          });
        } else if (forwardMessage) {
          res = await mut.forward.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId: getProviderMessageId(
              forwardMessage,
              selectedMailbox.type,
            ),
            ...data,
          });
        } else {
          res = await mut.sendMessage.mutateAsync({
            mailboxId: selectedMailbox.id,
            ...data,
          });
        }
        toast.success("Message sent");
        setView("messages");
        setIsComposing(false);
        setReplyToMessage(null);
        setForwardMessage(null);
      } catch (e) {
        toast.error("Failed to send message");
      }
    },
    [selectedMailbox, provider, replyToMessage, forwardMessage],
  );

  const handleSaveDraft = useCallback(
    async (data) => {
      if (!selectedMailbox || !provider) return;
      try {
        await provider.mutations.createDraft.mutateAsync({
          mailboxId: selectedMailbox.id,
          ...data,
        });
        toast.success("Draft saved");
      } catch (e) {
        toast.error("Failed to save draft");
      }
    },
    [selectedMailbox, provider],
  );

  const handleCompose = useCallback(() => {
    setIsComposing(true);
    setReplyToMessage(null);
    setForwardMessage(null);
    setView("compose");
  }, []);

  const handleReply = useCallback((message) => {
    setReplyToMessage(message);
    setForwardMessage(null);
    setIsComposing(true);
    setView("compose");
  }, []);

  const handleForward = useCallback((message) => {
    setForwardMessage(message);
    setReplyToMessage(null);
    setIsComposing(true);
    setView("compose");
  }, []);

  const handleCloseCompose = useCallback(() => {
    setIsComposing(false);
    setReplyToMessage(null);
    setForwardMessage(null);
    setView("messages");
  }, []);

  const handleBackToMailboxes = useCallback(() => {
    setSelectedMailbox(null);
    setSelectedFolder(null);
    setView("list");
  }, []);

  const handleBackToMessages = useCallback(() => {
    setView("messages");
    setCurrentMessageId(null);
  }, []);

  const handleDownloadAttachment = useCallback(
    async (attachmentId, filename) => {
      if (!selectedMailbox || !provider) return;
      try {
        const res = await provider.mutations.downloadAttachment.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageId: currentMessageId,
          attachmentId,
          filename,
          folder: selectedFolder?.name || "INBOX",
        });
        // Handle download if necessary (usually the hook handles it by creating a link)
      } catch (e) {
        toast.error("Failed to download attachment");
      }
    },
    [selectedMailbox, provider, currentMessageId, selectedFolder],
  );

  const handleSync = useCallback(async () => {
    if (!selectedMailbox || !provider) return;
    try {
      await provider.mutations.sync.mutateAsync({
        mailboxId: selectedMailbox.id,
        folderId: selectedFolder?.id,
        folder: selectedFolder?.name,
      });
      toast.success("Mailbox synced");
    } catch (e) {
      toast.error("Failed to sync");
    }
  }, [selectedMailbox, provider, selectedFolder]);

  const handleRefreshToken = useCallback(async () => {
    if (!selectedMailbox || !provider || selectedMailbox.type === "smtp")
      return;
    try {
      await provider.mutations.refreshToken.mutateAsync({
        mailboxId: selectedMailbox.id,
      });
      toast.success("Token refreshed");
    } catch (e) {
      toast.error("Failed to refresh token");
    }
  }, [selectedMailbox, provider]);

  const handleDisconnect = useCallback(async () => {
    if (!selectedMailbox || !provider) return;
    try {
      await provider.mutations.disconnect.mutateAsync({
        mailboxId: selectedMailbox.id,
      });
      toast.success("Mailbox disconnected");
      handleBackToMailboxes();
      refetchMailboxes();
    } catch (e) {
      toast.error("Failed to disconnect");
    }
  }, [selectedMailbox, provider]);

  const handleNextPage = useCallback(() => {
    if (hasNextPage) setCurrentPage((prev) => prev + 1);
  }, [hasNextPage]);

  const handlePreviousPage = useCallback(() => {
    if (hasPreviousPage) setCurrentPage((prev) => prev - 1);
  }, [hasPreviousPage]);

  const handleBulkDelete = useCallback(
    async () => {
      if (!selectedMailbox || !provider || selectedMessages.length === 0)
        return;
      try {
        await provider.mutations.batchOperations.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageIds: selectedMessages,
          operation: "delete",
          folder: selectedFolder?.name,
        });
        toast.success("Messages deleted");
        setSelectedMessages([]);
      } catch (e) {
        toast.error("Failed to delete messages");
      }
    },
    [selectedMailbox, provider, selectedMessages, selectedFolder],
  );

  const handleBulkMarkRead = useCallback(async () => {
    if (!selectedMailbox || !provider || selectedMessages.length === 0) return;
    try {
      await provider.mutations.batchOperations.mutateAsync({
        mailboxId: selectedMailbox.id,
        messageIds: selectedMessages,
        operation: "markAsRead",
        folder: selectedFolder?.name,
      });
      toast.success("Messages marked as read");
      setSelectedMessages([]);
    } catch (e) {
      toast.error("Failed to mark as read");
    }
  }, [selectedMailbox, provider, selectedMessages, selectedFolder]);

  const handleBulkMarkUnread = useCallback(async () => {
    if (!selectedMailbox || !provider || selectedMessages.length === 0) return;
    try {
      await provider.mutations.batchOperations.mutateAsync({
        mailboxId: selectedMailbox.id,
        messageIds: selectedMessages,
        operation: "markAsUnread",
        folder: selectedFolder?.name,
      });
      toast.success("Messages marked as unread");
      setSelectedMessages([]);
    } catch (e) {
      toast.error("Failed to mark as unread");
    }
  }, [selectedMailbox, provider, selectedMessages, selectedFolder]);

  const handleCheckMessage = useCallback((messageId, checked) => {
    setSelectedMessages((prev) =>
      checked ? [...prev, messageId] : prev.filter((id) => id !== messageId),
    );
  }, []);

  const handleResetQueries = useCallback(() => {
    queryClient.resetQueries({ queryKey: ["mailboxes"] });
  }, [queryClient]);

  // =========================
  // RETURN
  // =========================
  return {
    state: {
      selectedMailbox,
      view,
      selectedFolder,
      showAllFolders,
      selectedMessages,
      viewMode,
      showStats,
      currentMessageId,
      filterUnread,
      filterStarred,
      filterAttachments,
      searchQuery,
      dateRange,
      currentPage,
      hasNextPage,
      hasPreviousPage,
      totalMessages,
      isComposing,
      replyToMessage,
      forwardMessage,
    },
    data: {
      mailboxes,
      messages,
      folders,
      currentMessage,
      currentAttachments,
      filteredMessages,
      startMessageCount: (currentPage - 1) * PAGE_SIZE + 1,
      endMessageCount: Math.min(currentPage * PAGE_SIZE, totalMessages),
      getFolderUnreadCount: () => {
        if (!selectedMailbox) return 0;
        const f = folders || [];
        console.log(f);

        if (selectedMailbox.type === "gmail") {
          return f.find((item) => item.id === "INBOX")?.messagesUnread || 0;
        }
        if (selectedMailbox.type === "outlook") {
          return f.find((item) => item.id === "inbox")?.unreadItemCount || 0;
        }
        if (selectedMailbox.type === "smtp") {
          return (
            f.folders?.find((item) => item.name === "INBOX")?.unreadCount || 0
          );
        }
        return 0;
      },
      outlookProfile: outlook.queries.profile,
      smtpStatus: smtp.queries.status,
      apis: {
        gmail: gmail.mutations,
        outlook: outlook.mutations,
        smtp: smtp.mutations,
      },
    },
    isLoading: {
      isMailboxes: isLoadingMailboxes,
      isMessages: (() => {
        if (!provider) return false;
        const q = provider.queries;
        return (
          q.messages.isLoading ||
          q.sent.isLoading ||
          q.trash.isLoading ||
          q.spam.isLoading ||
          q.starred?.isLoading ||
          q.important?.isLoading ||
          q.drafts?.isLoading ||
          q.archive?.isLoading ||
          q.outbox?.isLoading ||
          q.search?.isLoading
        );
      })(),
      isMessageLoading: provider?.queries.message?.isLoading,
      isSyncing: provider?.mutations.sync.isLoading,
    },
    error: provider?.queries.messages.error || provider?.queries.search?.error,
    setters: {
      setSelectedMailbox,
      setView,
      setSelectedFolder,
      setShowAllFolders,
      setSelectedMessages,
      setViewMode,
      setShowStats,
      setCurrentMessageId,
      setFilterUnread,
      setFilterStarred,
      setFilterAttachments,
      setSearchQuery,
      setDateRange,
      setCurrentPage,
    },
    handlers: {
      handleSelectMailbox,
      handleSelectFolder,
      handleSelectMessage,
      handleMarkMessageAsRead,
      handleMarkMessageAsUnread,
      handleToggleStar,
      handleToggleImportant,
      handleDeleteMessage,
      handleMoveMessage,
      handleCopyMessage,
      handleSendMessage,
      handleSaveDraft,
      handleCompose,
      handleReply,
      handleForward,
      handleCloseCompose,
      handleBackToMailboxes,
      handleBackToMessages,
      handleDownloadAttachment,
      handleSync,
      handleRefreshToken,
      handleDisconnect,
      handleNextPage,
      handlePreviousPage,
      handleBulkDelete,
      handleBulkMarkRead,
      handleBulkMarkUnread,
      handleCheckMessage,
      handleResetQueries,
      refetchMailboxes,
    },
    utils: {
      formatMessageDate,
      getSenderInfo,
      getSubject,
      getPreview,
      getInitials,
      getProviderIcon,
      timeAgo,
    },
  };
};
