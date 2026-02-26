import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import { isFolderType } from '../utils/folder-utils';

const EmptyMessages = ({
  searchQuery,
  filterUnread,
  filterStarred,
  filterAttachments,
  selectedFolder,
}) => {
  const { t } = useTranslation();

  const getFolderName = (folder) => {
    if (isFolderType(folder, 'inbox')) return t('mailboxes.inbox');
    if (isFolderType(folder, 'sent')) return t('mailboxes.sent');
    if (isFolderType(folder, 'drafts')) return t('mailboxes.drafts');
    if (isFolderType(folder, 'trash')) return t('mailboxes.trash');
    if (isFolderType(folder, 'spam')) return t('mailboxes.spam');
    if (isFolderType(folder, 'archive')) return t('mailboxes.archive');
    if (isFolderType(folder, 'starred')) return t('mailboxes.starred');
    if (isFolderType(folder, 'important')) return t('mailboxes.important');
    return folder.name;
  };

  const getEmptyMessage = () => {
    if (searchQuery) return t('mailboxes.empty_search');
    if (filterUnread) return t('mailboxes.empty_unread');
    if (filterStarred) return t('mailboxes.empty_starred');
    if (filterAttachments) return t('mailboxes.empty_attachments');
    if (selectedFolder) return t('mailboxes.empty_folder', { name: getFolderName(selectedFolder) });
    return t('mailboxes.empty_inbox');
  };

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <Inbox className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-gray-500 font-medium">{t('mailboxes.no_messages')}</p>
      <p className="text-sm text-gray-400 mt-1">{getEmptyMessage()}</p>
    </div>
  );
};

export default EmptyMessages;
