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
  useOutlookAttachmentsQuery,
  useOutlookProfileQuery,
  useOutlookSearchQuery,
  useMarkOutlookAsReadMutation,
  useMarkOutlookAsUnreadMutation,
  useDeleteOutlookMessageMutation,
  useMoveOutlookMessageMutation,
  useCopyOutlookMessageMutation,
  useToggleOutlookFlagMutation,
  useBatchOutlookOperationsMutation,
  useSendOutlookMessageMutation,
  useReplyToOutlookMessageMutation,
  useForwardOutlookMessageMutation,
  useCreateOutlookDraftMutation,
  useUpdateOutlookDraftMutation,
  useDeleteOutlookDraftMutation,
  useSendOutlookDraftMutation,
  useCreateOutlookFolderMutation,
  useUpdateOutlookFolderMutation,
  useDeleteOutlookFolderMutation,
  useDownloadOutlookAttachment,
  useSyncOutlookMailboxMutation,
  useRefreshOutlookTokenMutation,
  useDisconnectOutlookMailboxMutation,
  useCreateOutlookReplyDraftMutation,
  useCreateOutlookForwardDraftMutation,
} from "../../../../hooks/useOutlook";

export const useOutlookData = (selectedMailbox, selectedFolder, currentMessageId, PAGE_SIZE, searchQuery) => {
  const isOutlook = selectedMailbox?.type === "outlook";
  const mailboxId = isOutlook ? selectedMailbox.id : null;

  // Queries
  const outlookMessagesQuery = useOutlookMessagesQuery(
    isOutlook &&
      (!selectedFolder ||
        ![
          "sentitems",
          "deleteditems",
          "junkemail",
          "archive",
          "outbox",
          "drafts",
        ].includes(selectedFolder.id))
      ? mailboxId
      : null,
    selectedFolder ? selectedFolder.id || "" : "inbox",
    PAGE_SIZE,
  );

  const outlookSentQuery = useOutlookSentMessagesQuery(
    isOutlook && selectedFolder?.id === "sentitems" ? mailboxId : null,
    PAGE_SIZE,
  );
  const outlookTrashQuery = useOutlookTrashMessagesQuery(
    isOutlook && selectedFolder?.id === "deleteditems" ? mailboxId : null,
    PAGE_SIZE,
  );
  const outlookSpamQuery = useOutlookSpamMessagesQuery(
    isOutlook && selectedFolder?.id === "junkemail" ? mailboxId : null,
    PAGE_SIZE,
  );
  const outlookArchiveQuery = useOutlookArchiveMessagesQuery(
    isOutlook && selectedFolder?.id === "archive" ? mailboxId : null,
    PAGE_SIZE,
  );
  const outlookOutboxQuery = useOutlookOutboxMessagesQuery(
    isOutlook && selectedFolder?.id === "outbox" ? mailboxId : null,
    PAGE_SIZE,
  );
  const outlookDraftsQuery = useOutlookDraftsQuery(
    isOutlook && selectedFolder?.id === "drafts" ? mailboxId : null,
    PAGE_SIZE,
  );

  const outlookFoldersQuery = useOutlookFoldersQuery(mailboxId);

  const currentOutlookMessageQuery = useOutlookMessageQuery(
    mailboxId,
    currentMessageId,
  );

  const outlookAttachmentsQuery = useOutlookAttachmentsQuery(
    isOutlook && currentMessageId ? mailboxId : null,
    currentMessageId,
  );

  const outlookProfileQuery = useOutlookProfileQuery(mailboxId);

  const outlookSearchQuery = useOutlookSearchQuery(
    isOutlook && searchQuery ? mailboxId : null,
    searchQuery,
    PAGE_SIZE,
  );

  // Mutations
  const markOutlookAsRead = useMarkOutlookAsReadMutation();
  const markOutlookAsUnread = useMarkOutlookAsUnreadMutation();
  const deleteOutlookMessage = useDeleteOutlookMessageMutation();
  const moveOutlookMessage = useMoveOutlookMessageMutation();
  const copyOutlookMessage = useCopyOutlookMessageMutation();
  const toggleOutlookFlag = useToggleOutlookFlagMutation();
  const batchOutlookOperations = useBatchOutlookOperationsMutation();
  const sendOutlookMessage = useSendOutlookMessageMutation();
  const replyToOutlookMessage = useReplyToOutlookMessageMutation();
  const forwardOutlookMessage = useForwardOutlookMessageMutation();
  const createOutlookDraft = useCreateOutlookDraftMutation();
  const updateOutlookDraft = useUpdateOutlookDraftMutation();
  const deleteOutlookDraft = useDeleteOutlookDraftMutation();
  const sendOutlookDraft = useSendOutlookDraftMutation();
  const createOutlookFolder = useCreateOutlookFolderMutation();
  const updateOutlookFolder = useUpdateOutlookFolderMutation();
  const deleteOutlookFolder = useDeleteOutlookFolderMutation();
  const downloadOutlookAttachment = useDownloadOutlookAttachment();
  const syncOutlookMailbox = useSyncOutlookMailboxMutation();
  const refreshOutlookToken = useRefreshOutlookTokenMutation();
  const disconnectOutlookMailbox = useDisconnectOutlookMailboxMutation();
  const createOutlookReplyDraft = useCreateOutlookReplyDraftMutation();
  const createOutlookForwardDraft = useCreateOutlookForwardDraftMutation();

  return {
    queries: {
      messages: outlookMessagesQuery,
      sent: outlookSentQuery,
      trash: outlookTrashQuery,
      spam: outlookSpamQuery,
      archive: outlookArchiveQuery,
      outbox: outlookOutboxQuery,
      drafts: outlookDraftsQuery,
      folders: outlookFoldersQuery,
      message: currentOutlookMessageQuery,
      attachments: outlookAttachmentsQuery,
      profile: outlookProfileQuery,
      search: outlookSearchQuery,
    },
    mutations: {
      markAsRead: markOutlookAsRead,
      markAsUnread: markOutlookAsUnread,
      deleteMessage: deleteOutlookMessage,
      moveMessage: moveOutlookMessage,
      copyMessage: copyOutlookMessage,
      toggleFlag: toggleOutlookFlag,
      batchOperations: batchOutlookOperations,
      sendMessage: sendOutlookMessage,
      reply: replyToOutlookMessage,
      forward: forwardOutlookMessage,
      createDraft: createOutlookDraft,
      updateDraft: updateOutlookDraft,
      deleteDraft: deleteOutlookDraft,
      sendDraft: sendOutlookDraft,
      createFolder: createOutlookFolder,
      updateFolder: updateOutlookFolder,
      deleteFolder: deleteOutlookFolder,
      downloadAttachment: downloadOutlookAttachment,
      sync: syncOutlookMailbox,
      refreshToken: refreshOutlookToken,
      disconnect: disconnectOutlookMailbox,
      createReplyDraft: createOutlookReplyDraft,
      createForwardDraft: createOutlookForwardDraft,
    },
  };
};
