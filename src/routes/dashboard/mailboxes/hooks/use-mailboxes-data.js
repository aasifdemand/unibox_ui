/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useMessageFilters } from './index';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  formatMessageDate,
  getSenderInfo,
  getSubject,
  getPreview,
  getInitials,
  getProviderIcon,
  timeAgo,
} from '../utils/utils';

import { useMailboxes, useUpdateWarmupSettings } from '../../../../hooks/useMailboxes';
import { useBulkDeleteSenders } from '../../../../hooks/useSenders';
import { useSocketEvents } from '../../../../hooks/useSocketEvents';
import { useGmailData } from './use-gmail-data';
import { useOutlookData } from './use-outlook-data';
import { useSmtpData } from './use-smtp-data';
import { getProviderMessageId } from '../utils/getmessage-id';
import { isFolderType } from '../utils/folder-utils';
import { useCurrentUser } from '../../../../hooks/useAuth';

const PAGE_SIZE = 10;

export const useMailboxesData = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const userTz = user?.timezone || 'UTC';

  // =========================
  // SOCKET EVENTS (REAL-TIME UPDATES)
  // =========================
  useSocketEvents({
    mailbox_updated: (data) => {
      // Data contains { senderId, senderEmail, messageId }
      // This will trigger a background refetch of all mailbox counts and lists
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });

      // If we are currently viewing this specific mailbox, invalidate its messages too
      if (data?.senderId) {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return key.includes(data.senderId);
          },
        });
      }
    },
    mailbox_synced: (data) => {
      // Triggered when a background sync finishes
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });

  // =========================
  // HANDLE OAUTH REDIRECT TOASTS
  // =========================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    const message = params.get('message');

    if (success) {
      toast.success(t('mailboxes.auth_success', 'Account connected successfully!'));
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (error) {
      const errorMsg = message || t('mailboxes.auth_failed', 'Authentication failed');
      toast.error(errorMsg, { duration: 6000 });
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [t]);

  // =========================
  // LOCAL STATE
  // =========================
  const [selectedMailbox, setSelectedMailbox] = useState(null);
  const [view, setView] = useState('list');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showAllFolders, setShowAllFolders] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [showStats, setShowStats] = useState(true);
  const [currentMessageId, setCurrentMessageId] = useState(null);

  // Filter state
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterStarred, setFilterStarred] = useState(false);
  const [filterAttachments, setFilterAttachments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [dateRange, setDateRange] = useState('all');

  const [isComposing, setIsComposing] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);

  // Mailbox list state
  const [mailboxPage, setMailboxPage] = useState(1);
  const [mailboxSearch, setMailboxSearch] = useState('');
  const debouncedMailboxSearch = useDebounce(mailboxSearch, 400);

  const [mailboxTypeFilter, setMailboxTypeFilter] = useState([]);
  const [selectedSenderIds, setSelectedSenderIds] = useState([]);
  const MAILBOX_PAGE_SIZE = 10;

  // Pagination state (for messages)
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

  // =========================
  // MAILBOXES
  // =========================
  const {
    data: mailboxResponse = { mailboxes: [], meta: {} },
    isLoading: isLoadingMailboxes,
    refetch: refetchMailboxes,
  } = useMailboxes({
    page: mailboxPage,
    limit: MAILBOX_PAGE_SIZE,
    search: debouncedMailboxSearch,
    type: Array.isArray(mailboxTypeFilter)
      ? mailboxTypeFilter.length > 0
        ? mailboxTypeFilter.join(',')
        : 'all'
      : mailboxTypeFilter || 'all',
  });

  const bulkDeleteSenders = useBulkDeleteSenders();
  const updateWarmupMutation = useUpdateWarmupSettings();

  const mailboxes = mailboxResponse.mailboxes;
  const mailboxMeta = mailboxResponse.meta;

  // =========================
  // PROVIDER DATA HOOKS
  // =========================
  const gmail = useGmailData(
    selectedMailbox,
    selectedFolder,
    currentMessageId,
    PAGE_SIZE,
    debouncedSearchQuery,
  );
  const outlook = useOutlookData(
    selectedMailbox,
    selectedFolder,
    currentMessageId,
    PAGE_SIZE,
    debouncedSearchQuery,
  );
  const smtp = useSmtpData(
    selectedMailbox,
    selectedFolder,
    currentMessageId,
    currentPage,
    PAGE_SIZE,
    debouncedSearchQuery,
  );

  // Helpers to get the right provider data
  const getProvider = () => {
    if (!selectedMailbox) return null;
    if (selectedMailbox.type === 'gmail') return gmail;
    if (selectedMailbox.type === 'outlook') return outlook;
    if (selectedMailbox.type === 'smtp') return smtp;
    return null;
  };

  const provider = getProvider();

  // =========================
  // DERIVED DATA
  // =========================

  const messages = useMemo(() => {
    if (!selectedMailbox || !provider) return [];

    // When a search query is active, bypass the folder requirement —
    // search results come from the provider's search query, not a folder query.
    if (debouncedSearchQuery) {
      const searchData = provider.queries.search?.data;
      if (selectedMailbox.type === 'smtp') return searchData?.messages || [];
      return searchData?.pages?.flatMap((p) => p.messages) || [];
    }

    // Without a search query, we need a folder selected to know which messages to show.
    if (!selectedFolder) return [];

    const q = provider.queries;
    const pageIndex = currentPage - 1;

    // Helper to extract messages from any query page safely
    const getMsgs = (query, field = 'messages') => {
      const page = query?.data?.pages ? query.data.pages[pageIndex] : query?.data;
      return (page ? page[field] : []) || [];
    };

    if (selectedMailbox.type === 'gmail') {
      if (!selectedFolder) return getMsgs(q.messages);
      if (isFolderType(selectedFolder, 'sent')) return getMsgs(q.sent);
      if (isFolderType(selectedFolder, 'trash')) return getMsgs(q.trash);
      if (isFolderType(selectedFolder, 'spam')) return getMsgs(q.spam);
      if (isFolderType(selectedFolder, 'starred')) return getMsgs(q.starred);
      if (isFolderType(selectedFolder, 'important')) return getMsgs(q.important);
      if (isFolderType(selectedFolder, 'drafts')) return getMsgs(q.drafts, 'drafts');

      if (provider.queries?.isSpecialFolder) {
        return [];
      }

      return getMsgs(q.messages);
    }

    if (selectedMailbox.type === 'outlook') {
      if (!selectedFolder) return getMsgs(q.messages);
      if (isFolderType(selectedFolder, 'sent')) return getMsgs(q.sent);
      if (isFolderType(selectedFolder, 'trash')) return getMsgs(q.trash);
      if (isFolderType(selectedFolder, 'spam')) return getMsgs(q.spam);
      if (isFolderType(selectedFolder, 'archive')) return getMsgs(q.archive);
      if (isFolderType(selectedFolder, 'outbox')) return getMsgs(q.outbox);
      if (isFolderType(selectedFolder, 'drafts')) return getMsgs(q.drafts);

      // If it's a special folder but not one of the above, it's safer to return []
      // while loading or if it's disabled in useOutlookData.
      if (provider.queries?.isSpecialFolder) {
        return [];
      }

      return getMsgs(q.messages);
    }

    if (selectedMailbox.type === 'smtp') {
      if (!selectedFolder) return q.messages.data?.messages || [];
      if (isFolderType(selectedFolder, 'sent')) return q.sent.data?.messages || [];
      if (isFolderType(selectedFolder, 'drafts')) return q.drafts.data?.messages || [];
      if (isFolderType(selectedFolder, 'trash')) return q.trash.data?.messages || [];
      if (isFolderType(selectedFolder, 'spam')) return q.spam.data?.messages || [];
      if (isFolderType(selectedFolder, 'archive')) return q.archive.data?.messages || [];

      if (provider.queries?.isSpecialFolder) {
        return [];
      }

      return q.messages.data?.messages || [];
    }

    return [];
  }, [selectedMailbox, selectedFolder, currentPage, debouncedSearchQuery, provider?.queries]);

  const folders = useMemo(() => {
    if (!selectedMailbox) return [];
    if (selectedMailbox.type === 'gmail') return gmail.queries.labels.data || [];
    if (selectedMailbox.type === 'outlook') return outlook.queries.folders.data?.folders || [];
    if (selectedMailbox.type === 'smtp') return smtp.queries.folders.data?.folders || [];
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
    searchQuery: debouncedSearchQuery,
    dateRange,
  });

  const filteredMessages = useMemo(() => filters.apply(), [filters, messages]);

    // Derived folder metadata to ensure we always use the latest counts from the folders list
    const currentFolderMeta = useMemo(() => {
      if (!selectedFolder || !folders) return selectedFolder;
      // Find the folder in the current list by ID or Name
      const f = folders.find((item) => (item.id === selectedFolder.id) || (item.name === selectedFolder.name));
      return f || selectedFolder;
    }, [folders, selectedFolder]);

    // Pagination updates
    useEffect(() => {
      if (!selectedMailbox || !provider) return;

      if (debouncedSearchQuery) {
        const searchData = provider.queries.search?.data;
        if (selectedMailbox.type === 'smtp') {
          setHasNextPage(false);
          setTotalMessages(searchData?.totalCount || 0);
        } else {
          setHasNextPage(provider.queries.search.hasNextPage);
          const firstSearchPage = searchData?.pages?.[0];
          setTotalMessages(
            firstSearchPage?.totalResults ||
            firstSearchPage?.resultSizeEstimate ||
            firstSearchPage?.count ||
            0,
          );
        }
        return;
      }

      const q = provider.queries;
      let query;

      if (selectedMailbox.type === 'gmail') {
        query = !selectedFolder
          ? q.messages
          : isFolderType(selectedFolder, 'sent')
            ? q.sent
            : isFolderType(selectedFolder, 'trash')
              ? q.trash
              : isFolderType(selectedFolder, 'spam')
                ? q.spam
                : isFolderType(selectedFolder, 'starred')
                  ? q.starred
                  : isFolderType(selectedFolder, 'important')
                    ? q.important
                    : isFolderType(selectedFolder, 'drafts')
                      ? q.drafts
                      : q.messages;
      } else if (selectedMailbox.type === 'outlook') {
        query = !selectedFolder
          ? q.messages
          : isFolderType(selectedFolder, 'sent')
            ? q.sent
            : isFolderType(selectedFolder, 'trash')
              ? q.trash
              : isFolderType(selectedFolder, 'spam')
                ? q.spam
                : isFolderType(selectedFolder, 'archive')
                  ? q.archive
                  : isFolderType(selectedFolder, 'outbox')
                    ? q.outbox
                    : isFolderType(selectedFolder, 'drafts')
                      ? q.drafts
                      : isFolderType(selectedFolder, 'starred')
                        ? q.messages
                        : q.messages;
      } else {
        query = !selectedFolder
          ? q.messages
          : isFolderType(selectedFolder, 'sent')
            ? q.sent
            : isFolderType(selectedFolder, 'drafts')
              ? q.drafts
              : isFolderType(selectedFolder, 'trash')
                ? q.trash
                : isFolderType(selectedFolder, 'spam')
                  ? q.spam
                  : isFolderType(selectedFolder, 'archive')
                    ? q.archive
                    : q.messages;
      }

      // Identify if the query is for the CURRENTLY selected folder to avoid showing stale counts
      // For infinite queries, the first page metadata is authoritative for the folder content.
      const firstPage = query.data?.pages?.[0] || query.data;

      // Ensure we are not using data from a previous folder by checking the query's isPlaceholderData or similar
      // but since we don't have that easily, we'll check if the query is for the current folder.
      
      const folderTotal =
        currentFolderMeta?.totalItemCount ||
        currentFolderMeta?.messagesTotal ||
        currentFolderMeta?.totalCount ||
        currentFolderMeta?.itemCount ||
        currentFolderMeta?.count;

      const queryTotal =
        firstPage?.totalResults ||
        firstPage?.resultSizeEstimate ||
        firstPage?.totalCount ||
        firstPage?.count;

      // Determine authoritative total count
      let total = folderTotal || 0;

      // Only use query metadata if:
      // 1. It's a search query (which has no fixed folder meta)
      // 2. Folder metadata is missing/incomplete but the query has a result
      if (debouncedSearchQuery || (!folderTotal && queryTotal)) {
        total = queryTotal || 0;
      }

      // Gmail Special Case: NEVER use resultSizeEstimate if we have a folder total
      // because Gmail estimates are notoriously inaccurate (stuck at 201).
      if (selectedMailbox?.type === 'gmail' && !debouncedSearchQuery && folderTotal) {
        total = folderTotal;
      }
      
      setTotalMessages(total);
      
      if (selectedMailbox.type === 'smtp') {
        setHasNextPage(currentPage * PAGE_SIZE < total);
      } else {
        setHasNextPage(!!query.hasNextPage);
      }
      setHasPreviousPage(currentPage > 1);
    }, [
      selectedMailbox?.id, // Use ID to trigger reset on mailbox change
      selectedFolder?.id,  // Use ID to trigger reset on folder change
      currentFolderMeta, 
      currentPage, 
      debouncedSearchQuery, 
      provider?.queries
    ]);

  useEffect(() => {
    if (selectedFolder) {
      setSelectedMessages([]);
      setCurrentMessageId(null);
      // Reset total messages to 0 during transition to avoid flashes of previous folder counts
      setTotalMessages(0);
    }
  }, [selectedFolder?.id, selectedMailbox?.id]);

  // =========================
  // HANDLERS
  // =========================

  const handleSelectMailbox = useCallback((mailbox) => {
    setSelectedMailbox(mailbox);
    setSelectedFolder(null); // Reset folder when changing mailbox
    setView('messages');
    setCurrentPage(1);
    setSelectedMessages([]);
    setSearchQuery('');
  }, []);

  const handleMailboxPageChange = useCallback((page) => {
    setMailboxPage(page);
  }, []);

  const handleMailboxSearchChange = useCallback((search) => {
    setMailboxSearch(search);
    setMailboxPage(1);
  }, []);

  const handleMailboxTypeChange = useCallback((type) => {
    setMailboxTypeFilter((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      if (type === 'all') return [];
      if (current.includes(type)) return current.filter((t) => t !== type);
      return [...current, type];
    });
    setMailboxPage(1);
  }, []);

  const handleSelectFolder = useCallback((folder) => {
    setSelectedFolder(folder);
    setCurrentPage(1);
    setSelectedMessages([]);
    setSearchQuery('');
    setView('messages');
  }, []);

  const handleSelectMessage = useCallback(
    async (message) => {
      if (!selectedMailbox) return;
      const messageId = getProviderMessageId(message, selectedMailbox.type);
      if (!messageId) {
        toast.error('Invalid message ID');
        return;
      }
      setCurrentMessageId(messageId);
      setView('message');
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
          folder: selectedFolder?.name || 'INBOX',
        });
        toast.success('Marked as read');
      } catch (e) {
        toast.error('Failed to mark as read');
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
          folder: selectedFolder?.name || 'INBOX',
        });
        toast.success('Marked as unread');
      } catch (e) {
        toast.error('Failed to mark as unread');
      }
    },
    [selectedMailbox, provider, selectedFolder],
  );

  const handleToggleStar = useCallback(
    async (messageId, currentStarred) => {
      if (!selectedMailbox || !provider) return;
      try {
        if (selectedMailbox.type === 'gmail') {
          await provider.mutations.toggleStar.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId,
            starred: !currentStarred,
          });
        } else {
          await provider.mutations.toggleFlag.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId,
            flagStatus: !currentStarred ? 'flagged' : 'normal',
            flagged: !currentStarred, // for SMTP
            folder: selectedFolder?.name || 'INBOX',
          });
        }
        toast.success(!currentStarred ? 'Message starred' : 'Message unstarred');
      } catch (e) {
        toast.error('Failed to toggle star');
      }
    },
    [selectedMailbox, provider, selectedFolder],
  );

  const handleToggleImportant = useCallback(
    async (messageId, currentImportant) => {
      if (!selectedMailbox || !provider || selectedMailbox.type !== 'gmail') return;
      try {
        await gmail.mutations.toggleImportant.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageId,
          important: !currentImportant,
        });
        toast.success(!currentImportant ? 'Marked as important' : 'Removed importance');
      } catch (e) {
        toast.error('Failed to toggle importance');
      }
    },
    [selectedMailbox, provider, gmail.mutations],
  );

  const handleDeleteMessage = useCallback(
    async (messageId) => {
      if (!selectedMailbox || !provider) return;
      if (!window.confirm('Are you sure you want to delete this message?')) return;
      try {
        await provider.mutations.deleteMessage.mutateAsync({
          mailboxId: selectedMailbox.id,
          messageId,
          folder: selectedFolder?.name || 'INBOX',
        });
        toast.success('Message deleted');
        setView('messages');
        setCurrentMessageId(null);
      } catch (e) {
        toast.error('Failed to delete message');
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
        toast.success('Message moved');
      } catch (e) {
        toast.error('Failed to move message');
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
        toast.success('Message copied');
      } catch (e) {
        toast.error('Failed to copy message');
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
            messageId: getProviderMessageId(replyToMessage, selectedMailbox.type),
            ...data,
          });
        } else if (forwardMessage) {
          res = await mut.forward.mutateAsync({
            mailboxId: selectedMailbox.id,
            messageId: getProviderMessageId(forwardMessage, selectedMailbox.type),
            ...data,
          });
        } else {
          res = await mut.sendMessage.mutateAsync({
            mailboxId: selectedMailbox.id,
            ...data,
          });
        }
        toast.success('Message sent');
        setView('messages');
        setIsComposing(false);
        setReplyToMessage(null);
        setForwardMessage(null);
      } catch (e) {
        toast.error('Failed to send message');
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
        toast.success('Draft saved');
      } catch (e) {
        toast.error('Failed to save draft');
      }
    },
    [selectedMailbox, provider],
  );

  const handleCompose = useCallback(() => {
    setIsComposing(true);
    setReplyToMessage(null);
    setForwardMessage(null);
    setView('compose');
  }, []);

  const handleReply = useCallback((message) => {
    setReplyToMessage(message);
    setForwardMessage(null);
    setIsComposing(true);
    setView('compose');
  }, []);

  const handleForward = useCallback((message) => {
    setForwardMessage(message);
    setReplyToMessage(null);
    setIsComposing(true);
    setView('compose');
  }, []);

  const handleCloseCompose = useCallback(() => {
    setIsComposing(false);
    setReplyToMessage(null);
    setForwardMessage(null);
    setView('messages');
  }, []);

  const handleBackToMailboxes = useCallback(() => {
    setSelectedMailbox(null);
    setSelectedFolder(null);
    setView('list');
  }, []);

  const handleBackToMessages = useCallback(() => {
    setView('messages');
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
          folder: selectedFolder?.name || 'INBOX',
        });
        // Handle download if necessary (usually the hook handles it by creating a link)
      } catch (e) {
        toast.error('Failed to download attachment');
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
      toast.success('Mailbox synced');
    } catch (e) {
      toast.error('Failed to sync');
    }
  }, [selectedMailbox, provider, selectedFolder]);

  const handleMailboxSync = useCallback(
    async (mailboxId, type) => {
      try {
        let mut;
        if (type === 'gmail') mut = gmail.mutations.sync;
        else if (type === 'outlook') mut = outlook.mutations.sync;
        else if (type === 'smtp') mut = smtp.mutations.sync;

        if (!mut) return;

        await mut.mutateAsync({ mailboxId });
        toast.success('Mailbox sync started');
        refetchMailboxes();
      } catch (e) {
        toast.error('Failed to start sync');
      }
    },
    [gmail.mutations, outlook.mutations, smtp.mutations, refetchMailboxes],
  );

  const handleUpdateWarmup = useCallback(
    async (senderId, settings) => {
      try {
        await updateWarmupMutation.mutateAsync({ senderId, ...settings });
        toast.success(
          settings.enabled !== undefined
            ? settings.enabled
              ? 'Warmup enabled'
              : 'Warmup disabled'
            : 'Warmup settings updated',
        );
      } catch (e) {
        toast.error('Failed to update warmup settings');
      }
    },
    [updateWarmupMutation],
  );


  const handleRefreshToken = useCallback(async () => {
    if (!selectedMailbox || !provider || selectedMailbox.type === 'smtp') return;
    try {
      await provider.mutations.refreshToken.mutateAsync({
        mailboxId: selectedMailbox.id,
      });
      toast.success('Token refreshed');
    } catch (e) {
      toast.error('Failed to refresh token');
    }
  }, [selectedMailbox, provider]);

  const handleDisconnect = useCallback(async () => {
    if (!selectedMailbox || !provider) return;
    try {
      await provider.mutations.disconnect.mutateAsync({
        mailboxId: selectedMailbox.id,
      });
      toast.success('Mailbox disconnected');
      handleBackToMailboxes();
      refetchMailboxes();
    } catch (e) {
      toast.error('Failed to disconnect');
    }
  }, [selectedMailbox, provider]);

  const handlePageChange = useCallback(async (page) => {
    if (page < 1) return;
    
    // For Gmail/Outlook (Infinite Query), we may need to fetch multiple times 
    // to reach the desired page if we're jumping ahead.
    if (selectedMailbox?.type === 'gmail' || selectedMailbox?.type === 'outlook') {
      const q = provider?.queries;
      let activeQuery = null;

      if (debouncedSearchQuery && q?.search) {
        activeQuery = q.search;
      } else if (selectedMailbox.type === 'gmail') {
        activeQuery = !selectedFolder
          ? q.messages
          : isFolderType(selectedFolder, 'sent')
            ? q.sent
            : isFolderType(selectedFolder, 'trash')
              ? q.trash
              : isFolderType(selectedFolder, 'spam')
                ? q.spam
                : isFolderType(selectedFolder, 'starred')
                  ? q.starred
                  : isFolderType(selectedFolder, 'important')
                    ? q.important
                    : isFolderType(selectedFolder, 'drafts')
                      ? q.drafts
                      : q.messages;
      } else if (selectedMailbox.type === 'outlook') {
        activeQuery = !selectedFolder
          ? q.messages
          : isFolderType(selectedFolder, 'sent')
            ? q.sent
            : isFolderType(selectedFolder, 'trash')
              ? q.trash
              : isFolderType(selectedFolder, 'spam')
                ? q.spam
                : isFolderType(selectedFolder, 'archive')
                  ? q.archive
                  : isFolderType(selectedFolder, 'outbox')
                    ? q.outbox
                    : isFolderType(selectedFolder, 'drafts')
                      ? q.drafts
                      : isFolderType(selectedFolder, 'starred')
                        ? q.messages
                        : q.messages;
      }

      if (activeQuery && typeof activeQuery.fetchNextPage === 'function') {
        // Fetch as many pages as needed to satisfy the request
        let currentLoadedPages = activeQuery.data?.pages?.length || 0;
        
        // Safety: If we are jumping to a page that isn't loaded, fetch them
        while (currentLoadedPages < page && activeQuery.hasNextPage) {
          const result = await activeQuery.fetchNextPage();
          
          // CRITICAL: If the fetch returned no new messages, but we thought there were more (due to estimates),
          // adjust the total count to prevent navigating further into empty space.
          const lastPageMsgs = result.data?.pages?.[result.data.pages.length - 1]?.messages || [];
          if (lastPageMsgs.length === 0) {
            const actualTotal = (currentLoadedPages) * PAGE_SIZE;
            setTotalMessages(actualTotal);
            // Break loop as there's no more data
            break;
          }
          
          currentLoadedPages++;
        }
      }
    }

    setCurrentPage(page);
  }, [selectedMailbox, provider, debouncedSearchQuery, selectedFolder]);

  const handleNextPage = useCallback(() => {
    if (!hasNextPage) return;
    handlePageChange(currentPage + 1);
  }, [hasNextPage, currentPage, handlePageChange]);

  const handlePreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      handlePageChange(currentPage - 1);
    }
  }, [hasPreviousPage, currentPage, handlePageChange]);

  const handleBulkDelete = useCallback(async () => {
    if (!selectedMailbox || !provider || selectedMessages.length === 0) return;
    try {
      await provider.mutations.batchOperations.mutateAsync({
        mailboxId: selectedMailbox.id,
        messageIds: selectedMessages,
        operation: 'delete',
        folder: selectedFolder?.name,
      });
      toast.success('Messages deleted');
      setSelectedMessages([]);
    } catch (e) {
      toast.error('Failed to delete messages');
    }
  }, [selectedMailbox, provider, selectedMessages, selectedFolder]);

  const handleBulkDeleteSenders = useCallback(async () => {
    if (selectedSenderIds.length === 0) return;
    try {
      await bulkDeleteSenders.mutateAsync(selectedSenderIds);
      toast.success('Mailboxes deleted');
      setSelectedSenderIds([]);
    } catch (e) {
      toast.error('Failed to delete mailboxes');
    }
  }, [selectedSenderIds, bulkDeleteSenders]);

  const handleCheckSender = useCallback((senderId, type, checked) => {
    setSelectedSenderIds((prev) =>
      checked ? [...prev, { id: senderId, type }] : prev.filter((item) => item.id !== senderId),
    );
  }, []);

  const handleCheckAllSenders = useCallback(
    (checked) => {
      if (checked) {
        setSelectedSenderIds(mailboxes.map((m) => ({ id: m.id, type: m.type })));
      } else {
        setSelectedSenderIds([]);
      }
    },
    [mailboxes],
  );

  const handleBulkMarkRead = useCallback(async () => {
    if (!selectedMailbox || !provider || selectedMessages.length === 0) return;
    try {
      await provider.mutations.batchOperations.mutateAsync({
        mailboxId: selectedMailbox.id,
        messageIds: selectedMessages,
        operation: 'markAsRead',
        folder: selectedFolder?.name,
      });
      toast.success('Messages marked as read');
      setSelectedMessages([]);
    } catch (e) {
      toast.error('Failed to mark as read');
    }
  }, [selectedMailbox, provider, selectedMessages, selectedFolder]);

  const handleBulkMarkUnread = useCallback(async () => {
    if (!selectedMailbox || !provider || selectedMessages.length === 0) return;
    try {
      await provider.mutations.batchOperations.mutateAsync({
        mailboxId: selectedMailbox.id,
        messageIds: selectedMessages,
        operation: 'markAsUnread',
        folder: selectedFolder?.name,
      });
      toast.success('Messages marked as unread');
      setSelectedMessages([]);
    } catch (e) {
      toast.error('Failed to mark as unread');
    }
  }, [selectedMailbox, provider, selectedMessages, selectedFolder]);

  const handleCheckMessage = useCallback((messageId, checked) => {
    setSelectedMessages((prev) =>
      checked ? [...prev, messageId] : prev.filter((id) => id !== messageId),
    );
  }, []);

  const handleResetQueries = useCallback(() => {
    queryClient.resetQueries({ queryKey: ['mailboxes'] });
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
      selectedSenderIds,
      viewMode,
      showStats,
      currentMessageId,
      filterUnread,
      filterStarred,
      filterAttachments,
      searchQuery,
      dateRange,
      mailboxPage,
      mailboxSearch,
      mailboxTypeFilter,

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
      mailboxMeta,
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

        const inboxFolder = f.find((item) => isFolderType(item, 'inbox'));
        if (selectedMailbox.type === 'gmail') {
          return inboxFolder?.messagesUnread || 0;
        }
        if (selectedMailbox.type === 'outlook') {
          return inboxFolder?.unreadItemCount || 0;
        }
        if (selectedMailbox.type === 'smtp') {
          // SMTP folders are structured differently in the API response sometimes
          const smtpFolders = f.folders || f;
          const smtpInbox = Array.isArray(smtpFolders)
            ? smtpFolders.find((item) => isFolderType(item, 'inbox'))
            : null;
          return smtpInbox?.unreadCount || 0;
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
        if (searchQuery) return q.search?.isLoading || q.search?.isFetchingNextPage;

        const activeQuery = !selectedFolder
          ? q.messages
          : isFolderType(selectedFolder, 'sent')
            ? q.sent
            : isFolderType(selectedFolder, 'trash')
              ? q.trash
              : isFolderType(selectedFolder, 'spam')
                ? q.spam
                : isFolderType(selectedFolder, 'starred')
                  ? q.starred
                  : isFolderType(selectedFolder, 'important')
                    ? q.important
                    : isFolderType(selectedFolder, 'drafts')
                      ? q.drafts
                      : isFolderType(selectedFolder, 'archive')
                        ? q.archive
                        : isFolderType(selectedFolder, 'outbox')
                          ? q.outbox
                          : q.messages;

        return activeQuery?.isLoading || activeQuery?.isFetching || activeQuery?.isFetchingNextPage;
      })(),
      isMessageLoading: provider?.queries.message?.isLoading,
      isSyncing: provider?.mutations.sync.isLoading,
      isSending:
        provider?.mutations.sendMessage.isPending ||
        provider?.mutations.reply.isPending ||
        provider?.mutations.forward.isPending,
    },
    error: provider?.queries.messages.error || provider?.queries.search?.error,
    setters: {
      setSelectedMailbox,
      setView,
      setSelectedFolder,
      setShowAllFolders,
      setSelectedMessages,
      setSelectedSenderIds,
      setViewMode,
      setShowStats,
      setCurrentMessageId,
      setFilterUnread,
      setFilterStarred,
      setFilterAttachments,
      setSearchQuery,
      setDateRange,
      setCurrentPage,
      setMailboxPage,
      setMailboxSearch,
      setMailboxTypeFilter,
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
      handlePageChange,
      handleBulkDelete,
      handleBulkMarkRead,
      handleBulkMarkUnread,
      handleBulkDeleteSenders,
      handleCheckSender,
      handleCheckAllSenders,
      handleCheckMessage,
      handleResetQueries,
      refetchMailboxes,
      handleMailboxPageChange,
      handleMailboxSearchChange,

      handleMailboxTypeChange,
      handleMailboxSync,
      handleUpdateWarmup,
    },
    utils: {
      formatMessageDate: (msg) => formatMessageDate(msg, userTz),
      getSenderInfo,
      getSubject,
      getPreview,
      getInitials,
      getProviderIcon,
      timeAgo,
    },
  };
};
