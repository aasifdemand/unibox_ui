import {
  useSmtpMessagesQuery,
  useSmtpSentMessagesQuery,
  useSmtpDraftMessagesQuery,
  useSmtpTrashMessagesQuery,
  useSmtpSpamMessagesQuery,
  useSmtpArchiveMessagesQuery,
  useSmtpFoldersQuery,
  useSmtpMessageQuery,
  useSmtpStatusQuery,
  useSmtpSearchQuery,
  useSmtpAttachmentsQuery,
  useMarkSmtpAsReadMutation,
  useMarkSmtpAsUnreadMutation,
  useDeleteSmtpMessageMutation,
  useMoveSmtpMessageMutation,
  useCopySmtpMessageMutation,
  useToggleSmtpFlagMutation,
  useBatchSmtpOperationsMutation,
  useSendSmtpMessageMutation,
  useCreateSmtpDraftMutation,
  useUpdateSmtpDraftMutation,
  useDeleteSmtpDraftMutation,
  useSendSmtpDraftMutation,
  useDownloadSmtpAttachment,
  useSyncSmtpMailboxMutation,
  useDisconnectSmtpMailboxMutation,
} from "../../../../hooks/useSmtp";

export const useSmtpData = (
  selectedMailbox,
  selectedFolder,
  currentMessageId,
  currentPage,
  PAGE_SIZE,
  searchQuery,
) => {
  const isSmtp = selectedMailbox?.type === "smtp";
  const mailboxId = isSmtp ? selectedMailbox.id : null;

  // Queries
  const smtpMessagesQuery = useSmtpMessagesQuery(
    isSmtp &&
      (!selectedFolder ||
        selectedFolder.id === "INBOX" ||
        selectedFolder.name === "INBOX")
      ? mailboxId
      : null,
    currentPage || 1,
    PAGE_SIZE,
    "INBOX",
  );

  const smtpSentQuery = useSmtpSentMessagesQuery(
    isSmtp && (selectedFolder?.id === "SENT" || selectedFolder?.name === "SENT")
      ? mailboxId
      : null,
    currentPage || 1,
    PAGE_SIZE,
  );

  const smtpDraftsQuery = useSmtpDraftMessagesQuery(
    isSmtp &&
      (selectedFolder?.id === "DRAFTS" || selectedFolder?.name === "DRAFTS")
      ? mailboxId
      : null,
    currentPage || 1,
    PAGE_SIZE,
  );

  const smtpTrashQuery = useSmtpTrashMessagesQuery(
    isSmtp &&
      (selectedFolder?.id === "TRASH" || selectedFolder?.name === "TRASH")
      ? mailboxId
      : null,
    currentPage || 1,
    PAGE_SIZE,
  );

  const smtpSpamQuery = useSmtpSpamMessagesQuery(
    isSmtp && (selectedFolder?.id === "SPAM" || selectedFolder?.name === "SPAM")
      ? mailboxId
      : null,
    currentPage || 1,
    PAGE_SIZE,
  );

  const smtpArchiveQuery = useSmtpArchiveMessagesQuery(
    isSmtp &&
      (selectedFolder?.id === "ARCHIVE" || selectedFolder?.name === "ARCHIVE")
      ? mailboxId
      : null,
    currentPage || 1,
    PAGE_SIZE,
  );

  const smtpFoldersQuery = useSmtpFoldersQuery(mailboxId);

  const currentSmtpMessageQuery = useSmtpMessageQuery(
    mailboxId,
    currentMessageId,
    selectedFolder?.name || "INBOX",
  );

  const smtpAttachmentsQuery = useSmtpAttachmentsQuery(
    isSmtp && currentMessageId ? mailboxId : null,
    currentMessageId,
    selectedFolder?.name || "INBOX",
  );

  const smtpStatusQuery = useSmtpStatusQuery(mailboxId);

  const smtpSearchQuery = useSmtpSearchQuery(
    isSmtp && searchQuery ? mailboxId : null,
    searchQuery,
    selectedFolder?.name,
    PAGE_SIZE,
  );

  // Mutations
  const markSmtpAsRead = useMarkSmtpAsReadMutation();
  const markSmtpAsUnread = useMarkSmtpAsUnreadMutation();
  const deleteSmtpMessage = useDeleteSmtpMessageMutation();
  const moveSmtpMessage = useMoveSmtpMessageMutation();
  const copySmtpMessage = useCopySmtpMessageMutation();
  const toggleSmtpFlag = useToggleSmtpFlagMutation();
  const batchSmtpOperations = useBatchSmtpOperationsMutation();
  const sendSmtpMessage = useSendSmtpMessageMutation();
  const createSmtpDraft = useCreateSmtpDraftMutation();
  const updateSmtpDraft = useUpdateSmtpDraftMutation();
  const deleteSmtpDraft = useDeleteSmtpDraftMutation();
  const sendSmtpDraft = useSendSmtpDraftMutation();
  const downloadSmtpAttachment = useDownloadSmtpAttachment();
  const syncSmtpMailbox = useSyncSmtpMailboxMutation();
  const disconnectSmtpMailbox = useDisconnectSmtpMailboxMutation();

  return {
    queries: {
      messages: smtpMessagesQuery,
      sent: smtpSentQuery,
      drafts: smtpDraftsQuery,
      trash: smtpTrashQuery,
      spam: smtpSpamQuery,
      archive: smtpArchiveQuery,
      folders: smtpFoldersQuery,
      message: currentSmtpMessageQuery,
      attachments: smtpAttachmentsQuery,
      status: smtpStatusQuery,
      search: smtpSearchQuery,
    },
    mutations: {
      markAsRead: markSmtpAsRead,
      markAsUnread: markSmtpAsUnread,
      deleteMessage: deleteSmtpMessage,
      moveMessage: moveSmtpMessage,
      copyMessage: copySmtpMessage,
      toggleFlag: toggleSmtpFlag,
      batchOperations: batchSmtpOperations,
      sendMessage: sendSmtpMessage,
      createDraft: createSmtpDraft,
      updateDraft: updateSmtpDraft,
      deleteDraft: deleteSmtpDraft,
      sendDraft: sendSmtpDraft,
      downloadAttachment: downloadSmtpAttachment,
      sync: syncSmtpMailbox,
      disconnect: disconnectSmtpMailbox,
    },
  };
};
