import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Archive,
  ChevronRight,
  File,
  Folder,
  InboxIcon,
  SendIcon,
  Star,
  Trash2,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { isFolderType } from '../utils/folder-utils';

// ============================================================================
// FOLDER TREE COMPONENT
// ============================================================================

const FolderTree = ({
  folders,
  selectedFolder,
  onSelectFolder,
  showAll,
  onToggleShowAll,
  type = 'gmail',
}) => {
  const { t } = useTranslation();
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleExpand = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const getFolderIcon = (folder) => {
    if (isFolderType(folder, 'inbox')) return <InboxIcon className="w-4 h-4" />;
    if (isFolderType(folder, 'sent')) return <SendIcon className="w-4 h-4" />;
    if (isFolderType(folder, 'drafts')) return <File className="w-4 h-4" />;
    if (isFolderType(folder, 'spam'))
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (isFolderType(folder, 'trash'))
      return <Trash2 className="w-4 h-4 text-red-500" />;
    if (isFolderType(folder, 'archive')) return <Archive className="w-4 h-4" />;
    if (isFolderType(folder, 'starred') || isFolderType(folder, 'important'))
      return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
    return <Folder className="w-4 h-4 text-slate-400" />;
  };

  const getFolderName = (folder) => {
    if (isFolderType(folder, 'inbox')) return t('mailboxes.inbox');
    if (isFolderType(folder, 'sent')) return t('mailboxes.sent');
    if (isFolderType(folder, 'drafts')) return t('mailboxes.drafts');
    if (isFolderType(folder, 'trash')) return t('mailboxes.trash');
    if (isFolderType(folder, 'spam')) return t('mailboxes.spam');
    if (isFolderType(folder, 'archive')) return t('mailboxes.archive');
    if (isFolderType(folder, 'starred')) return t('mailboxes.starred');
    if (isFolderType(folder, 'important')) return t('mailboxes.important');
    if (isFolderType(folder, 'category_personal')) return t('mailboxes.category_personal');
    if (isFolderType(folder, 'category_social')) return t('mailboxes.category_social');
    if (isFolderType(folder, 'category_promotions')) return t('mailboxes.category_promotions');
    if (isFolderType(folder, 'category_updates')) return t('mailboxes.category_updates');
    if (isFolderType(folder, 'category_forums')) return t('mailboxes.category_forums');
    if (isFolderType(folder, 'conversation_history')) return t('mailboxes.conversation_history');
    if (isFolderType(folder, 'rss_feeds')) return t('mailboxes.rss_feeds');
    return folder.name;
  };

  const renderFolder = (folder, depth = 0) => {
    const isExpanded = expandedFolders[folder.id];
    const hasChildren = folder.childFolders?.length > 0;
    const isSelected = selectedFolder?.id === folder.id;

    return (
      <div key={folder.id}>
        <button
          onClick={() => onSelectFolder(folder)}
          className={`group w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 border border-transparent ${isSelected
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
            }`}
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
        >
          <span
            className={`w-5 h-5 ltr:mr-3 rtl:ml-3 shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}
          >
            {getFolderIcon(folder)}
          </span>
          <span
            className={`text-sm truncate flex-1 ltr:text-left ltr:text-right rtl:text-left ${isSelected ? 'font-bold' : 'font-semibold'}`}
          >
            {getFolderName(folder)}
          </span>
          {folder.unreadCount > 0 && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ltr:ml-2 ltr:mr-2 rtl:ml-2 shadow-xs border ${isSelected
                ? 'bg-white/20 text-white border-white/20'
                : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}
            >
              {folder.unreadCount}
            </span>
          )}
          {hasChildren && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
              className={`ltr:ml-2 ltr:mr-2 rtl:ml-2 p-1 rounded-lg transition-colors ${isSelected ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-300 ${isSelected ? 'text-white' : 'text-slate-400'} ${isExpanded ? 'rotate-90' : ''
                  }`}
              />
            </div>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {folder.childFolders.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const sortedFolders = useMemo(() => {
    if (!Array.isArray(folders)) return [];

    const getSystemOrder = (folder) => {
      if (isFolderType(folder, 'inbox')) return 1;
      if (isFolderType(folder, 'sent')) return 2;
      if (isFolderType(folder, 'drafts')) return 3;
      if (isFolderType(folder, 'trash')) return 4;
      if (isFolderType(folder, 'spam')) return 5;
      if (isFolderType(folder, 'archive')) return 6;
      if (isFolderType(folder, 'outbox')) return 7;
      if (isFolderType(folder, 'important') || isFolderType(folder, 'starred')) return 8;
      return 99;
    };

    return [...folders].sort((a, b) => {
      const aOrder = getSystemOrder(a);
      const bOrder = getSystemOrder(b);

      if (aOrder !== bOrder) return aOrder - bOrder;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [folders]);

  const inbox = sortedFolders.find((f) => isFolderType(f, 'inbox'));
  const otherFolders = sortedFolders.filter((f) => !isFolderType(f, 'inbox'));
  const displayedOtherFolders = showAll ? otherFolders : otherFolders.slice(0, 8);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 px-1">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          {t('mailboxes.workspace')} {type}
        </h3>
        {otherFolders.length > 8 && (
          <button
            onClick={onToggleShowAll}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100/50 transition-all"
          >
            {showAll ? t('mailboxes.collapse') : t('mailboxes.more_folders', { count: otherFolders.length - 8 })}
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {inbox && renderFolder(inbox)}
        {displayedOtherFolders.map((folder) => renderFolder(folder))}
      </div>
    </div>
  );
};

export default FolderTree;
