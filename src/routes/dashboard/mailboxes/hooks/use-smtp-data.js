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
} from '../../../../hooks/useSmtp';
import { isFolderType } from '../utils/folder-utils';

export const useSmtpData = (
  selectedMailbox,
  selectedFolder,
  currentMessageId,
  currentPage,
  PAGE_SIZE,
  searchQuery,
) => {
  const isSmtp = selectedMailbox?.type === 'smtp';
  const mailboxId = isSmtp ? selectedMailbox.id : null;

  // Queries
  const isSpecialFolder =
    selectedFolder &&
    (isFolderType(selectedFolder, 'sent') ||
      isFolderType(selectedFolder, 'drafts') ||
      isFolderType(selectedFolder, 'trash') ||
      isFolderType(selectedFolder, 'spam') ||
      isFolderType(selectedFolder, 'archive'));

  const smtpMessagesQuery = useSmtpMessagesQuery(
    isSmtp && (!selectedFolder || !isSpecialFolder) ? mailboxId : null,
    currentPage || 1,
    PAGE_SIZE,
    selectedFolder?.name || 'INBOX',
  );

  const smtpSentQuery = useSmtpSentMessagesQuery(
    isSmtp && isFolderType(selectedFolder, 'sent') ? mailboxId : null,
    currentPage || 1,
    PAGE_SIZE,
  );

  const smtpDraftsQuery = useSmtpDraftMessagesQuery(
    isSmtp && isFolderType(selectedFolder, 'drafts') ? mailboxId : null,
    currentPage || 1,
    PAGE_SIZE,
  );

  const smtpTrashQuery = useSmtpTrashMessagesQuery(
    isSmtp && isFolderType(selectedFolder, 'trash') ? mailboxId : null,
    currentPage || 1,
    PAGE_SIZE,
  );

  const smtpSpamQuery = useSmtpSpamMessagesQuery(
    isSmtp && isFolderType(selectedFolder, 'spam') ? mailboxId : null,
    currentPage || 1,
    PAGE_SIZE,
  );

  const smtpArchiveQuery = useSmtpArchiveMessagesQuery(
    isSmtp && isFolderType(selectedFolder, 'archive') ? mailboxId : null,
    currentPage || 1,
    PAGE_SIZE,
  );

  const smtpFoldersQuery = useSmtpFoldersQuery(mailboxId);

  const currentSmtpMessageQuery = useSmtpMessageQuery(
    mailboxId,
    currentMessageId,
    selectedFolder?.name || 'INBOX',
  );

  const smtpAttachmentsQuery = useSmtpAttachmentsQuery(
    isSmtp && currentMessageId ? mailboxId : null,
    currentMessageId,
    selectedFolder?.name || 'INBOX',
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
