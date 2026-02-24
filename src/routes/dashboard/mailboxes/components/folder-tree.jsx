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
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleExpand = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const getFolderIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('inbox')) return <InboxIcon className="w-4 h-4" />;
    if (n.includes('sent')) return <SendIcon className="w-4 h-4" />;
    if (n.includes('draft')) return <File className="w-4 h-4" />;
    if (n.includes('spam') || n.includes('junk'))
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (n.includes('trash') || n.includes('bin') || n.includes('deleted'))
      return <Trash2 className="w-4 h-4 text-red-500" />;
    if (n.includes('archive')) return <Archive className="w-4 h-4" />;
    if (n.includes('star') || n.includes('important'))
      return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
    return <Folder className="w-4 h-4 text-slate-400" />;
  };

  const renderFolder = (folder, depth = 0) => {
    const isExpanded = expandedFolders[folder.id];
    const hasChildren = folder.childFolders?.length > 0;
    const isSelected = selectedFolder?.id === folder.id;

    return (
      <div key={folder.id}>
        <button
          onClick={() => onSelectFolder(folder)}
          className={`group w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 border border-transparent ${
            isSelected
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
          }`}
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
        >
          <span
            className={`w-5 h-5 mr-3 shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}
          >
            {getFolderIcon(folder.name)}
          </span>
          <span
            className={`text-sm truncate flex-1 text-left ${isSelected ? 'font-bold' : 'font-semibold'}`}
          >
            {folder.name}
          </span>
          {folder.unreadCount > 0 && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ml-2 shadow-xs border ${
                isSelected
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
              className={`ml-2 p-1 rounded-lg transition-colors ${isSelected ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-300 ${isSelected ? 'text-white' : 'text-slate-400'} ${
                  isExpanded ? 'rotate-90' : ''
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

    const systemOrder = {
      inbox: 1,
      sent: 2,
      drafts: 3,
      trash: 4,
      spam: 5,
      archive: 6,
      outbox: 7,
    };

    return [...folders].sort((a, b) => {
      const aName = a.name?.toLowerCase() || '';
      const bName = b.name?.toLowerCase() || '';
      const aOrder = systemOrder[aName] || 8;
      const bOrder = systemOrder[bName] || 8;

      if (aOrder !== bOrder) return aOrder - bOrder;
      return aName.localeCompare(bName);
    });
  }, [folders]);

  const inbox = sortedFolders.find((f) => f.name?.toLowerCase() === 'inbox');
  const otherFolders = sortedFolders.filter((f) => f.name?.toLowerCase() !== 'inbox');
  const displayedOtherFolders = showAll ? otherFolders : otherFolders.slice(0, 8);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 px-1">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Workspace {type}
        </h3>
        {otherFolders.length > 8 && (
          <button
            onClick={onToggleShowAll}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100/50 transition-all"
          >
            {showAll ? 'Collapse' : `+${otherFolders.length - 8} more`}
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
