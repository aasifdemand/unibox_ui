/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format } from "date-fns";
import MessageDetailView from "./messagedetails-view";
import Header from "./header";
import MailboxList from "./mailbox-list";
import MessagesView from "./messages-view";

// Import React Query hooks
import { useMailboxes } from "../../../hooks/useMailboxes";
import {
  useGmailMessagesQuery,
  useGmailSentMessagesQuery,
  useGmailTrashMessagesQuery,
  useGmailSpamMessagesQuery,
  useGmailStarredMessagesQuery,
  useGmailImportantMessagesQuery,
  useGmailDraftsQuery,
  useGmailLabelsQuery,
  useGmailMessageQuery,
  useMarkGmailAsReadMutation,
  useDeleteGmailMessageMutation,
  useSyncGmailMailboxMutation,
  useRefreshGmailTokenMutation,
  useDisconnectGmailMailboxMutation,
} from "../../../hooks/useGmail";

import {
  useOutlookMessagesQuery,
  useOutlookSentMessagesQuery,
  useOutlookTrashMessagesQuery,
  useOutlookSpamMessagesQuery,
  useOutlookArchiveMessagesQuery,
  useOutlookOutboxMessagesQuery,
  useOutlookDraftsQuery,
  useOutlookFoldersQuery,
  useOutlookMessageQuery,
  useMarkOutlookAsReadMutation,
  useDeleteOutlookMessageMutation,
  useSyncOutlookMailboxMutation,
  useRefreshOutlookTokenMutation,
  useDisconnectOutlookMailboxMutation,
} from "../../../hooks/useOutlook";

import {
  useSmtpMessagesQuery,
  useSmtpSentMessagesQuery,
  useSmtpDraftMessagesQuery,
  useSmtpTrashMessagesQuery,
  useSmtpSpamMessagesQuery,
  useSmtpArchiveMessagesQuery,
  useSmtpFoldersQuery,
  useSmtpMessageQuery,
  useMarkSmtpAsReadMutation,
  useMarkSmtpAsUnreadMutation,
  useDeleteSmtpMessageMutation,
  useSyncSmtpMailboxMutation,
  useDisconnectSmtpMailboxMutation,
} from "../../../hooks/useSmtp";

import { useMessageFilters } from "./hooks";

import {
  formatMessageDate,
  getSenderInfo,
  getSubject,
  getPreview,
  getInitials,
  getProviderIcon,
  timeAgo,
} from "./utils";

import { AlertCircle } from "lucide-react";

