import { useTranslation } from 'react-i18next';
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
    if (!selectedFolder) return t('mailboxes.select_folder_prompt') || 'Please select a folder to view messages';
    if (selectedFolder) return t('mailboxes.empty_folder', { name: getFolderName(selectedFolder) });
    return t('mailboxes.empty_inbox');
  };

  const isSelectingFolder = !selectedFolder;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in duration-700">
      <div className="relative mb-10 w-full max-w-[360px] mx-auto">
        {/* Main Reference Replica Card - Slightly Smaller */}
        <div className="relative z-10 bg-white rounded-xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-48 overflow-visible">
          {/* Skeleton List Rows with "Subject" Header */}
          <div className="flex h-full">
            {/* Left "Subject" Header Stripe */}
            <div className="w-20 bg-zinc-50/50 border-r border-zinc-100 p-4 flex flex-col pt-6">
              <div className="h-3 bg-zinc-200/50 rounded w-full mb-1"></div>
              <div className="text-[10px] font-bold text-zinc-400 font-outfit uppercase tracking-tight">Subject</div>
            </div>
            
            {/* Right Message Content Skeleton */}
            <div className="flex-1 p-6 space-y-4 pt-10">
              <div className="h-2 bg-zinc-100 rounded w-full"></div>
              <div className="h-2 bg-zinc-100 rounded w-11/12 opacity-80"></div>
              <div className="h-2 bg-zinc-100 rounded w-full opacity-60"></div>
              <div className="h-2 bg-zinc-100 rounded w-4/5 opacity-40"></div>
              <div className="h-2 bg-zinc-100 rounded w-full opacity-20"></div>
            </div>
          </div>

          {/* Green Line Graph - Top Right Corner (Scaled down) */}
          <div className="absolute top-6 right-5">
            <svg width="80" height="40" viewBox="0 0 100 60" fill="none" className="drop-shadow-sm">
              <path 
                d="M5 45 L25 25 L45 35 L70 5 L90 15" 
                stroke="#10b981" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <circle cx="25" cy="25" r="4" fill="#10b981" />
              <circle cx="45" cy="35" r="4" fill="#10b981" />
              <circle cx="70" cy="5" r="4" fill="#10b981" />
              <circle cx="90" cy="15" r="4" fill="#10b981" />
            </svg>
          </div>

          {/* Yellow Envelope - Tilted and floating OUTSIDE the corner (Scaled down) */}
          <div className="absolute -bottom-6 -left-6 transform -rotate-12 z-20">
            <div className="relative w-16 h-12 bg-[#fbbf24] rounded-[2px] shadow-lg border-b-2 border-amber-500">
               {/* Envelope Flap Detail */}
               <svg viewBox="0 0 64 48" className="absolute inset-0 w-full h-full text-amber-600/30">
                 <path d="M0 0 L32 24 L64 0" stroke="currentColor" strokeWidth="2.5" fill="none" />
                 <path d="M0 48 L24 24" stroke="currentColor" strokeWidth="2" fill="none" />
                 <path d="M64 48 L40 24" stroke="currentColor" strokeWidth="2" fill="none" />
               </svg>
            </div>
          </div>
        </div>

        {/* Soft Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-purple-50/20 rounded-full blur-3xl z-0"></div>
      </div>

      {/* Primary Message Copy */}
      <div className="text-center relative z-10">
        <h2 className="text-lg font-bold text-zinc-900 mb-1.5 font-outfit">
          {isSelectingFolder ? "Your master inbox" : t('mailboxes.no_messages')}
        </h2>
        <p className="text-[13px] text-zinc-500 font-medium">
          {isSelectingFolder ? "To access the inbox, simply click on the folder." : getEmptyMessage()}
        </p>
      </div>
    </div>
  );
};

export default EmptyMessages;
