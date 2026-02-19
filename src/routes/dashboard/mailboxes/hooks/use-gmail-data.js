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
  useGmailAttachmentsQuery,
  useMarkGmailAsReadMutation,
  useMarkGmailAsUnreadMutation,
  useDeleteGmailMessageMutation,
  usePermanentlyDeleteGmailMessageMutation,
  useToggleGmailStarMutation,
  useToggleGmailImportantMutation,
  useSendGmailMessageMutation,
  useReplyToGmailMessageMutation,
  useForwardGmailMessageMutation,
  useCreateGmailDraftMutation,
  useUpdateGmailDraftMutation,
  useDeleteGmailDraftMutation,
  useSendGmailDraftMutation,
  useDownloadGmailAttachment,
  useSyncGmailMailboxMutation,
  useRefreshGmailTokenMutation,
  useDisconnectGmailMailboxMutation,
  useModifyGmailLabelsMutation,
  useBatchGmailOperationsMutation,
  useGmailSearchQuery,
  useGmailThreadsQuery,
  useGmailProfileQuery,
} from "../../../../hooks/useGmail";

export const useGmailData = (selectedMailbox, selectedFolder, currentMessageId, PAGE_SIZE, searchQuery) => {
  const isGmail = selectedMailbox?.type === "gmail";
  const mailboxId = isGmail ? selectedMailbox.id : null;

  // Queries
  const gmailMessagesQuery = useGmailMessagesQuery(
    isGmail &&
      (!selectedFolder ||
        !["SENT", "TRASH", "SPAM", "STARRED", "IMPORTANT", "DRAFT"].includes(
          selectedFolder.id,
        ))
      ? mailboxId
      : null,
    selectedFolder ? (selectedFolder.id ? [selectedFolder.id] : []) : ["INBOX"],
    PAGE_SIZE,
  );

  const gmailSentQuery = useGmailSentMessagesQuery(
    isGmail && selectedFolder?.id === "SENT" ? mailboxId : null,
    PAGE_SIZE,
  );
  const gmailTrashQuery = useGmailTrashMessagesQuery(
    isGmail && selectedFolder?.id === "TRASH" ? mailboxId : null,
    PAGE_SIZE,
  );
  const gmailSpamQuery = useGmailSpamMessagesQuery(
    isGmail && selectedFolder?.id === "SPAM" ? mailboxId : null,
    PAGE_SIZE,
  );
  const gmailStarredQuery = useGmailStarredMessagesQuery(
    isGmail && selectedFolder?.id === "STARRED" ? mailboxId : null,
    PAGE_SIZE,
  );
  const gmailImportantQuery = useGmailImportantMessagesQuery(
    isGmail && selectedFolder?.id === "IMPORTANT" ? mailboxId : null,
    PAGE_SIZE,
  );
  const gmailDraftsQuery = useGmailDraftsQuery(
    isGmail && selectedFolder?.id === "DRAFT" ? mailboxId : null,
    PAGE_SIZE,
  );

  const gmailLabelsQuery = useGmailLabelsQuery(mailboxId);

  const currentGmailMessageQuery = useGmailMessageQuery(
    mailboxId,
    currentMessageId,
  );

  const gmailAttachmentsQuery = useGmailAttachmentsQuery(
    isGmail && currentMessageId ? mailboxId : null,
    currentMessageId,
  );

  // Mutations
  const markGmailAsRead = useMarkGmailAsReadMutation();
  const markGmailAsUnread = useMarkGmailAsUnreadMutation();
  const deleteGmailMessage = useDeleteGmailMessageMutation();
  const permanentlyDeleteGmailMessage = usePermanentlyDeleteGmailMessageMutation();
  const toggleGmailStar = useToggleGmailStarMutation();
  const toggleGmailImportant = useToggleGmailImportantMutation();
  const sendGmailMessage = useSendGmailMessageMutation();
  const replyToGmailMessage = useReplyToGmailMessageMutation();
  const forwardGmailMessage = useForwardGmailMessageMutation();
  const createGmailDraft = useCreateGmailDraftMutation();
  const updateGmailDraft = useUpdateGmailDraftMutation();
  const deleteGmailDraft = useDeleteGmailDraftMutation();
  const sendGmailDraft = useSendGmailDraftMutation();
  const downloadGmailAttachment = useDownloadGmailAttachment();
  const syncGmailMailbox = useSyncGmailMailboxMutation();
  const refreshGmailToken = useRefreshGmailTokenMutation();
  const disconnectGmailMailbox = useDisconnectGmailMailboxMutation();
  const modifyGmailLabels = useModifyGmailLabelsMutation();
  const batchGmailOperations = useBatchGmailOperationsMutation();

  const gmailSearchQuery = useGmailSearchQuery(
    isGmail && searchQuery ? mailboxId : null,
    searchQuery,
    PAGE_SIZE,
  );

  const gmailThreadsQuery = useGmailThreadsQuery(
    mailboxId,
    selectedFolder?.id ? [selectedFolder.id] : ["INBOX"],
    PAGE_SIZE,
  );

  const gmailProfileQuery = useGmailProfileQuery(mailboxId);

  return {
    queries: {
      messages: gmailMessagesQuery,
      sent: gmailSentQuery,
      trash: gmailTrashQuery,
      spam: gmailSpamQuery,
      starred: gmailStarredQuery,
      important: gmailImportantQuery,
      drafts: gmailDraftsQuery,
      labels: gmailLabelsQuery,
      message: currentGmailMessageQuery,
      attachments: gmailAttachmentsQuery,
      search: gmailSearchQuery,
      threads: gmailThreadsQuery,
      profile: gmailProfileQuery,
    },
    mutations: {
      markAsRead: markGmailAsRead,
      markAsUnread: markGmailAsUnread,
      deleteMessage: deleteGmailMessage,
      permanentlyDelete: permanentlyDeleteGmailMessage,
      toggleStar: toggleGmailStar,
      toggleImportant: toggleGmailImportant,
      sendMessage: sendGmailMessage,
      reply: replyToGmailMessage,
      forward: forwardGmailMessage,
      createDraft: createGmailDraft,
      updateDraft: updateGmailDraft,
      deleteDraft: deleteGmailDraft,
      sendDraft: sendGmailDraft,
      downloadAttachment: downloadGmailAttachment,
      sync: syncGmailMailbox,
      refreshToken: refreshGmailToken,
      disconnect: disconnectGmailMailbox,
      modifyLabels: modifyGmailLabels,
      batchOperations: batchGmailOperations,
    },
  };
};