const Mailboxes = () => {
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

  // =========================
  // QUERIES - Mailboxes
  // =========================
  const {
    data: mailboxes = [],
    isLoading: isLoadingMailboxes,
    refetch: refetchMailboxes,
  } = useMailboxes();

  // =========================
  // ALL QUERIES - MUST BE CALLED AT TOP LEVEL (Rules of Hooks)
  // =========================

  // Gmail Queries - always called, but disabled when not needed
  const gmailMessagesQuery = useGmailMessagesQuery(
    selectedMailbox?.type === "gmail" ? selectedMailbox.id : null,
    selectedFolder?.id ? [selectedFolder.id] : ["INBOX"],
    20,
  );

  const gmailSentQuery = useGmailSentMessagesQuery(
    selectedMailbox?.type === "gmail" ? selectedMailbox.id : null,
    20,
  );
  const gmailTrashQuery = useGmailTrashMessagesQuery(
    selectedMailbox?.type === "gmail" ? selectedMailbox.id : null,
    20,
  );
  const gmailSpamQuery = useGmailSpamMessagesQuery(
    selectedMailbox?.type === "gmail" ? selectedMailbox.id : null,
    20,
  );
  const gmailStarredQuery = useGmailStarredMessagesQuery(
    selectedMailbox?.type === "gmail" ? selectedMailbox.id : null,
    20,
  );
  const gmailImportantQuery = useGmailImportantMessagesQuery(
    selectedMailbox?.type === "gmail" ? selectedMailbox.id : null,
    20,
  );
  const gmailDraftsQuery = useGmailDraftsQuery(
    selectedMailbox?.type === "gmail" ? selectedMailbox.id : null,
    20,
  );

  const { data: gmailLabels = [] } = useGmailLabelsQuery(
    selectedMailbox?.type === "gmail" ? selectedMailbox.id : null,
  );

  const { data: currentGmailMessage } = useGmailMessageQuery(
    selectedMailbox?.type === "gmail" ? selectedMailbox.id : null,
    currentMessageId,
  );

  // Outlook Queries - always called, but disabled when not needed
  const outlookMessagesQuery = useOutlookMessagesQuery(
    selectedMailbox?.type === "outlook" ? selectedMailbox.id : null,
    selectedFolder?.id || "inbox",
    20,
  );

  const outlookSentQuery = useOutlookSentMessagesQuery(
    selectedMailbox?.type === "outlook" ? selectedMailbox.id : null,
    20,
  );
  const outlookTrashQuery = useOutlookTrashMessagesQuery(
    selectedMailbox?.type === "outlook" ? selectedMailbox.id : null,
    20,
  );
  const outlookSpamQuery = useOutlookSpamMessagesQuery(
    selectedMailbox?.type === "outlook" ? selectedMailbox.id : null,
    20,
  );
  const outlookArchiveQuery = useOutlookArchiveMessagesQuery(
    selectedMailbox?.type === "outlook" ? selectedMailbox.id : null,
    20,
  );
  const outlookOutboxQuery = useOutlookOutboxMessagesQuery(
    selectedMailbox?.type === "outlook" ? selectedMailbox.id : null,
    20,
  );
  const outlookDraftsQuery = useOutlookDraftsQuery(
    selectedMailbox?.type === "outlook" ? selectedMailbox.id : null,
    20,
  );

  const { data: outlookFoldersData = { folders: [] } } = useOutlookFoldersQuery(
    selectedMailbox?.type === "outlook" ? selectedMailbox.id : null,
  );

  const { data: currentOutlookMessage } = useOutlookMessageQuery(
    selectedMailbox?.type === "outlook" ? selectedMailbox.id : null,
    currentMessageId,
  );

  // SMTP Queries - always called, but disabled when not needed
  const smtpMessagesQuery = useSmtpMessagesQuery(
    selectedMailbox?.type === "smtp" ? selectedMailbox.id : null,
    currentPage,
    20,
    selectedFolder?.name || "INBOX",
  );

  const smtpSentQuery = useSmtpSentMessagesQuery(
    selectedMailbox?.type === "smtp" ? selectedMailbox.id : null,
    currentPage,
    20,
  );
  const smtpDraftsQuery = useSmtpDraftMessagesQuery(
    selectedMailbox?.type === "smtp" ? selectedMailbox.id : null,
    currentPage,
    20,
  );
  const smtpTrashQuery = useSmtpTrashMessagesQuery(
    selectedMailbox?.type === "smtp" ? selectedMailbox.id : null,
    currentPage,
    20,
  );
  const smtpSpamQuery = useSmtpSpamMessagesQuery(
    selectedMailbox?.type === "smtp" ? selectedMailbox.id : null,
    currentPage,
    20,
  );
  const smtpArchiveQuery = useSmtpArchiveMessagesQuery(
    selectedMailbox?.type === "smtp" ? selectedMailbox.id : null,
    currentPage,
    20,
  );

  const { data: smtpFoldersData = { folders: [] } } = useSmtpFoldersQuery(
    selectedMailbox?.type === "smtp" ? selectedMailbox.id : null,
  );

  const { data: currentSmtpMessage } = useSmtpMessageQuery(
    selectedMailbox?.type === "smtp" ? selectedMailbox.id : null,
    currentMessageId,
    selectedFolder?.name,
  );

  // =========================
  // MUTATIONS
  // =========================
  const markGmailAsRead = useMarkGmailAsReadMutation();
  const deleteGmailMessage = useDeleteGmailMessageMutation();
  const syncGmailMailbox = useSyncGmailMailboxMutation();
  const refreshGmailToken = useRefreshGmailTokenMutation();
  const disconnectGmailMailbox = useDisconnectGmailMailboxMutation();

  const markOutlookAsRead = useMarkOutlookAsReadMutation();
  const deleteOutlookMessage = useDeleteOutlookMessageMutation();
  const syncOutlookMailbox = useSyncOutlookMailboxMutation();
  const refreshOutlookToken = useRefreshOutlookTokenMutation();
  const disconnectOutlookMailbox = useDisconnectOutlookMailboxMutation();

  const markSmtpAsRead = useMarkSmtpAsReadMutation();
  const markSmtpAsUnread = useMarkSmtpAsUnreadMutation();
  const deleteSmtpMessage = useDeleteSmtpMessageMutation();
  const syncSmtpMailbox = useSyncSmtpMailboxMutation();
  const disconnectSmtpMailbox = useDisconnectSmtpMailboxMutation();

  // =========================
  // DERIVED DATA - Select active queries based on mailbox type
  // =========================

  // Get current messages based on mailbox type and selected folder
  const messages = useMemo(() => {
    if (!selectedMailbox) return [];

    if (selectedMailbox.type === "gmail") {
      if (!selectedFolder)
        return gmailMessagesQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "SENT")
        return gmailSentQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "TRASH")
        return gmailTrashQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "SPAM")
        return gmailSpamQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "STARRED")
        return gmailStarredQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "IMPORTANT")
        return gmailImportantQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "DRAFT")
        return gmailDraftsQuery.data?.pages.flatMap((p) => p.drafts) || [];
      return gmailMessagesQuery.data?.pages.flatMap((p) => p.messages) || [];
    }

    if (selectedMailbox.type === "outlook") {
      if (!selectedFolder)
        return (
          outlookMessagesQuery.data?.pages.flatMap((p) => p.messages) || []
        );
      if (selectedFolder.id === "sentitems")
        return outlookSentQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "deleteditems")
        return outlookTrashQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "junkemail")
        return outlookSpamQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "archive")
        return outlookArchiveQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "outbox")
        return outlookOutboxQuery.data?.pages.flatMap((p) => p.messages) || [];
      if (selectedFolder.id === "drafts")
        return outlookDraftsQuery.data?.pages.flatMap((p) => p.messages) || [];
      return outlookMessagesQuery.data?.pages.flatMap((p) => p.messages) || [];
    }

    if (selectedMailbox.type === "smtp") {
      if (!selectedFolder) return smtpMessagesQuery.data?.messages || [];
      if (selectedFolder.name === "SENT")
        return smtpSentQuery.data?.messages || [];
      if (selectedFolder.name === "DRAFTS")
        return smtpDraftsQuery.data?.messages || [];
      if (selectedFolder.name === "TRASH")
        return smtpTrashQuery.data?.messages || [];
      if (selectedFolder.name === "SPAM")
        return smtpSpamQuery.data?.messages || [];
      if (selectedFolder.name === "ARCHIVE")
        return smtpArchiveQuery.data?.messages || [];
      return smtpMessagesQuery.data?.messages || [];
    }

    return [];
  }, [
    selectedMailbox,
    selectedFolder,
    gmailMessagesQuery.data,
    gmailSentQuery.data,
    gmailTrashQuery.data,
    gmailSpamQuery.data,
    gmailStarredQuery.data,
    gmailImportantQuery.data,
    gmailDraftsQuery.data,
    outlookMessagesQuery.data,
    outlookSentQuery.data,
    outlookTrashQuery.data,
    outlookSpamQuery.data,
    outlookArchiveQuery.data,
    outlookOutboxQuery.data,
    outlookDraftsQuery.data,
    smtpMessagesQuery.data,
    smtpSentQuery.data,
    smtpDraftsQuery.data,
    smtpTrashQuery.data,
    smtpSpamQuery.data,
    smtpArchiveQuery.data,
  ]);

  // Get current folders based on mailbox type
  const folders = useMemo(() => {
    if (!selectedMailbox) return [];
    if (selectedMailbox.type === "gmail") return gmailLabels;
    if (selectedMailbox.type === "outlook")
      return outlookFoldersData.folders || [];
    if (selectedMailbox.type === "smtp") return smtpFoldersData.folders || [];
    return [];
  }, [selectedMailbox, gmailLabels, outlookFoldersData, smtpFoldersData]);

  // Get current message based on mailbox type
  const currentMessage = useMemo(() => {
    if (!selectedMailbox) return null;
    if (selectedMailbox.type === "gmail") return currentGmailMessage;
    if (selectedMailbox.type === "outlook") return currentOutlookMessage;
    if (selectedMailbox.type === "smtp") return currentSmtpMessage;
    return null;
  }, [
    selectedMailbox,
    currentGmailMessage,
    currentOutlookMessage,
    currentSmtpMessage,
  ]);

  // Loading states
  const isLoading = isLoadingMailboxes;

  const isLoadingMessages = useMemo(() => {
    if (!selectedMailbox) return false;
    if (selectedMailbox.type === "gmail") {
      if (!selectedFolder) return gmailMessagesQuery.isLoading;
      if (selectedFolder.id === "SENT") return gmailSentQuery.isLoading;
      if (selectedFolder.id === "TRASH") return gmailTrashQuery.isLoading;
      if (selectedFolder.id === "SPAM") return gmailSpamQuery.isLoading;
      if (selectedFolder.id === "STARRED") return gmailStarredQuery.isLoading;
      if (selectedFolder.id === "IMPORTANT")
        return gmailImportantQuery.isLoading;
      if (selectedFolder.id === "DRAFT") return gmailDraftsQuery.isLoading;
      return gmailMessagesQuery.isLoading;
    }
    if (selectedMailbox.type === "outlook") {
      if (!selectedFolder) return outlookMessagesQuery.isLoading;
      if (selectedFolder.id === "sentitems") return outlookSentQuery.isLoading;
      if (selectedFolder.id === "deleteditems")
        return outlookTrashQuery.isLoading;
      if (selectedFolder.id === "junkemail") return outlookSpamQuery.isLoading;
      if (selectedFolder.id === "archive") return outlookArchiveQuery.isLoading;
      if (selectedFolder.id === "outbox") return outlookOutboxQuery.isLoading;
      if (selectedFolder.id === "drafts") return outlookDraftsQuery.isLoading;
      return outlookMessagesQuery.isLoading;
    }
    if (selectedMailbox.type === "smtp") {
      if (!selectedFolder) return smtpMessagesQuery.isLoading;
      if (selectedFolder.name === "SENT") return smtpSentQuery.isLoading;
      if (selectedFolder.name === "DRAFTS") return smtpDraftsQuery.isLoading;
      if (selectedFolder.name === "TRASH") return smtpTrashQuery.isLoading;
      if (selectedFolder.name === "SPAM") return smtpSpamQuery.isLoading;
      if (selectedFolder.name === "ARCHIVE") return smtpArchiveQuery.isLoading;
      return smtpMessagesQuery.isLoading;
    }
    return false;
  }, [
    selectedMailbox,
    selectedFolder,
    gmailMessagesQuery.isLoading,
    gmailSentQuery.isLoading,
    gmailTrashQuery.isLoading,
    gmailSpamQuery.isLoading,
    gmailStarredQuery.isLoading,
    gmailImportantQuery.isLoading,
    gmailDraftsQuery.isLoading,
    outlookMessagesQuery.isLoading,
    outlookSentQuery.isLoading,
    outlookTrashQuery.isLoading,
    outlookSpamQuery.isLoading,
    outlookArchiveQuery.isLoading,
    outlookOutboxQuery.isLoading,
    outlookDraftsQuery.isLoading,
    smtpMessagesQuery.isLoading,
    smtpSentQuery.isLoading,
    smtpDraftsQuery.isLoading,
    smtpTrashQuery.isLoading,
    smtpSpamQuery.isLoading,
    smtpArchiveQuery.isLoading,
  ]);

  const isSyncing = useMemo(() => {
    if (!selectedMailbox) return false;
    if (selectedMailbox.type === "gmail") return syncGmailMailbox.isPending;
    if (selectedMailbox.type === "outlook") return syncOutlookMailbox.isPending;
    if (selectedMailbox.type === "smtp") return syncSmtpMailbox.isPending;
    return false;
  }, [
    selectedMailbox,
    syncGmailMailbox.isPending,
    syncOutlookMailbox.isPending,
    syncSmtpMailbox.isPending,
  ]);

  const error = useMemo(() => {
    if (!selectedMailbox) return null;
    if (selectedMailbox.type === "gmail") return gmailMessagesQuery.error;
    if (selectedMailbox.type === "outlook") return outlookMessagesQuery.error;
    if (selectedMailbox.type === "smtp") return smtpMessagesQuery.error;
    return null;
  }, [
    selectedMailbox,
    gmailMessagesQuery.error,
    outlookMessagesQuery.error,
    smtpMessagesQuery.error,
  ]);

  // =========================
  // CUSTOM HOOKS
  // =========================
  const filters = useMessageFilters({
    messages,
    filterUnread,
    filterStarred,
    filterAttachments,
    searchQuery,
    dateRange,
  });

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    if (selectedMailbox) {
      setCurrentPage(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
      setTotalMessages(0);
      setCurrentMessageId(null);
    }
  }, [selectedMailbox?.id, selectedFolder?.id]);

  // Update pagination based on query data
  useEffect(() => {
    if (!selectedMailbox) return;

    if (selectedMailbox.type === "gmail") {
      const query = !selectedFolder
        ? gmailMessagesQuery
        : selectedFolder.id === "SENT"
          ? gmailSentQuery
          : selectedFolder.id === "TRASH"
            ? gmailTrashQuery
            : selectedFolder.id === "SPAM"
              ? gmailSpamQuery
              : selectedFolder.id === "STARRED"
                ? gmailStarredQuery
                : selectedFolder.id === "IMPORTANT"
                  ? gmailImportantQuery
                  : selectedFolder.id === "DRAFT"
                    ? gmailDraftsQuery
                    : gmailMessagesQuery;

      setHasNextPage(!!query.hasNextPage);
      setHasPreviousPage(currentPage > 1);
      setTotalMessages(query.data?.pages[0]?.resultSizeEstimate || 0);
    }

    if (selectedMailbox.type === "outlook") {
      const query = !selectedFolder
        ? outlookMessagesQuery
        : selectedFolder.id === "sentitems"
          ? outlookSentQuery
          : selectedFolder.id === "deleteditems"
            ? outlookTrashQuery
            : selectedFolder.id === "junkemail"
              ? outlookSpamQuery
              : selectedFolder.id === "archive"
                ? outlookArchiveQuery
                : selectedFolder.id === "outbox"
                  ? outlookOutboxQuery
                  : selectedFolder.id === "drafts"
                    ? outlookDraftsQuery
                    : outlookMessagesQuery;

      setHasNextPage(!!query.hasNextPage);
      setHasPreviousPage(currentPage > 1);
      setTotalMessages(query.data?.pages[0]?.count || 0);
    }

    if (selectedMailbox.type === "smtp") {
      const query = !selectedFolder
        ? smtpMessagesQuery
        : selectedFolder.name === "SENT"
          ? smtpSentQuery
          : selectedFolder.name === "DRAFTS"
            ? smtpDraftsQuery
            : selectedFolder.name === "TRASH"
              ? smtpTrashQuery
              : selectedFolder.name === "SPAM"
                ? smtpSpamQuery
                : selectedFolder.name === "ARCHIVE"
                  ? smtpArchiveQuery
                  : smtpMessagesQuery;

      setHasNextPage(currentPage < (query.data?.totalPages || 1));
      setHasPreviousPage(currentPage > 1);
      setTotalMessages(query.data?.totalCount || 0);
    }
  }, [
    selectedMailbox,
    selectedFolder,
    currentPage,
    gmailMessagesQuery,
    gmailSentQuery,
    gmailTrashQuery,
    gmailSpamQuery,
    gmailStarredQuery,
    gmailImportantQuery,
    gmailDraftsQuery,
    outlookMessagesQuery,
    outlookSentQuery,
    outlookTrashQuery,
    outlookSpamQuery,
    outlookArchiveQuery,
    outlookOutboxQuery,
    outlookDraftsQuery,
    smtpMessagesQuery,
    smtpSentQuery,
    smtpDraftsQuery,
    smtpTrashQuery,
    smtpSpamQuery,
    smtpArchiveQuery,
  ]);

  // =========================
  // HANDLERS
  // =========================
  const handleSelectMailbox = useCallback(
    async (mailbox) => {
      setSelectedMailbox(mailbox);
      setView("messages");
      setSelectedFolder(null);
      setSelectedMessages([]);
      setFilterUnread(false);
      setFilterStarred(false);
      setFilterAttachments(false);
      setSearchQuery("");
      setCurrentPage(1);
      setCurrentMessageId(null);

      // Prefetch folders
      if (mailbox.type === "gmail") {
        queryClient.prefetchQuery({
          queryKey: ["gmail", mailbox.id, "labels"],
        });
      } else if (mailbox.type === "outlook") {
        queryClient.prefetchQuery({
          queryKey: ["outlook", mailbox.id, "folders"],
        });
      } else if (mailbox.type === "smtp") {
        queryClient.prefetchQuery({
          queryKey: ["smtp", mailbox.id, "folders"],
        });
      }
    },
    [queryClient],
  );

  const handleSelectFolder = useCallback((folder) => {
    setSelectedFolder(folder);
    setSelectedMessages([]);
    setFilterUnread(false);
    setFilterStarred(false);
    setFilterAttachments(false);
    setSearchQuery("");
    setCurrentPage(1);
    setCurrentMessageId(null);
  }, []);

  const handleSelectMessage = useCallback(
    async (message) => {
      if (!selectedMailbox) return;

      const messageId = message.id || message.messageId || message.uid;
      setCurrentMessageId(messageId);
      setView("message");

      // Mark as read if unread
      if (!message.isRead) {
        try {
          if (selectedMailbox.type === "gmail") {
            await markGmailAsRead.mutateAsync({
              mailboxId: selectedMailbox.id,
              messageId,
            });
          } else if (selectedMailbox.type === "outlook") {
            await markOutlookAsRead.mutateAsync({
              mailboxId: selectedMailbox.id,
              messageId,
            });
          } else if (selectedMailbox.type === "smtp") {
            await markSmtpAsRead.mutateAsync({
              mailboxId: selectedMailbox.id,
              messageId,
              folder: selectedFolder?.name,
            });
          }
        } catch (error) {
          console.error("Failed to mark as read:", error);
        }
      }
    },
    [
      selectedMailbox,
      selectedFolder,
      markGmailAsRead,
      markOutlookAsRead,
      markSmtpAsRead,
    ],
  );

  const handleDeleteMessage = useCallback(
    async (messageId) => {
      if (!window.confirm("Delete this message?")) return;

      try {
        if (selectedMailbox.type === "gmail") {
          await deleteGmailMessage.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId,
          });
        } else if (selectedMailbox.type === "outlook") {
          await deleteOutlookMessage.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId,
          });
        } else if (selectedMailbox.type === "smtp") {
          await deleteSmtpMessage.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId,
            folder: selectedFolder?.name,
          });
        }

        toast.success("Message deleted");
        setView("messages");
        setCurrentMessageId(null);
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete message");
      }
    },
    [
      selectedMailbox,
      selectedFolder,
      deleteGmailMessage,
      deleteOutlookMessage,
      deleteSmtpMessage,
    ],
  );

  const handleCheckMessage = useCallback((messageId, checked) => {
    setSelectedMessages((prev) =>
      checked ? [...prev, messageId] : prev.filter((id) => id !== messageId),
    );
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedMessages.length === 0) return;
    if (!window.confirm(`Delete ${selectedMessages.length} message(s)?`))
      return;

    let successCount = 0;
    for (const messageId of selectedMessages) {
      try {
        if (selectedMailbox.type === "gmail") {
          await deleteGmailMessage.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId,
          });
        } else if (selectedMailbox.type === "outlook") {
          await deleteOutlookMessage.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId,
          });
        } else if (selectedMailbox.type === "smtp") {
          await deleteSmtpMessage.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId,
            folder: selectedFolder?.name,
          });
        }
        successCount++;
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} message(s)`);
      setSelectedMessages([]);
    }
  }, [
    selectedMessages,
    selectedMailbox,
    selectedFolder,
    deleteGmailMessage,
    deleteOutlookMessage,
    deleteSmtpMessage,
  ]);

  const handleBulkMarkRead = useCallback(async () => {
    if (selectedMessages.length === 0) return;

    let successCount = 0;
    for (const messageId of selectedMessages) {
      const message = messages.find(
        (m) => (m.id || m.messageId || m.uid) === messageId,
      );
      if (!message?.isRead) {
        try {
          if (selectedMailbox.type === "gmail") {
            await markGmailAsRead.mutateAsync({
              mailboxId: selectedMailbox.id,
              messageId,
            });
          } else if (selectedMailbox.type === "outlook") {
            await markOutlookAsRead.mutateAsync({
              mailboxId: selectedMailbox.id,
              messageId,
            });
          } else if (selectedMailbox.type === "smtp") {
            await markSmtpAsRead.mutateAsync({
              mailboxId: selectedMailbox.id,
              messageId,
              folder: selectedFolder?.name,
            });
          }
          successCount++;
        } catch (error) {
          console.error("Failed to mark as read:", error);
        }
      }
    }

    if (successCount > 0) {
      toast.success(`Marked ${successCount} message(s) as read`);
      setSelectedMessages([]);
    }
  }, [
    selectedMessages,
    messages,
    selectedMailbox,
    selectedFolder,
    markGmailAsRead,
    markOutlookAsRead,
    markSmtpAsRead,
  ]);

  const handleBulkMarkUnread = useCallback(async () => {
    if (selectedMessages.length === 0 || selectedMailbox?.type !== "smtp")
      return;

    let successCount = 0;
    for (const messageId of selectedMessages) {
      try {
        await markSmtpAsUnread.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageId,
          folder: selectedFolder?.name,
        });
        successCount++;
      } catch (error) {
        console.error("Failed to mark as unread:", error);
      }
    }

    if (successCount > 0) {
      toast.success(`Marked ${successCount} message(s) as unread`);
      setSelectedMessages([]);
    }
  }, [selectedMessages, selectedMailbox, selectedFolder, markSmtpAsUnread]);

  const handleSync = useCallback(async () => {
    if (!selectedMailbox) return;

    try {
      if (selectedMailbox.type === "gmail") {
        await syncGmailMailbox.mutateAsync({
          mailboxId: selectedMailbox.id,
          folderId: selectedFolder?.id || "INBOX",
        });
      } else if (selectedMailbox.type === "outlook") {
        await syncOutlookMailbox.mutateAsync({
          mailboxId: selectedMailbox.id,
          folderId: selectedFolder?.id || "inbox",
        });
      } else if (selectedMailbox.type === "smtp") {
        await syncSmtpMailbox.mutateAsync({
          mailboxId: selectedMailbox.id,
          folder: selectedFolder?.name || "INBOX",
        });
      }
      toast.success("Mailbox synced");
    } catch (error) {
      console.log(error);
      toast.error("Failed to sync mailbox");
    }
  }, [
    selectedMailbox,
    selectedFolder,
    syncGmailMailbox,
    syncOutlookMailbox,
    syncSmtpMailbox,
  ]);

  const handleRefreshToken = useCallback(async () => {
    if (!selectedMailbox) return;
    if (selectedMailbox.type === "smtp") {
      toast.error("Token refresh not supported for SMTP");
      return;
    }

    try {
      if (selectedMailbox.type === "gmail") {
        await refreshGmailToken.mutateAsync({ mailboxId: selectedMailbox.id });
      } else if (selectedMailbox.type === "outlook") {
        await refreshOutlookToken.mutateAsync({
          mailboxId: selectedMailbox.id,
        });
      }
      toast.success("Token refreshed");
    } catch (error) {
      console.log(error);
      toast.error("Failed to refresh token");
    }
  }, [selectedMailbox, refreshGmailToken, refreshOutlookToken]);

  const handleDisconnect = useCallback(async () => {
    if (!selectedMailbox) return;
    if (!window.confirm(`Disconnect ${selectedMailbox.email}?`)) return;

    try {
      if (selectedMailbox.type === "gmail") {
        await disconnectGmailMailbox.mutateAsync({
          mailboxId: selectedMailbox.id,
        });
      } else if (selectedMailbox.type === "outlook") {
        await disconnectOutlookMailbox.mutateAsync({
          mailboxId: selectedMailbox.id,
        });
      } else if (selectedMailbox.type === "smtp") {
        await disconnectSmtpMailbox.mutateAsync({
          mailboxId: selectedMailbox.id,
        });
      }

      setSelectedMailbox(null);
      setView("list");
      setCurrentMessageId(null);
      toast.success("Mailbox disconnected");
    } catch (error) {
      console.log(error);
      toast.error("Failed to disconnect mailbox");
    }
  }, [
    selectedMailbox,
    disconnectGmailMailbox,
    disconnectOutlookMailbox,
    disconnectSmtpMailbox,
  ]);

  const handleNextPage = useCallback(() => {
    if (!hasNextPage) return;

    if (selectedMailbox.type === "gmail") {
      if (!selectedFolder) gmailMessagesQuery.fetchNextPage();
      else if (selectedFolder.id === "SENT") gmailSentQuery.fetchNextPage();
      else if (selectedFolder.id === "TRASH") gmailTrashQuery.fetchNextPage();
      else if (selectedFolder.id === "SPAM") gmailSpamQuery.fetchNextPage();
      else if (selectedFolder.id === "STARRED")
        gmailStarredQuery.fetchNextPage();
      else if (selectedFolder.id === "IMPORTANT")
        gmailImportantQuery.fetchNextPage();
      else if (selectedFolder.id === "DRAFT") gmailDraftsQuery.fetchNextPage();
      else gmailMessagesQuery.fetchNextPage();
    } else if (selectedMailbox.type === "outlook") {
      if (!selectedFolder) outlookMessagesQuery.fetchNextPage();
      else if (selectedFolder.id === "sentitems")
        outlookSentQuery.fetchNextPage();
      else if (selectedFolder.id === "deleteditems")
        outlookTrashQuery.fetchNextPage();
      else if (selectedFolder.id === "junkemail")
        outlookSpamQuery.fetchNextPage();
      else if (selectedFolder.id === "archive")
        outlookArchiveQuery.fetchNextPage();
      else if (selectedFolder.id === "outbox")
        outlookOutboxQuery.fetchNextPage();
      else if (selectedFolder.id === "drafts")
        outlookDraftsQuery.fetchNextPage();
      else outlookMessagesQuery.fetchNextPage();
    } else if (selectedMailbox.type === "smtp") {
      setCurrentPage((prev) => prev + 1);
    }
  }, [
    selectedMailbox,
    selectedFolder,
    hasNextPage,
    gmailMessagesQuery,
    gmailSentQuery,
    gmailTrashQuery,
    gmailSpamQuery,
    gmailStarredQuery,
    gmailImportantQuery,
    gmailDraftsQuery,
    outlookMessagesQuery,
    outlookSentQuery,
    outlookTrashQuery,
    outlookSpamQuery,
    outlookArchiveQuery,
    outlookOutboxQuery,
    outlookDraftsQuery,
  ]);

  const handlePreviousPage = useCallback(() => {
    if (!hasPreviousPage) return;
    setCurrentPage((prev) => prev - 1);
  }, [hasPreviousPage]);

  const handleBackToMailboxes = useCallback(() => {
    setSelectedMailbox(null);
    setSelectedFolder(null);
    setView("list");
    setSelectedMessages([]);
    setFilterUnread(false);
    setFilterStarred(false);
    setFilterAttachments(false);
    setSearchQuery("");
    setCurrentPage(1);
    setCurrentMessageId(null);
  }, []);

  const handleBackToMessages = useCallback(() => {
    setView("messages");
    setSelectedMessages([]);
    setCurrentMessageId(null);
  }, []);

  // =========================
  // DERIVED VALUES
  // =========================
  const filteredMessages = useMemo(() => filters.apply(), [filters, messages]);

  const startMessageCount = useMemo(
    () => (messages.length > 0 ? (currentPage - 1) * 20 + 1 : 0),
    [messages.length, currentPage],
  );

  const endMessageCount = useMemo(
    () => startMessageCount + filteredMessages.length - 1,
    [startMessageCount, filteredMessages.length],
  );

  const getFolderUnreadCount = useCallback(() => {
    const inbox = folders.find((f) => f.name?.toLowerCase() === "inbox");
    return inbox?.unreadCount || 0;
  }, [folders]);

  // Loading state
  if (isLoading && mailboxes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading mailboxes...</p>
        </div>
      </div>
    );
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        view={view}
        selectedMailbox={selectedMailbox}
        selectedFolder={selectedFolder}
        currentMessage={currentMessage}
        mailboxesCount={mailboxes.length}
        getFolderUnreadCount={getFolderUnreadCount}
        filterUnread={filterUnread}
        filterStarred={filterStarred}
        filterAttachments={filterAttachments}
        totalMessages={totalMessages}
        startMessageCount={startMessageCount}
        endMessageCount={endMessageCount}
        getSubject={getSubject}
        onBack={
          view === "message" ? handleBackToMessages : handleBackToMailboxes
        }
        onRefresh={refetchMailboxes}
        isLoading={isLoading}
        onCompose={() => toast.info("Compose coming soon")}
        onSync={handleSync}
        isSyncing={isSyncing}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showStats={showStats}
        onShowStatsChange={setShowStats}
        onFilterUnread={() => setFilterUnread(!filterUnread)}
        filterUnreadActive={filterUnread}
        onRefreshToken={handleRefreshToken}
        showRefreshToken={selectedMailbox?.type !== "smtp"}
        onDisconnect={handleDisconnect}
        selectedMessages={selectedMessages}
        onBulkMarkRead={handleBulkMarkRead}
        onBulkMarkUnread={handleBulkMarkUnread}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedMessages([])}
        mailboxType={selectedMailbox?.type}
        onReply={handleBackToMessages}
        onForward={handleBackToMessages}
        onDeleteMessage={() =>
          handleDeleteMessage(
            currentMessage?.id ||
              currentMessage?.messageId ||
              currentMessage?.uid,
          )
        }
        showMessageActions={view === "message"}
      />

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
          <button
            onClick={() =>
              queryClient.resetQueries({
                queryKey: [selectedMailbox?.type, selectedMailbox?.id],
              })
            }
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {view === "list" && (
          <MailboxList
            mailboxes={mailboxes}
            onSelect={handleSelectMailbox}
            getProviderIcon={getProviderIcon}
            timeAgo={timeAgo}
            format={format}
          />
        )}

        {view === "messages" && selectedMailbox && (
          <MessagesView
            selectedMailbox={selectedMailbox}
            selectedFolder={selectedFolder}
            folders={folders}
            showStats={showStats}
            filteredMessages={filteredMessages}
            isLoadingMessages={isLoadingMessages}
            viewMode={viewMode}
            selectedMessages={selectedMessages}
            onSelectFolder={handleSelectFolder}
            showAllFolders={showAllFolders}
            onToggleShowAllFolders={() => setShowAllFolders(!showAllFolders)}
            onSelectMessage={handleSelectMessage}
            onCheckMessage={handleCheckMessage}
            formatMessageDate={formatMessageDate}
            getSender={getSenderInfo}
            getSubject={getSubject}
            getPreview={getPreview}
            getInitials={getInitials}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchClear={() => setSearchQuery("")}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filterStarred={filterStarred}
            onFilterStarred={() => setFilterStarred(!filterStarred)}
            filterAttachments={filterAttachments}
            onFilterAttachments={() => setFilterAttachments(!filterAttachments)}
            filterUnread={filterUnread}
            pagination={{
              currentPage,
              hasNextPage,
              hasPreviousPage,
              totalMessages,
            }}
            onNextPage={handleNextPage}
            onPrevPage={handlePreviousPage}
            startMessageCount={startMessageCount}
            endMessageCount={endMessageCount}
            totalMessages={totalMessages}
          />
        )}

        {view === "message" && currentMessage && selectedMailbox && (
          <MessageDetailView
            message={currentMessage}
            mailbox={selectedMailbox}
            onBack={handleBackToMessages}
            onDelete={() =>
              handleDeleteMessage(
                currentMessage.id ||
                  currentMessage.messageId ||
                  currentMessage.uid,
              )
            }
            onReply={() => toast.info("Reply coming soon")}
            onForward={() => toast.info("Forward coming soon")}
            onMarkRead={() => {
              if (selectedMailbox.type === "gmail") {
                markGmailAsRead.mutate({
                  mailboxId: selectedMailbox.id,
                  messageId:
                    currentMessage.id ||
                    currentMessage.messageId ||
                    currentMessage.uid,
                });
              } else if (selectedMailbox.type === "outlook") {
                markOutlookAsRead.mutate({
                  mailboxId: selectedMailbox.id,
                  messageId:
                    currentMessage.id ||
                    currentMessage.messageId ||
                    currentMessage.uid,
                });
              } else if (selectedMailbox.type === "smtp") {
                markSmtpAsRead.mutate({
                  mailboxId: selectedMailbox.id,
                  messageId:
                    currentMessage.id ||
                    currentMessage.messageId ||
                    currentMessage.uid,
                  folder: selectedFolder?.name,
                });
              }
            }}
            onMarkUnread={() => {
              if (selectedMailbox.type === "smtp") {
                markSmtpAsUnread.mutate({
                  mailboxId: selectedMailbox.id,
                  messageId:
                    currentMessage.id ||
                    currentMessage.messageId ||
                    currentMessage.uid,
                  folder: selectedFolder?.name,
                });
              }
            }}
            onStar={() => toast.info("Star coming soon")}
            onPrint={() => window.print()}
            onDownload={() => toast.info("Download coming soon")}
          />
        )}
      </div>
    </div>
  );
};

export default Mailboxes;
