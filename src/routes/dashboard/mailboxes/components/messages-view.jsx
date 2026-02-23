import {
  ChevronRight,
  Loader2,
  Paperclip,
  Search,
  Star,
  X,
} from "lucide-react";
import Pagination from "./pagination";
import MessageListItem from "./messagelist-item";
import EmptyMessages from "./empty-messages";
import FolderTree from "./folder-tree";
import { getDisplayId, getMessageId } from "../utils/getmessage-id";

const MessagesView = ({
  selectedMailbox,
  selectedFolder,
  folders,
  filteredMessages,
  isLoadingMessages,
  viewMode,
  selectedMessages,
  onSelectFolder,
  folderLoading,
  showAllFolders,
  onToggleShowAllFolders,
  onSelectMessage,
  onCheckMessage,
  formatMessageDate,
  getSender,
  getSubject,
  getPreview,
  getInitials,
  searchQuery,
  onSearchChange,
  onSearchClear,
  dateRange,
  onDateRangeChange,
  filterStarred,
  onFilterStarred,
  filterAttachments,
  onFilterAttachments,
  filterUnread,
  pagination,
  onNextPage,
  onPrevPage,
  startMessageCount,
  endMessageCount,
  totalMessages,
}) => {
  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      {/* Search and Filters - Premium Toolbar */}
      <div className="bg-white px-6 py-4 border-b border-slate-200/60 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full mx-auto">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-all duration-300" />
            <input
              type="text"
              placeholder="Query sender, subject or intelligence keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-11 pr-11 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all outline-none shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={onSearchClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="relative shrink-0">
              <select
                value={dateRange}
                onChange={(e) => onDateRangeChange(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-xs focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all outline-none cursor-pointer"
              >
                <option value="all">TEMPORAL: ALL</option>
                <option value="today">TEMPORAL: TODAY</option>
                <option value="week">TEMPORAL: WEEK</option>
                <option value="month">TEMPORAL: MONTH</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 rotate-90 pointer-events-none" />
            </div>

            <button
              onClick={onFilterStarred}
              className={`px-5 py-3 rounded-2xl flex items-center text-[10px] font-black uppercase tracking-widest transition-all border shadow-xs active:scale-95 ${filterStarred
                ? "bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Star
                className={`w-3.5 h-3.5 mr-2 ${filterStarred ? "fill-white" : "text-slate-400"}`}
              />
              Starred
            </button>

            <button
              onClick={onFilterAttachments}
              className={`px-5 py-3 rounded-2xl flex items-center text-[10px] font-black uppercase tracking-widest transition-all border shadow-xs active:scale-95 ${filterAttachments
                ? "bg-purple-600 text-white border-purple-700 shadow-lg shadow-purple-500/20"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Paperclip
                className={`w-3.5 h-3.5 mr-2 ${filterAttachments ? "text-white" : "text-slate-400"}`}
              />
              Files
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Folders and Messages */}
      <div className="flex-1 flex min-h-0 w-full mx-auto">
        {/* Folders Sidebar - Premium Glass */}
        {folders.length > 0 && (
          <div className="w-72 bg-white/40 backdrop-blur-sm border-r border-slate-200/60 overflow-y-auto shrink-0 hidden lg:block">
            <FolderTree
              folders={folders}
              selectedFolder={selectedFolder}
              onSelectFolder={onSelectFolder}
              loading={folderLoading}
              showAll={showAllFolders}
              onToggleShowAll={onToggleShowAllFolders}
              type={selectedMailbox.type}
            />
          </div>
        )}

        {/* Messages List Area */}
        <div className="flex-1 flex flex-col bg-transparent overflow-hidden h-screen ">
          {/* Main List Body */}
          <div className="flex-1 min-h-0 relative flex flex-col">
            {isLoadingMessages && filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 px-6">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-6">
                  Indexing Messages...
                </span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <EmptyMessages
                searchQuery={searchQuery}
                filterUnread={filterUnread}
                filterStarred={filterStarred}
                filterAttachments={filterAttachments}
                selectedFolder={selectedFolder}
              />
            ) : (
              <div className="relative flex-1 flex flex-col overflow-hidden">
                {isLoadingMessages && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/40 backdrop-blur-[2px] transition-all duration-500">
                    <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-[2.5rem] shadow-2xl border border-white ring-1 ring-slate-200/50 animate-in zoom-in-95 duration-300">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
                        Updating Feed...
                      </p>
                    </div>
                  </div>
                )}
                <div
                  className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-3 ${viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0"
                    : ""
                    }`}
                >
                  {filteredMessages.map((message) => {
                    const isSentFolder =
                      selectedFolder?.id === "SENT" ||
                      selectedFolder?.id === "sentitems" ||
                      selectedFolder?.name === "SENT" ||
                      message.labelIds?.includes("SENT");

                    return (
                      <MessageListItem
                        key={getDisplayId(message, selectedMailbox?.type)}
                        message={message}
                        isSelected={selectedMessages.includes(
                          getMessageId(message, selectedMailbox?.type),
                        )}
                        onSelect={onSelectMessage}
                        onCheck={onCheckMessage}
                        viewMode={viewMode}
                        formatDate={formatMessageDate}
                        getSender={getSender}
                        getSubject={getSubject}
                        getPreview={getPreview}
                        getInitials={getInitials}
                        mailboxType={selectedMailbox?.type}
                        isSent={isSentFolder}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pagination - Bottom Bar (Always Fixed at bottom of the list area if paging info exists) */}
          {(totalMessages > 0 || (isLoadingMessages && pagination.currentPage > 1)) && (
            <div className="bg-white/50 backdrop-blur-md border-t border-slate-200/60 p-4">
              <Pagination
                currentPage={pagination.currentPage}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                isLoadingMessages={isLoadingMessages}
                onNextPage={onNextPage}
                onPrevPage={onPrevPage}
                startMessageCount={startMessageCount}
                endMessageCount={endMessageCount}
                totalMessages={totalMessages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesView;
