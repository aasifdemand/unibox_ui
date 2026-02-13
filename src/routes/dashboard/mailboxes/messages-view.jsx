import { Loader2, Paperclip, Search, Star, X } from "lucide-react";
import Pagination from "./pagination";
import MessageListItem from "./messagelist-item";
import EmptyMessages from "./empty-messages";
import StatsCards from "./stats-cards";
import FolderTree from "./folder-tree";

const MessagesView = ({
  selectedMailbox,
  selectedFolder,
  folders,
  showStats,
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
    <div className="h-full flex flex-col">
      {/* Stats Cards */}
      {showStats && (
        <StatsCards
          mailbox={selectedMailbox}
          messages={filteredMessages}
          folders={folders}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages by subject, sender, or content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={onSearchClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>

          <button
            onClick={onFilterStarred}
            className={`px-4 py-2.5 rounded-lg flex items-center text-sm font-medium transition ${
              filterStarred
                ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Star
              className={`w-4 h-4 mr-2 ${filterStarred ? "fill-yellow-400" : ""}`}
            />
            Starred
          </button>

          <button
            onClick={onFilterAttachments}
            className={`px-4 py-2.5 rounded-lg flex items-center text-sm font-medium transition ${
              filterAttachments
                ? "bg-purple-100 text-purple-800 border border-purple-300"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Paperclip className="w-4 h-4 mr-2" />
            Attachments
          </button>
        </div>
      </div>

      {/* Main Content with Folders and Messages */}
      <div className="flex-1 flex min-h-0">
        {/* Folders Sidebar */}
        {folders.length > 0 && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto shrink-0">
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

        {/* Messages Grid/List */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {isLoadingMessages && filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
              <span className="text-gray-600">Loading messages...</span>
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
            <div
              className={`flex-1 overflow-y-auto p-4 ${
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : ""
              }`}
            >
              {filteredMessages.map((message) => (
                <MessageListItem
                  key={message.id || message.messageId || message.uid}
                  message={message}
                  isSelected={selectedMessages.includes(
                    message.id || message.messageId || message.uid,
                  )}
                  onSelect={onSelectMessage}
                  onCheck={onCheckMessage}
                  viewMode={viewMode}
                  formatDate={formatMessageDate}
                  getSender={getSender}
                  getSubject={getSubject}
                  getPreview={getPreview}
                  getInitials={getInitials}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredMessages.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
};
export default MessagesView;
