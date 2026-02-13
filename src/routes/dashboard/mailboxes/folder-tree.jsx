import {
  AlertTriangle,
  Archive,
  ChevronRight,
  File,
  Folder,
  InboxIcon,
  Loader2,
  SendIcon,
  Star,
  Trash2,
} from "lucide-react";
import React, { useMemo, useState } from "react";

// ============================================================================
// FOLDER TREE COMPONENT
// ============================================================================

const FolderTree = ({
  folders,
  selectedFolder,
  onSelectFolder,
  showAll,
  onToggleShowAll,
  type = "gmail",
}) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleExpand = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const getFolderIcon = (name) => {
    const n = name?.toLowerCase() || "";
    if (n.includes("inbox")) return <InboxIcon className="w-4 h-4" />;
    if (n.includes("sent")) return <SendIcon className="w-4 h-4" />;
    if (n.includes("draft")) return <File className="w-4 h-4" />;
    if (n.includes("spam") || n.includes("junk"))
      return <AlertTriangle className="w-4 h-4" />;
    if (n.includes("trash") || n.includes("bin") || n.includes("deleted"))
      return <Trash2 className="w-4 h-4" />;
    if (n.includes("archive")) return <Archive className="w-4 h-4" />;
    if (n.includes("star") || n.includes("important"))
      return <Star className="w-4 h-4" />;
    return <Folder className="w-4 h-4" />;
  };

  const renderFolder = (folder, depth = 0) => {
    const isExpanded = expandedFolders[folder.id];
    const hasChildren = folder.childFolders?.length > 0;
    const isSelected = selectedFolder?.id === folder.id;

    return (
      <div key={folder.id}>
        <button
          onClick={() => onSelectFolder(folder)}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg transition ${
            isSelected
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "hover:bg-gray-50 text-gray-700"
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          <span className="w-5 h-5 mr-2 text-gray-400 shrink-0">
            {getFolderIcon(folder.name, type)}
          </span>
          <span className="text-sm truncate flex-1 text-left">
            {folder.name}
          </span>
          {folder.unreadCount > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {folder.unreadCount}
            </span>
          )}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
              className="ml-2 p-1 hover:bg-gray-200 rounded"
            >
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div>
            {folder.childFolders.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Sort folders: system folders first, then alphabetically
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
      const aName = a.name?.toLowerCase() || "";
      const bName = b.name?.toLowerCase() || "";
      const aOrder = systemOrder[aName] || 8;
      const bOrder = systemOrder[bName] || 8;

      if (aOrder !== bOrder) return aOrder - bOrder;
      return aName.localeCompare(bName);
    });
  }, [folders]);

  const inbox = sortedFolders.find((f) => f.name?.toLowerCase() === "inbox");
  const otherFolders = sortedFolders.filter(
    (f) => f.name?.toLowerCase() !== "inbox",
  );
  const displayedOtherFolders = showAll
    ? otherFolders
    : otherFolders.slice(0, 8);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {type === "gmail" ? "Labels" : "Folders"}
        </h3>
        {otherFolders.length > 8 && (
          <button
            onClick={onToggleShowAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? "Less" : `${otherFolders.length} more`}
          </button>
        )}
      </div>

      <div className="space-y-1">
        {/* Inbox */}
        {inbox && renderFolder(inbox)}

        {/* Other folders */}
        {displayedOtherFolders.map((folder) => renderFolder(folder))}
      </div>
    </div>
  );
};

export default FolderTree;
