import {
  useGmailMessagesQuery,
  useGmailSentMessagesQuery,
  useGmailTrashMessagesQuery,
  useGmailSpamMessagesQuery,
  useGmailStarredMessagesQuery,
  useGmailImportantMessagesQuery,
  useGmailDraftsQuery,
  useGmailMessageQuery,
  useGmailLabelsQuery,
  useGmailSearchQuery,
  useGmailAttachmentsQuery,
  useSendGmailMessageMutation,
  useReplyToGmailMessageMutation,
  useForwardGmailMessageMutation,
  useCreateGmailDraftMutation,
  useUpdateGmailDraftMutation,
  useDeleteGmailDraftMutation,
  useSendGmailDraftMutation,
  useMarkGmailAsReadMutation,
  useMarkGmailAsUnreadMutation,
  useToggleGmailStarMutation,
  useToggleGmailImportantMutation,
  useDeleteGmailMessageMutation,
  useModifyGmailLabelsMutation,
  useBatchGmailOperationsMutation,
  useDownloadGmailAttachment,
  useSyncGmailMailboxMutation,
  useDisconnectGmailMailboxMutation,
  useRefreshGmailTokenMutation,
} from '../../../../hooks/useGmail';
import { isFolderType } from '../utils/folder-utils';

export const useGmailData = (
  selectedMailbox,
  selectedFolder,
  currentMessageId,
  PAGE_SIZE,
  searchQuery,
) => {
  const isGmail = selectedMailbox?.type === 'gmail';
  const mailboxId = isGmail ? selectedMailbox.id : null;

  // Queries
  const isSpecialFolder =
    selectedFolder &&
    (isFolderType(selectedFolder, 'sent') ||
      isFolderType(selectedFolder, 'trash') ||
      isFolderType(selectedFolder, 'spam') ||
      isFolderType(selectedFolder, 'starred') ||
      isFolderType(selectedFolder, 'important') ||
      isFolderType(selectedFolder, 'drafts'));

  const gmailMessagesQuery = useGmailMessagesQuery(
    isGmail && (!selectedFolder || !isSpecialFolder) ? mailboxId : null,
    selectedFolder?.id ? [selectedFolder.id] : ['INBOX'],
    PAGE_SIZE,
  );

  const gmailSentQuery = useGmailSentMessagesQuery(
    isGmail && isFolderType(selectedFolder, 'sent') ? mailboxId : null,
    PAGE_SIZE,
  );

  const gmailTrashQuery = useGmailTrashMessagesQuery(
    isGmail && isFolderType(selectedFolder, 'trash') ? mailboxId : null,
    PAGE_SIZE,
  );

  const gmailSpamQuery = useGmailSpamMessagesQuery(
    isGmail && isFolderType(selectedFolder, 'spam') ? mailboxId : null,
    PAGE_SIZE,
  );

  const gmailStarredQuery = useGmailStarredMessagesQuery(
    isGmail && isFolderType(selectedFolder, 'starred') ? mailboxId : null,
    PAGE_SIZE,
  );

  const gmailImportantQuery = useGmailImportantMessagesQuery(
    isGmail && isFolderType(selectedFolder, 'important') ? mailboxId : null,
    PAGE_SIZE,
  );

  const gmailDraftsQuery = useGmailDraftsQuery(
    isGmail && isFolderType(selectedFolder, 'drafts') ? mailboxId : null,
    PAGE_SIZE,
  );

  const gmailLabelsQuery = useGmailLabelsQuery(mailboxId);

  const currentGmailMessageQuery = useGmailMessageQuery(mailboxId, currentMessageId);

  const gmailAttachmentsQuery = useGmailAttachmentsQuery(
    isGmail && currentMessageId ? mailboxId : null,
    currentMessageId,
  );

  const gmailSearchQuery = useGmailSearchQuery(
    isGmail && searchQuery ? mailboxId : null,
    searchQuery,
    PAGE_SIZE,
  );

  // Mutations
  const sendGmailMessage = useSendGmailMessageMutation();
  const replyToGmailMessage = useReplyToGmailMessageMutation();
  const forwardGmailMessage = useForwardGmailMessageMutation();
  const createGmailDraft = useCreateGmailDraftMutation();
  const updateGmailDraft = useUpdateGmailDraftMutation();
  const deleteGmailDraft = useDeleteGmailDraftMutation();
  const sendGmailDraft = useSendGmailDraftMutation();
  const markGmailAsRead = useMarkGmailAsReadMutation();
  const markGmailAsUnread = useMarkGmailAsUnreadMutation();
  const toggleGmailStar = useToggleGmailStarMutation();
  const toggleGmailImportant = useToggleGmailImportantMutation();
  const deleteGmailMessage = useDeleteGmailMessageMutation();
  const modifyGmailLabels = useModifyGmailLabelsMutation();
  const batchGmailOperations = useBatchGmailOperationsMutation();
  const downloadGmailAttachment = useDownloadGmailAttachment();
  const syncGmailMailbox = useSyncGmailMailboxMutation();
  const disconnectGmailMailbox = useDisconnectGmailMailboxMutation();
  const refreshGmailToken = useRefreshGmailTokenMutation();

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
    },
    mutations: {
      sendMessage: sendGmailMessage,
      reply: replyToGmailMessage,
      forward: forwardGmailMessage,
      createDraft: createGmailDraft,
      updateDraft: updateGmailDraft,
      deleteDraft: deleteGmailDraft,
      sendDraft: sendGmailDraft,
      markAsRead: markGmailAsRead,
      markAsUnread: markGmailAsUnread,
      toggleStar: toggleGmailStar,
      toggleImportant: toggleGmailImportant,
      deleteMessage: deleteGmailMessage,
      modifyLabels: modifyGmailLabels,
      batchOperations: batchGmailOperations,
      downloadAttachment: downloadGmailAttachment,
      sync: syncGmailMailbox,
      disconnect: disconnectGmailMailbox,
      refreshToken: refreshGmailToken,
    },
  };
};
