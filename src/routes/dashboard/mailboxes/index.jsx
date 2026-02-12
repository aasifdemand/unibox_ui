/* eslint-disable react-hooks/preserve-manual-memoization */
import React, { useState, useEffect, useCallback } from "react";
import { useMailboxStore } from "../../../store/mailbox.store";
import { useSenderStore } from "../../../store/sender.store";
import { Link } from "react-router-dom";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import toast from "react-hot-toast";
import {
  Inbox,
  Send,
  Mail,
  Clock,
  RefreshCw,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  InboxIcon,
  Archive,
  Search,
  Folder,
  Star,
  Send as SendIcon,
  AlertTriangle,
  Reply,
  MailQuestion,
  MailCheck,
  Plus,
  File,
  XCircle,
} from "lucide-react";

const Mailboxes = () => {
  // =========================
  // STATE
  // =========================
  const [selectedMailbox, setSelectedMailbox] = useState(null);
  const [view, setView] = useState("list");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showAllFolders, setShowAllFolders] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Gmail pagination state
  const [gmailPageTokens, setGmailPageTokens] = useState({});
  const [gmailPrevTokens, setGmailPrevTokens] = useState({});

  // Outlook pagination state
  const [outlookSkipTokens, setOutlookSkipTokens] = useState({});
  const [outlookPrevTokens, setOutlookPrevTokens] = useState({});

  const [folderLoading, setFolderLoading] = useState({});
  const [totalMessages, setTotalMessages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // =========================
  // STORE
  // =========================
  const {
    mailboxes = [],
    messages = [],
    currentMessage,
    folders = [],
    isLoading,
    isLoadingMessages,
    isSyncing,
    error,

    fetchMailboxes,
    // Gmail
    getGmailMessages,
    getGmailSentMessages,
    getGmailTrashMessages,
    getGmailSpamMessages,
    getGmailStarredMessages,
    getGmailImportantMessages,
    getGmailMessage,
    getGmailLabels,
    markGmailAsRead,
    deleteGmailMessage,
    syncGmailMailbox,
    refreshGmailToken,
    disconnectGmailMailbox,
    // Outlook
    getOutlookMessages,
    getOutlookSentMessages,
    getOutlookTrashMessages,
    getOutlookSpamMessages,
    getOutlookArchiveMessages,
    getOutlookOutboxMessages,
    getOutlookMessage,
    getOutlookFolders,
    markOutlookAsRead,
    deleteOutlookMessage,
    syncOutlookMailbox,
    refreshOutlookToken,
    disconnectOutlookMailbox,
    // SMTP
    disconnectSmtpMailbox,
    // Utils
    clearCurrentMailbox,
    clearError,
    clearMessages,
  } = useMailboxStore();

  const { deleteSender } = useSenderStore();

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    fetchMailboxes();
  }, [fetchMailboxes]);

  // Reset pagination when mailbox or folder changes
  useEffect(() => {
    if (selectedMailbox) {
      setGmailPageTokens({});
      setGmailPrevTokens({});
      setOutlookSkipTokens({});
      setOutlookPrevTokens({});
      setHasNextPage(false);
      setHasPreviousPage(false);
      setTotalMessages(0);
    }
  }, [selectedMailbox, selectedFolder]);

  // =========================
  // DATE UTILITIES WITH DATE-FNS
  // =========================
  const parseMessageDate = useCallback((message) => {
    try {
      // Gmail format (timestamp in milliseconds as string)
      if (message?.internalDate) {
        return new Date(parseInt(message.internalDate, 10));
      }
      // Outlook format
      if (message?.receivedDateTime) {
        return new Date(message.receivedDateTime);
      }
      // Fallback
      if (message?.date) {
        return new Date(message.date);
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const formatMessageDate = useCallback(
    (message) => {
      const date = parseMessageDate(message);
      if (!date) return "";

      try {
        if (isToday(date)) {
          return format(date, "h:mm a");
        }
        if (isYesterday(date)) {
          return "Yesterday";
        }
        if (isThisWeek(date)) {
          return format(date, "EEEE"); // Monday, Tuesday, etc.
        }
        return format(date, "MMM d"); // Jan 1, etc.
      } catch {
        return "";
      }
    },
    [parseMessageDate],
  );

  const formatFullDate = useCallback(
    (message) => {
      const date = parseMessageDate(message);
      if (!date) return "";
      try {
        return format(date, "MMM d, yyyy h:mm a");
      } catch {
        return "";
      }
    },
    [parseMessageDate],
  );

  // =========================
  // UTILITIES
  // =========================
  const getInitials = useCallback(
    (name) => name?.charAt(0)?.toUpperCase() || "?",
    [],
  );

  const getSenderInfo = useCallback((message) => {
    let email = "",
      name = "";
    try {
      if (message?.payload?.headers) {
        const from =
          message.payload.headers.find((h) => h.name === "From")?.value || "";
        const match = from.match(/<([^>]+)>/);
        email = match ? match[1] : from;
        const nameMatch = from.match(/^([^<]+)/);
        name = nameMatch
          ? nameMatch[1].trim().replace(/"/g, "")
          : email.split("@")[0];
      } else if (message?.from?.emailAddress) {
        email = message.from.emailAddress.address || "";
        name = message.from.emailAddress.name || email.split("@")[0];
      } else if (message?.from?.email) {
        email = message.from.email;
        name = message.from.name || email.split("@")[0];
      } else if (typeof message?.from === "string") {
        email = message.from;
        name = email.split("@")[0];
      }
    } catch (e) {
      console.error("Error parsing sender:", e);
    }
    return { email, name: name || email.split("@")[0] || "Unknown" };
  }, []);

  const getSubject = useCallback((message) => {
    try {
      if (message?.subject) return message.subject;
      if (message?.payload?.headers) {
        const subject = message.payload.headers.find(
          (h) => h.name === "Subject",
        )?.value;
        return subject || "(no subject)";
      }
    } catch (e) {
      console.error("Error getting subject:", e);
    }
    return "(no subject)";
  }, []);

  const getPreview = useCallback((message) => {
    try {
      // Outlook format - direct bodyPreview
      if (message?.bodyPreview) {
        return message.bodyPreview;
      }

      // Gmail format - snippet is the preview
      if (message?.snippet) {
        return message.snippet;
      }

      return "";
    } catch (e) {
      console.error("Error getting preview:", e);
      return "";
    }
  }, []);

  const getProviderIcon = useCallback((type) => {
    switch (type) {
      case "gmail":
        return <Mail className="w-5 h-5 text-red-500" />;
      case "outlook":
        return <Inbox className="w-5 h-5 text-blue-500" />;
      case "smtp":
        return <Send className="w-5 h-5 text-green-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-500" />;
    }
  }, []);

  const getFolderIcon = useCallback((name) => {
    const n = name?.toLowerCase() || "";
    if (n.includes("inbox")) return <InboxIcon className="w-4 h-4" />;
    if (n.includes("sent")) return <SendIcon className="w-4 h-4" />;
    if (n.includes("draft")) return <File className="w-4 h-4" />;
    if (n.includes("spam") || n.includes("junk"))
      return <AlertTriangle className="w-4 h-4" />;
    if (n.includes("trash") || n.includes("bin") || n.includes("deleted"))
      return <Trash2 className="w-4 h-4" />;
    if (n.includes("archive")) return <Archive className="w-4 h-4" />;
    if (n.includes("star") || n.includes("important"))
      return <Star className="w-4 h-4" />;
    return <Folder className="w-4 h-4" />;
  }, []);

  const getFolderUnreadCount = useCallback(() => {
    if (!Array.isArray(folders)) return 0;
    const inbox = folders?.find((f) => f.name?.toLowerCase() === "inbox");
    return inbox?.unreadCount || 0;
  }, [folders]);

  const sortFolders = useCallback((folders) => {
    if (!Array.isArray(folders)) return [];
    return [...folders].sort((a, b) => {
      const aName = a.name?.toLowerCase() || "";
      const bName = b.name?.toLowerCase() || "";
      if (aName === "inbox") return -1;
      if (bName === "inbox") return 1;
      if (aName === "sent") return -1;
      if (bName === "sent") return 1;
      if (aName === "drafts") return -1;
      if (bName === "drafts") return 1;
      if (aName === "archive") return -1;
      if (bName === "archive") return 1;
      return aName.localeCompare(bName);
    });
  }, []);

  // =========================
  // FETCH MESSAGES BY FOLDER WITH PAGINATION
  // =========================
  const fetchMessages = useCallback(
    async (folder, page = 1, direction = "next") => {
      if (!selectedMailbox) return;

      setCurrentPage(page);

      try {
        if (page === 1) {
          clearMessages();
        }

        const pageSize = 20;

        if (selectedMailbox.type === "gmail") {
          // Gmail pagination uses pageToken
          let pageToken = null;

          if (direction === "next") {
            pageToken = gmailPageTokens[page - 1];
          } else if (direction === "prev") {
            pageToken = gmailPrevTokens[page];
          }

          if (!folder) {
            // Inbox
            const result = await getGmailMessages(
              selectedMailbox.id,
              pageToken,
              pageSize,
              filterUnread ? ["INBOX", "UNREAD"] : ["INBOX"],
            );

            if (result.success) {
              // Store the next page token for this page
              if (result.data?.nextPageToken) {
                setGmailPageTokens((prev) => ({
                  ...prev,
                  [page]: result.data.nextPageToken,
                }));

                // Store current token as previous for next page
                if (pageToken) {
                  setGmailPrevTokens((prev) => ({
                    ...prev,
                    [page + 1]: pageToken,
                  }));
                }

                setHasNextPage(true);
              } else {
                setHasNextPage(false);
              }

              setHasPreviousPage(page > 1);
              setTotalMessages(result.data?.resultSizeEstimate || 0);
            }
          } else {
            const folderName = folder.name?.toLowerCase() || "";
            const folderId = folder.id || "";
            let result;

            if (folderName.includes("sent")) {
              result = await getGmailSentMessages(
                selectedMailbox.id,
                pageToken,
                pageSize,
              );
            } else if (
              folderName.includes("trash") ||
              folderName.includes("bin")
            ) {
              result = await getGmailTrashMessages(
                selectedMailbox.id,
                pageToken,
                pageSize,
              );
            } else if (
              folderName.includes("spam") ||
              folderName.includes("junk")
            ) {
              result = await getGmailSpamMessages(
                selectedMailbox.id,
                pageToken,
                pageSize,
              );
            } else if (folderName.includes("star")) {
              result = await getGmailStarredMessages(
                selectedMailbox.id,
                pageToken,
                pageSize,
              );
            } else if (folderName.includes("important")) {
              result = await getGmailImportantMessages(
                selectedMailbox.id,
                pageToken,
                pageSize,
              );
            } else {
              // Custom label
              result = await getGmailMessages(
                selectedMailbox.id,
                pageToken,
                pageSize,
                [folderId],
              );
            }

            if (result.success) {
              if (result.data?.nextPageToken) {
                setGmailPageTokens((prev) => ({
                  ...prev,
                  [page]: result.data.nextPageToken,
                }));

                if (pageToken) {
                  setGmailPrevTokens((prev) => ({
                    ...prev,
                    [page + 1]: pageToken,
                  }));
                }

                setHasNextPage(true);
              } else {
                setHasNextPage(false);
              }

              setHasPreviousPage(page > 1);
              setTotalMessages(result.data?.resultSizeEstimate || 0);
            }
          }
        } else if (selectedMailbox.type === "outlook") {
          // Outlook pagination uses skipToken
          let skipToken = null;

          if (direction === "next") {
            skipToken = outlookSkipTokens[page - 1];
          } else if (direction === "prev") {
            skipToken = outlookPrevTokens[page];
          }

          if (!folder) {
            // Inbox
            const result = await getOutlookMessages(
              selectedMailbox.id,
              skipToken,
              pageSize,
              "inbox",
            );

            if (result.success) {
              if (result.data?.nextSkipToken) {
                setOutlookSkipTokens((prev) => ({
                  ...prev,
                  [page]: result.data.nextSkipToken,
                }));

                if (skipToken) {
                  setOutlookPrevTokens((prev) => ({
                    ...prev,
                    [page + 1]: skipToken,
                  }));
                }

                setHasNextPage(true);
              } else {
                setHasNextPage(false);
              }

              setHasPreviousPage(page > 1);
              setTotalMessages(result.data?.count || 0);
            }
          } else {
            const folderName = folder.name?.toLowerCase() || "";
            const folderId = folder.id || "";
            let result;

            if (folderName.includes("sent")) {
              result = await getOutlookSentMessages(
                selectedMailbox.id,
                skipToken,
                pageSize,
              );
            } else if (
              folderName.includes("trash") ||
              folderName.includes("deleted")
            ) {
              result = await getOutlookTrashMessages(
                selectedMailbox.id,
                skipToken,
                pageSize,
              );
            } else if (
              folderName.includes("spam") ||
              folderName.includes("junk")
            ) {
              result = await getOutlookSpamMessages(
                selectedMailbox.id,
                skipToken,
                pageSize,
              );
            } else if (folderName.includes("archive")) {
              result = await getOutlookArchiveMessages(
                selectedMailbox.id,
                skipToken,
                pageSize,
              );
            } else if (folderName.includes("outbox")) {
              result = await getOutlookOutboxMessages(
                selectedMailbox.id,
                skipToken,
                pageSize,
              );
            } else {
              // Custom folder
              result = await getOutlookMessages(
                selectedMailbox.id,
                skipToken,
                pageSize,
                folderId,
              );
            }

            if (result.success) {
              if (result.data?.nextSkipToken) {
                setOutlookSkipTokens((prev) => ({
                  ...prev,
                  [page]: result.data.nextSkipToken,
                }));

                if (skipToken) {
                  setOutlookPrevTokens((prev) => ({
                    ...prev,
                    [page + 1]: skipToken,
                  }));
                }

                setHasNextPage(true);
              } else {
                setHasNextPage(false);
              }

              setHasPreviousPage(page > 1);
              setTotalMessages(result.data?.count || 0);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      }
    },
    [
      selectedMailbox,
      filterUnread,
      gmailPageTokens,
      gmailPrevTokens,
      outlookSkipTokens,
      outlookPrevTokens,
      clearMessages,
      getGmailMessages,
      getGmailSentMessages,
      getGmailTrashMessages,
      getGmailSpamMessages,
      getGmailStarredMessages,
      getGmailImportantMessages,
      getOutlookMessages,
      getOutlookSentMessages,
      getOutlookTrashMessages,
      getOutlookSpamMessages,
      getOutlookArchiveMessages,
      getOutlookOutboxMessages,
    ],
  );

  // =========================
  // PAGINATION HANDLERS
  // =========================
  const handleNextPage = useCallback(async () => {
    if (!hasNextPage) return;
    await fetchMessages(selectedFolder, currentPage + 1, "next");
  }, [fetchMessages, selectedFolder, currentPage, hasNextPage]);

  const handlePreviousPage = useCallback(async () => {
    if (!hasPreviousPage) return;
    await fetchMessages(selectedFolder, currentPage - 1, "prev");
  }, [fetchMessages, selectedFolder, currentPage, hasPreviousPage]);

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
      setCurrentPage(1);
      setGmailPageTokens({});
      setGmailPrevTokens({});
      setOutlookSkipTokens({});
      setOutlookPrevTokens({});

      try {
        if (mailbox.type === "gmail") {
          await getGmailLabels(mailbox.id);
        } else if (mailbox.type === "outlook") {
          await getOutlookFolders(mailbox.id);
        }

        await fetchMessages(null, 1, "next");
      } catch (error) {
        console.error("Error selecting mailbox:", error);
        toast.error("Failed to load mailbox");
      }
    },
    [getGmailLabels, getOutlookFolders, fetchMessages],
  );

  const handleSelectFolder = useCallback(
    async (folder) => {
      const folderKey = folder?.id || "inbox";
      setFolderLoading((prev) => ({ ...prev, [folderKey]: true }));
      setSelectedFolder(folder);
      setCurrentPage(1);
      setSelectedMessages([]);
      setFilterUnread(false);
      setGmailPageTokens({});
      setGmailPrevTokens({});
      setOutlookSkipTokens({});
      setOutlookPrevTokens({});

      await fetchMessages(folder, 1, "next");

      setFolderLoading((prev) => ({ ...prev, [folderKey]: false }));
    },
    [fetchMessages],
  );

  const handleSyncMailbox = useCallback(async () => {
    if (!selectedMailbox) return;

    let success = false;
    const folderId =
      selectedFolder?.id ||
      (selectedFolder?.name?.toLowerCase().includes("sent")
        ? "SENT"
        : selectedFolder?.name?.toLowerCase().includes("trash")
          ? "TRASH"
          : selectedFolder?.name?.toLowerCase().includes("spam")
            ? "SPAM"
            : "INBOX");

    if (selectedMailbox.type === "gmail") {
      const result = await syncGmailMailbox(selectedMailbox.id, folderId);
      success = result.success;
    } else if (selectedMailbox.type === "outlook") {
      const folderMap = {
        sent: "sentitems",
        trash: "deleteditems",
        spam: "junkemail",
        archive: "archive",
        outbox: "outbox",
        inbox: "inbox",
      };
      const outlookFolderId =
        folderMap[selectedFolder?.name?.toLowerCase()] || folderId;
      const result = await syncOutlookMailbox(
        selectedMailbox.id,
        outlookFolderId,
      );
      success = result.success;
    } else {
      toast.error("Sync not supported for this mailbox type");
      return;
    }

    if (success) {
      toast.success(`${selectedMailbox.type} mailbox synced`);
      await fetchMessages(selectedFolder, currentPage, "next");
    }
  }, [
    selectedMailbox,
    selectedFolder,
    currentPage,
    fetchMessages,
    syncGmailMailbox,
    syncOutlookMailbox,
  ]);

  const handleRefreshToken = useCallback(async () => {
    if (!selectedMailbox) return;
    if (selectedMailbox.type === "smtp") {
      toast.error("Token refresh not supported for SMTP");
      return;
    }

    let result;
    if (selectedMailbox.type === "gmail") {
      result = await refreshGmailToken(selectedMailbox.id);
    } else {
      result = await refreshOutlookToken(selectedMailbox.id);
    }

    if (result?.success) {
      toast.success("Token refreshed successfully");
    }
  }, [selectedMailbox, refreshGmailToken, refreshOutlookToken]);

  const handleDisconnectMailbox = useCallback(
    async (mailbox) => {
      if (!window.confirm(`Disconnect ${mailbox.email}?`)) return;

      let result;
      if (mailbox.type === "gmail") {
        result = await disconnectGmailMailbox(mailbox.id);
      } else if (mailbox.type === "outlook") {
        result = await disconnectOutlookMailbox(mailbox.id);
      } else {
        result = await disconnectSmtpMailbox(mailbox.id);
      }

      if (result?.success) {
        toast.success("Mailbox disconnected");
        await deleteSender(mailbox.id, mailbox.type);

        if (selectedMailbox?.id === mailbox.id) {
          setSelectedMailbox(null);
          setView("list");
          clearCurrentMailbox();
        }
      }
    },
    [
      selectedMailbox,
      deleteSender,
      clearCurrentMailbox,
      disconnectGmailMailbox,
      disconnectOutlookMailbox,
      disconnectSmtpMailbox,
    ],
  );

  const handleSelectMessage = useCallback(
    async (message) => {
      if (!selectedMailbox) return;

      const messageId = message.id || message.messageId;
      setView("message");

      let result;
      if (selectedMailbox.type === "gmail") {
        result = await getGmailMessage(selectedMailbox.id, messageId);
      } else {
        result = await getOutlookMessage(selectedMailbox.id, messageId);
      }

      if (result?.success && !message.isRead) {
        if (selectedMailbox.type === "gmail") {
          await markGmailAsRead(selectedMailbox.id, messageId);
        } else {
          await markOutlookAsRead(selectedMailbox.id, messageId);
        }
      }
    },
    [
      selectedMailbox,
      getGmailMessage,
      getOutlookMessage,
      markGmailAsRead,
      markOutlookAsRead,
    ],
  );

  const handleDeleteMessage = useCallback(
    async (messageId) => {
      if (!selectedMailbox || !window.confirm("Delete this message?")) return;

      let result;
      if (selectedMailbox.type === "gmail") {
        result = await deleteGmailMessage(selectedMailbox.id, messageId);
      } else {
        result = await deleteOutlookMessage(selectedMailbox.id, messageId);
      }

      if (result?.success) {
        toast.success("Message deleted");
        setView("messages");
        await fetchMessages(selectedFolder, currentPage, "next");
      }
    },
    [
      selectedMailbox,
      selectedFolder,
      currentPage,
      fetchMessages,
      deleteGmailMessage,
      deleteOutlookMessage,
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
      let result;
      if (selectedMailbox.type === "gmail") {
        result = await deleteGmailMessage(selectedMailbox.id, messageId);
      } else {
        result = await deleteOutlookMessage(selectedMailbox.id, messageId);
      }
      if (result?.success) successCount++;
    }

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} message(s)`);
      setSelectedMessages([]);
      await fetchMessages(selectedFolder, currentPage, "next");
    }
  }, [
    selectedMailbox,
    selectedMessages,
    selectedFolder,
    currentPage,
    fetchMessages,
    deleteGmailMessage,
    deleteOutlookMessage,
  ]);

  const handleBulkMarkRead = useCallback(async () => {
    if (selectedMessages.length === 0) return;

    let successCount = 0;
    for (const messageId of selectedMessages) {
      const message = messages.find((m) => (m.id || m.messageId) === messageId);
      if (!message?.isRead) {
        let result;
        if (selectedMailbox.type === "gmail") {
          result = await markGmailAsRead(selectedMailbox.id, messageId);
        } else {
          result = await markOutlookAsRead(selectedMailbox.id, messageId);
        }
        if (result?.success) successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Marked ${successCount} message(s) as read`);
      setSelectedMessages([]);
      await fetchMessages(selectedFolder, currentPage, "next");
    }
  }, [
    selectedMailbox,
    selectedMessages,
    messages,
    selectedFolder,
    currentPage,
    fetchMessages,
    markGmailAsRead,
    markOutlookAsRead,
  ]);

  const handleBackToMailboxes = useCallback(() => {
    setSelectedMailbox(null);
    setSelectedFolder(null);
    setView("list");
    setCurrentPage(1);
    setShowAllFolders(false);
    setSelectedMessages([]);
    setGmailPageTokens({});
    setGmailPrevTokens({});
    setOutlookSkipTokens({});
    setOutlookPrevTokens({});
    clearCurrentMailbox();
  }, [clearCurrentMailbox]);

  const handleBackToMessages = useCallback(() => {
    setView("messages");
    setSelectedMessages([]);
  }, []);

  // =========================
  // TOKEN EXPIRY WARNING
  // =========================
  useEffect(() => {
    if (!selectedMailbox?.expiresAt || selectedMailbox.type === "smtp") return;

    const expiryDate = new Date(selectedMailbox.expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate - now) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
      toast(
        (t) => (
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
            <div>
              <p className="font-medium">Token expiring soon</p>
              <p className="text-sm text-gray-600">
                Your {selectedMailbox.type} token expires in {daysUntilExpiry}{" "}
                days
              </p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleRefreshToken();
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
  }, [selectedMailbox, handleRefreshToken]);

  // =========================
  // DERIVED STATE
  // =========================
  const sortedFolders = Array.isArray(folders) ? sortFolders(folders) : [];
  const displayedFolders = showAllFolders
    ? sortedFolders?.filter((f) => f.name?.toLowerCase() !== "inbox") || []
    : sortedFolders
        ?.filter((f) => f.name?.toLowerCase() !== "inbox")
        .slice(0, 5) || [];

  const filteredMessages = filterUnread
    ? messages.filter((m) => !m.isRead && m.unread !== false)
    : messages;

  const startMessageCount =
    messages.length > 0 ? (currentPage - 1) * 20 + 1 : 0;
  const endMessageCount = startMessageCount + messages.length - 1;

  // =========================
  // LOADING
  // =========================
  if (isLoading && mailboxes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
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
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {view !== "list" && (
              <button
                onClick={
                  view === "message"
                    ? handleBackToMessages
                    : handleBackToMailboxes
                }
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Go back"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
              </button>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {view === "list" && "Mailboxes"}
                {view === "messages" &&
                  (selectedFolder?.name ||
                    selectedMailbox?.displayName ||
                    "Messages")}
                {view === "message" && "Message"}
              </h1>

              <p className="text-sm text-gray-600 mt-1 flex items-center flex-wrap gap-2">
                {view === "list" && `${mailboxes.length} connected`}

                {view === "messages" && selectedMailbox && (
                  <>
                    <span className="text-gray-500">
                      {selectedMailbox.email}
                    </span>
                    {selectedFolder && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {selectedFolder.name}
                      </span>
                    )}
                    {!selectedFolder &&
                      getFolderUnreadCount() > 0 &&
                      !filterUnread && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {getFolderUnreadCount()} unread
                        </span>
                      )}
                    {filterUnread && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Unread only
                      </span>
                    )}
                    {totalMessages > 0 && (
                      <span className="text-gray-400 text-xs">
                        {startMessageCount}-{endMessageCount} of {totalMessages}
                      </span>
                    )}
                  </>
                )}

                {view === "message" && currentMessage && (
                  <span className="truncate max-w-md text-gray-500">
                    {getSubject(currentMessage)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {view === "list" && (
              <>
                <button
                  onClick={fetchMailboxes}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center text-sm font-medium transition"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
                <Link to="/dashboard/audience">
                  <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center text-sm font-medium transition">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </button>
                </Link>
              </>
            )}

            {view === "messages" && selectedMailbox && (
              <>
                {selectedMessages.length > 0 ? (
                  <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <span className="text-sm font-medium text-blue-700 mr-1">
                      {selectedMessages.length}
                    </span>
                    <button
                      onClick={handleBulkMarkRead}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      title="Mark as read"
                    >
                      <MailCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedMessages([])}
                      className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                      title="Clear"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => toast.info("Compose coming soon")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center text-sm font-medium transition"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Compose
                  </button>
                )}

                <button
                  onClick={handleSyncMailbox}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center text-sm font-medium transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  Sync
                </button>

                <button
                  onClick={() => setFilterUnread(!filterUnread)}
                  className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition ${
                    filterUnread
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <MailQuestion className="w-4 h-4 mr-2" />
                  Unread
                </button>

                {selectedMailbox.type !== "smtp" && (
                  <button
                    onClick={handleRefreshToken}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center text-sm font-medium transition"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Token
                  </button>
                )}

                <button
                  onClick={() => handleDisconnectMailbox(selectedMailbox)}
                  className="px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 rounded-lg flex items-center text-sm font-medium transition"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Disconnect
                </button>
              </>
            )}

            {view === "message" && currentMessage && (
              <>
                <button
                  onClick={() => toast.info("Reply coming soon")}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center text-sm font-medium transition"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </button>
                <button
                  onClick={() =>
                    handleDeleteMessage(
                      currentMessage.id || currentMessage.messageId,
                    )
                  }
                  className="px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 rounded-lg flex items-center text-sm font-medium transition"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Mailbox List */}
        {view === "list" && (
          <div className="h-full overflow-y-auto p-6">
            {mailboxes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No mailboxes connected
                </h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Connect your Gmail or Outlook account to start managing emails
                </p>
                <Link
                  to="/dashboard/audience"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Connect Mailbox
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mailboxes.map((mailbox) => (
                  <button
                    key={mailbox.id}
                    onClick={() => handleSelectMailbox(mailbox)}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center mr-4 group-hover:scale-110 transition">
                          {getProviderIcon(mailbox.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {mailbox.displayName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {mailbox.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          mailbox.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {mailbox.isVerified ? "Verified" : "Pending"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Daily Sent</p>
                        <p className="font-medium text-gray-900">
                          {mailbox.stats?.dailySent || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Sync</p>
                        <p className="font-medium text-gray-900">
                          {mailbox.lastSyncAt
                            ? format(
                                new Date(mailbox.lastSyncAt),
                                "MMM d, yyyy",
                              )
                            : "Never"}
                        </p>
                      </div>
                    </div>

                    {mailbox.expiresAt && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        Expires:{" "}
                        {format(new Date(mailbox.expiresAt), "MMM d, yyyy")}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages View */}
        {view === "messages" && selectedMailbox && (
          <div className="h-full flex">
            {/* Folders Sidebar */}
            {(selectedMailbox.type === "gmail" ||
              selectedMailbox.type === "outlook") &&
              folders.length > 0 && (
                <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto shrink-0">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {selectedMailbox.type === "gmail"
                          ? "Labels"
                          : "Folders"}
                      </h3>
                      {folders?.length > 5 && (
                        <button
                          onClick={() => setShowAllFolders(!showAllFolders)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {showAllFolders ? "Less" : "More"}
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {/* Inbox */}
                      <button
                        onClick={() => handleSelectFolder(null)}
                        className={`w-full flex items-center px-3 py-2.5 rounded-lg transition ${
                          !selectedFolder
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <InboxIcon
                          className={`w-4 h-4 mr-3 ${
                            !selectedFolder ? "text-blue-600" : "text-gray-400"
                          }`}
                        />
                        <span className="text-sm font-medium flex-1 text-left">
                          Inbox
                        </span>
                        {getFolderUnreadCount() > 0 && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              !selectedFolder
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {getFolderUnreadCount()}
                          </span>
                        )}
                      </button>

                      {/* Other folders */}
                      {displayedFolders.map((folder) => {
                        const isSelected = selectedFolder?.id === folder.id;
                        return (
                          <button
                            key={folder.id}
                            onClick={() => handleSelectFolder(folder)}
                            className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                              isSelected
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <span className="w-4 h-4 mr-3 text-gray-400">
                              {getFolderIcon(folder.name)}
                            </span>
                            <span className="text-sm truncate flex-1 text-left">
                              {folder.name}
                            </span>
                            {folder.unreadCount > 0 && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {folder.unreadCount}
                              </span>
                            )}
                            {folderLoading[folder.id] && (
                              <Loader2 className="w-3 h-3 ml-2 animate-spin text-blue-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            {/* Messages List */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages... (coming soon)"
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto">
                {isLoadingMessages && filteredMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                    <span className="text-gray-600">Loading messages...</span>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Inbox className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">
                      No messages found
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {filterUnread
                        ? "No unread messages"
                        : selectedFolder
                          ? `${selectedFolder.name} is empty`
                          : "Inbox is empty"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredMessages?.map((message) => {
                      const id = message.id || message.messageId;
                      const isRead = message.isRead || !message.unread;
                      const sender = getSenderInfo(message);
                      const isSelected = selectedMessages.includes(id);

                      return (
                        <div
                          key={id}
                          className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer transition ${
                            !isRead ? "bg-blue-50/30" : ""
                          } ${isSelected ? "bg-blue-100/30" : ""}`}
                        >
                          <div className="flex items-center mr-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleCheckMessage(id, e.target.checked)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300"
                            />
                          </div>

                          <div
                            className="flex-1 min-w-0"
                            onClick={() => handleSelectMessage(message)}
                          >
                            <div className="flex items-center mb-1">
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold mr-3 shrink-0">
                                {getInitials(sender.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p
                                    className={`text-sm truncate ${
                                      !isRead
                                        ? "font-semibold text-gray-900"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {sender.name}
                                  </p>
                                  <p className="text-xs text-gray-500 ml-2 shrink-0">
                                    {formatMessageDate(message)}
                                  </p>
                                </div>
                                <p
                                  className={`text-sm truncate ${
                                    !isRead
                                      ? "font-medium text-gray-900"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {getSubject(message)}
                                </p>
                              </div>
                            </div>

                            <p className="text-xs text-gray-500 line-clamp-2 pl-11">
                              {getPreview(message)}
                            </p>
                          </div>

                          {!isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 shrink-0"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {filteredMessages.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {currentPage}
                    {totalMessages > 0 &&
                      ` • ${startMessageCount}-${endMessageCount} of ${totalMessages}`}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={!hasPreviousPage || isLoadingMessages}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg text-sm font-medium transition flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage || isLoadingMessages}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg text-sm font-medium transition flex items-center"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Detail View */}
        {view === "message" && currentMessage && selectedMailbox && (
          <div className="h-full flex flex-col bg-white overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {getSubject(currentMessage)}
              </h2>

              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold mr-3 shrink-0">
                  {getInitials(getSenderInfo(currentMessage).name)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getSenderInfo(currentMessage).name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getSenderInfo(currentMessage).email}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatFullDate(currentMessage)}
                    </p>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium mr-2">To:</span>
                    <span className="text-gray-500">
                      {currentMessage.toRecipients
                        ?.map((r) => r.emailAddress?.address)
                        .filter(Boolean)
                        .join(", ") ||
                        currentMessage.payload?.headers?.find(
                          (h) => h.name === "To",
                        )?.value ||
                        "You"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6">
              {/* Gmail format */}
              {selectedMailbox.type === "gmail" &&
              currentMessage.payload?.body?.data ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: atob(
                      currentMessage.payload.body.data
                        .replace(/-/g, "+")
                        .replace(/_/g, "/"),
                    ),
                  }}
                />
              ) : currentMessage.payload?.parts ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      const html = currentMessage.payload.parts.find(
                        (p) => p.mimeType === "text/html",
                      );
                      if (html?.body?.data) {
                        return atob(
                          html.body.data.replace(/-/g, "+").replace(/_/g, "/"),
                        );
                      }
                      const text = currentMessage.payload.parts.find(
                        (p) => p.mimeType === "text/plain",
                      );
                      if (text?.body?.data) {
                        return `<pre>${atob(text.body.data.replace(/-/g, "+").replace(/_/g, "/"))}</pre>`;
                      }
                      return "<p>No content</p>";
                    })(),
                  }}
                />
              ) : selectedMailbox.type === "outlook" ? (
                /* ✅ NOW BEAUTIFUL - Outlook with HTML content */
                <div className="prose max-w-none">
                  {currentMessage.body?.content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: currentMessage.body.content,
                      }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-gray-800">
                      {currentMessage.bodyPreview || "No content"}
                    </pre>
                  )}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-gray-800">
                  {currentMessage.bodyPreview ||
                    currentMessage.snippet ||
                    "No content"}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mailboxes;
