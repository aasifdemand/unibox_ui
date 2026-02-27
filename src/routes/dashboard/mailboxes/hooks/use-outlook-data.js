import {
  useOutlookMessagesQuery,
  useOutlookSentMessagesQuery,
  useOutlookTrashMessagesQuery,
  useOutlookSpamMessagesQuery,
  useOutlookArchiveMessagesQuery,
  useOutlookOutboxMessagesQuery,
  useOutlookDraftsQuery,
  useOutlookMessageQuery,
  useOutlookFoldersQuery,
  useOutlookSearchQuery,
  useOutlookAttachmentsQuery,
  useSendOutlookMessageMutation,
  useReplyToOutlookMessageMutation,
  useForwardOutlookMessageMutation,
  useCreateOutlookDraftMutation,
  useUpdateOutlookDraftMutation,
  useDeleteOutlookDraftMutation,
  useSendOutlookDraftMutation,
  useMarkOutlookAsReadMutation,
  useMarkOutlookAsUnreadMutation,
  useToggleOutlookFlagMutation,
  useDeleteOutlookMessageMutation,
  useMoveOutlookMessageMutation,
  useCopyOutlookMessageMutation,
  useBatchOutlookOperationsMutation,
  useDownloadOutlookAttachment,
  useSyncOutlookMailboxMutation,
  useDisconnectOutlookMailboxMutation,
  useRefreshOutlookTokenMutation,
} from '../../../../hooks/useOutlook';
import { isFolderType } from '../utils/folder-utils';

export const useOutlookData = (
  selectedMailbox,
  selectedFolder,
  currentMessageId,
  PAGE_SIZE,
  searchQuery,
) => {
  const isOutlook = selectedMailbox?.type === 'outlook';
  const mailboxId = isOutlook ? selectedMailbox.id : null;

  // Queries
  const isSpecialFolder =
    selectedFolder &&
    (isFolderType(selectedFolder, 'sent') ||
      isFolderType(selectedFolder, 'trash') ||
      isFolderType(selectedFolder, 'spam') ||
      isFolderType(selectedFolder, 'archive') ||
      isFolderType(selectedFolder, 'outbox') ||
      isFolderType(selectedFolder, 'drafts'));

  const outlookMessagesQuery = useOutlookMessagesQuery(
    isOutlook && (!selectedFolder || !isSpecialFolder) ? mailboxId : null,
    selectedFolder?.id || 'inbox',
    PAGE_SIZE,
  );

  const outlookSentQuery = useOutlookSentMessagesQuery(
    isOutlook && isFolderType(selectedFolder, 'sent') ? mailboxId : null,
    PAGE_SIZE,
  );

  const outlookTrashQuery = useOutlookTrashMessagesQuery(
    isOutlook && isFolderType(selectedFolder, 'trash') ? mailboxId : null,
    PAGE_SIZE,
  );

  const outlookSpamQuery = useOutlookSpamMessagesQuery(
    isOutlook && isFolderType(selectedFolder, 'spam') ? mailboxId : null,
    PAGE_SIZE,
  );

  const outlookArchiveQuery = useOutlookArchiveMessagesQuery(
    isOutlook && isFolderType(selectedFolder, 'archive') ? mailboxId : null,
    PAGE_SIZE,
  );

  const outlookOutboxQuery = useOutlookOutboxMessagesQuery(
    isOutlook && isFolderType(selectedFolder, 'outbox') ? mailboxId : null,
    PAGE_SIZE,
  );

  const outlookDraftsQuery = useOutlookDraftsQuery(
    isOutlook && isFolderType(selectedFolder, 'drafts') ? mailboxId : null,
    PAGE_SIZE,
  );

  const outlookFoldersQuery = useOutlookFoldersQuery(mailboxId);

  const currentOutlookMessageQuery = useOutlookMessageQuery(mailboxId, currentMessageId);

  const outlookAttachmentsQuery = useOutlookAttachmentsQuery(
    isOutlook && currentMessageId ? mailboxId : null,
    currentMessageId,
  );

  const outlookSearchQuery = useOutlookSearchQuery(
    isOutlook && searchQuery ? mailboxId : null,
    searchQuery,
    PAGE_SIZE,
  );

  // Mutations
  const sendOutlookMessage = useSendOutlookMessageMutation();
  const replyToOutlookMessage = useReplyToOutlookMessageMutation();
  const forwardOutlookMessage = useForwardOutlookMessageMutation();
  const createOutlookDraft = useCreateOutlookDraftMutation();
  const updateOutlookDraft = useUpdateOutlookDraftMutation();
  const deleteOutlookDraft = useDeleteOutlookDraftMutation();
  const sendOutlookDraft = useSendOutlookDraftMutation();
  const markOutlookAsRead = useMarkOutlookAsReadMutation();
  const markOutlookAsUnread = useMarkOutlookAsUnreadMutation();
  const toggleOutlookFlag = useToggleOutlookFlagMutation();
  const deleteOutlookMessage = useDeleteOutlookMessageMutation();
  const moveOutlookMessage = useMoveOutlookMessageMutation();
  const copyOutlookMessage = useCopyOutlookMessageMutation();
  const batchOutlookOperations = useBatchOutlookOperationsMutation();
  const downloadOutlookAttachment = useDownloadOutlookAttachment();
  const syncOutlookMailbox = useSyncOutlookMailboxMutation();
  const disconnectOutlookMailbox = useDisconnectOutlookMailboxMutation();
  const refreshOutlookToken = useRefreshOutlookTokenMutation();

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
      search: outlookSearchQuery,
      isSpecialFolder,
    },
    mutations: {
      sendMessage: sendOutlookMessage,
      reply: replyToOutlookMessage,
      forward: forwardOutlookMessage,
      createDraft: createOutlookDraft,
      updateDraft: updateOutlookDraft,
      deleteDraft: deleteOutlookDraft,
      sendDraft: sendOutlookDraft,
      markAsRead: markOutlookAsRead,
      markAsUnread: markOutlookAsUnread,
      toggleFlag: toggleOutlookFlag,
      deleteMessage: deleteOutlookMessage,
      moveMessage: moveOutlookMessage,
      copyMessage: copyOutlookMessage,
      batchOperations: batchOutlookOperations,
      downloadAttachment: downloadOutlookAttachment,
      sync: syncOutlookMailbox,
      disconnect: disconnectOutlookMailbox,
      refreshToken: refreshOutlookToken,
    },
  };
};
