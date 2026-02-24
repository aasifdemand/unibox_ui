// mailboxes/hooks.js
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

// ============================================================================
// PAGINATION HOOK
// ============================================================================
export const usePagination = () => {
  const [gmailPageTokens, setGmailPageTokens] = useState({});
  const [gmailPrevTokens, setGmailPrevTokens] = useState({});
  const [outlookSkipTokens, setOutlookSkipTokens] = useState({});
  const [outlookPrevTokens, setOutlookPrevTokens] = useState({});
  const [smtpPages, setSmtpPages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const reset = () => {
    setGmailPageTokens({});
    setGmailPrevTokens({});
    setOutlookSkipTokens({});
    setOutlookPrevTokens({});
    setSmtpPages({});
    setHasNextPage(false);
    setHasPreviousPage(false);
    setTotalMessages(0);
    setCurrentPage(1);
  };

  return {
    gmailPageTokens,
    setGmailPageTokens,
    gmailPrevTokens,
    setGmailPrevTokens,
    outlookSkipTokens,
    setOutlookSkipTokens,
    outlookPrevTokens,
    setOutlookPrevTokens,
    smtpPages,
    setSmtpPages,
    currentPage,
    setCurrentPage,
    totalMessages,
    setTotalMessages,
    hasNextPage,
    setHasNextPage,
    hasPreviousPage,
    setHasPreviousPage,
    reset,
  };
};

// ============================================================================
// MESSAGE FILTERS HOOK
// ============================================================================
export const useMessageFilters = ({
  messages,
  filterUnread,
  filterStarred,
  filterAttachments,
  searchQuery,
  dateRange,
}) => {
  const parseMessageDate = (message) => {
    try {
      if (message?.internalDate) return new Date(parseInt(message.internalDate, 10));
      if (message?.receivedDateTime) return new Date(message.receivedDateTime);
      if (message?.date) return new Date(message.date);
      return null;
    } catch {
      return null;
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getSenderInfo = (message) => {
    try {
      if (message?.payload?.headers) {
        const from = message.payload.headers.find((h) => h.name === 'From')?.value || '';
        const match = from.match(/<([^>]+)>/);
        const email = match ? match[1] : from;
        const nameMatch = from.match(/^([^<]+)/);
        const name = nameMatch ? nameMatch[1].trim().replace(/"/g, '') : email.split('@')[0];
        return { name: name || email.split('@')[0] || 'Unknown' };
      }
      if (message?.from?.emailAddress) {
        return {
          name: message.from.emailAddress.name || message.from.emailAddress.address.split('@')[0],
        };
      }
      if (message?.from?.email) {
        return { name: message.from.name || message.from.email.split('@')[0] };
      }
    } catch (e) {
      console.error('Error parsing sender:', e);
    }
    return { name: 'Unknown' };
  };

  const getSubject = (message) => {
    try {
      if (message?.subject) return message.subject;
      if (message?.payload?.headers) {
        return message.payload.headers.find((h) => h.name === 'Subject')?.value || '(no subject)';
      }
    } catch (e) {
      console.error('Error getting subject:', e);
    }
    return '(no subject)';
  };

  const getPreview = (message) => {
    try {
      if (message?.bodyPreview) return message.bodyPreview;
      if (message?.snippet) return message.snippet;
      if (message?.text) return message.text.substring(0, 100) + '...';
    } catch (e) {
      console.error('Error getting preview:', e);
    }
    return '';
  };

  const apply = () => {
    let filtered = messages;

    if (filterUnread) {
      filtered = filtered.filter((m) => !m.isRead && m.unread !== false);
    }

    if (filterStarred) {
      filtered = filtered.filter((m) => m.isStarred || m.labelIds?.includes('STARRED'));
    }

    if (filterAttachments) {
      filtered = filtered.filter((m) => m.hasAttachments || m.attachmentCount > 0);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => {
        const subject = getSubject(m).toLowerCase();
        const sender = getSenderInfo(m).name.toLowerCase();
        const preview = getPreview(m).toLowerCase();
        return subject.includes(query) || sender.includes(query) || preview.includes(query);
      });
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      filtered = filtered.filter((m) => {
        const date = parseMessageDate(m);
        if (!date) return false;

        if (dateRange === 'today') return isToday(date);
        if (dateRange === 'week') return date >= weekAgo;
        if (dateRange === 'month') return date >= monthAgo;

        return true;
      });
    }

    return filtered;
  };

  return { apply };
};

// ============================================================================
// MESSAGE ACTIONS HOOK
// ============================================================================
export const useMessageActions = (store, selectedMailbox) => {
  const fetchMessage = async (messageId, folderName) => {
    if (!selectedMailbox) return null;

    if (selectedMailbox.type === 'gmail') {
      return await store.getGmailMessage(selectedMailbox.id, messageId);
    } else if (selectedMailbox.type === 'outlook') {
      return await store.getOutlookMessage(selectedMailbox.id, messageId);
    } else if (selectedMailbox.type === 'smtp') {
      return await store.getSmtpMessage(selectedMailbox.id, messageId, folderName || 'INBOX');
    }
  };

  const markAsRead = async (messageId, folderName) => {
    if (!selectedMailbox) return false;

    if (selectedMailbox.type === 'gmail') {
      return (await store.markGmailAsRead(selectedMailbox.id, messageId))?.success;
    } else if (selectedMailbox.type === 'outlook') {
      return (await store.markOutlookAsRead(selectedMailbox.id, messageId))?.success;
    } else if (selectedMailbox.type === 'smtp') {
      return (await store.markSmtpAsRead(selectedMailbox.id, messageId, folderName || 'INBOX'))
        ?.success;
    }
    return false;
  };

  const markAsUnread = async (messageId, folderName) => {
    if (!selectedMailbox || selectedMailbox.type !== 'smtp') return false;
    return (await store.markSmtpAsUnread(selectedMailbox.id, messageId, folderName || 'INBOX'))
      ?.success;
  };

  const deleteMessage = async (messageId, folderName) => {
    if (!selectedMailbox) return false;

    if (selectedMailbox.type === 'gmail') {
      return (await store.deleteGmailMessage(selectedMailbox.id, messageId))?.success;
    } else if (selectedMailbox.type === 'outlook') {
      return (await store.deleteOutlookMessage(selectedMailbox.id, messageId))?.success;
    } else if (selectedMailbox.type === 'smtp') {
      return (await store.deleteSmtpMessage(selectedMailbox.id, messageId, folderName || 'INBOX'))
        ?.success;
    }
    return false;
  };

  return { fetchMessage, markAsRead, markAsUnread, deleteMessage };
};

// ============================================================================
// MAILBOX ACTIONS HOOK
// ============================================================================
export const useMailboxActions = (store, deleteSender) => {
  const handleSync = async (selectedMailbox, selectedFolder, currentPage, fetchMessages) => {
    if (!selectedMailbox) return;

    let success = false;
    const folderId =
      selectedFolder?.id ||
      (selectedFolder?.name?.toLowerCase().includes('sent')
        ? 'SENT'
        : selectedFolder?.name?.toLowerCase().includes('trash')
          ? 'TRASH'
          : selectedFolder?.name?.toLowerCase().includes('spam')
            ? 'SPAM'
            : 'INBOX');

    try {
      if (selectedMailbox.type === 'gmail') {
        success = (await store.syncGmailMailbox(selectedMailbox.id, folderId)).success;
      } else if (selectedMailbox.type === 'outlook') {
        const folderMap = {
          sent: 'sentitems',
          trash: 'deleteditems',
          spam: 'junkemail',
          archive: 'archive',
          outbox: 'outbox',
          inbox: 'inbox',
        };
        const outlookFolderId = folderMap[selectedFolder?.name?.toLowerCase()] || folderId;
        success = (await store.syncOutlookMailbox(selectedMailbox.id, outlookFolderId)).success;
      } else if (selectedMailbox.type === 'smtp') {
        success = (await store.syncSmtpMailbox(selectedMailbox.id, selectedFolder?.name || 'INBOX'))
          .success;
      }

      if (success) {
        toast.success(`${selectedMailbox.type} mailbox synced`);
        await fetchMessages(selectedFolder, currentPage, 'next');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync mailbox');
    }
  };

  const handleRefreshToken = async (selectedMailbox) => {
    if (!selectedMailbox) return;
    if (selectedMailbox.type === 'smtp') {
      toast.error('Token refresh not supported for SMTP');
      return;
    }

    const result =
      selectedMailbox.type === 'gmail'
        ? await store.refreshGmailToken(selectedMailbox.id)
        : await store.refreshOutlookToken(selectedMailbox.id);

    if (result?.success) toast.success('Token refreshed successfully');
  };

  const handleDisconnect = async (mailbox, setSelectedMailbox, setView, clearCurrentMailbox) => {
    if (!window.confirm(`Disconnect ${mailbox.email}?`)) return;

    let result;
    if (mailbox.type === 'gmail') result = await store.disconnectGmailMailbox(mailbox.id);
    else if (mailbox.type === 'outlook') result = await store.disconnectOutlookMailbox(mailbox.id);
    else result = await store.disconnectSmtpMailbox(mailbox.id);

    if (result?.success) {
      toast.success('Mailbox disconnected');
      await deleteSender(mailbox.id, mailbox.type);

      if (setSelectedMailbox && setView) {
        setSelectedMailbox(null);
        setView('list');
        clearCurrentMailbox();
      }
    }
  };

  return { handleSync, handleRefreshToken, handleDisconnect };
};

// ============================================================================
// TOKEN WARNING HOOK
// ============================================================================
export const useTokenWarning = (selectedMailbox, onRefresh) => {
  useEffect(() => {
    if (!selectedMailbox?.expiresAt || selectedMailbox.type === 'smtp') return;

    const expiryDate = new Date(selectedMailbox.expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
      toast(
        (t) => (
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
            <div>
              <p className="font-medium">Token expiring soon</p>
              <p className="text-sm text-gray-600">
                Your {selectedMailbox.type} token expires in {daysUntilExpiry} days
              </p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  onRefresh();
                }}
                className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                Refresh now
              </button>
            </div>
          </div>
        ),
        { duration: 10000 },
      );
    }
  }, [selectedMailbox, onRefresh]);
};
