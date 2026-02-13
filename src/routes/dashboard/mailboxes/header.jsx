import {
  ChevronRight,
  Plus,
  RefreshCw,
  Reply,
  Send,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import MessageActionsHeader from "./messageactions-header";

const Header = ({
  view,
  selectedMailbox,
  selectedFolder,
  currentMessage,
  mailboxesCount,
  getFolderUnreadCount,
  filterUnread,
  filterStarred,
  filterAttachments,
  totalMessages,
  startMessageCount,
  endMessageCount,
  getSubject,
  onBack,
  onRefresh,
  isLoading,
  onCompose,
  onSync,
  isSyncing,
  viewMode,
  onViewModeChange,
  showStats,
  onShowStatsChange,
  onFilterUnread,
  filterUnreadActive,
  onRefreshToken,
  showRefreshToken,
  onDisconnect,
  selectedMessages,
  onBulkMarkRead,
  onBulkMarkUnread,
  onBulkDelete,
  onClearSelection,
  mailboxType,
  onReply,
  onForward,
  onDeleteMessage,
  showMessageActions,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {view !== "list" && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Go back"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
            </button>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {view === "list" && "Mailboxes"}
              {view === "messages" &&
                (selectedFolder?.name ||
                  selectedMailbox?.displayName ||
                  "Messages")}
              {view === "message" && "Message"}
            </h1>

            <p className="text-sm text-gray-600 mt-1 flex items-center flex-wrap gap-2">
              {view === "list" && `${mailboxesCount} connected`}

              {view === "messages" && selectedMailbox && (
                <>
                  <span className="text-gray-500">{selectedMailbox.email}</span>
                  {selectedFolder && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {selectedFolder.name}
                    </span>
                  )}
                  {!selectedFolder &&
                    getFolderUnreadCount() > 0 &&
                    !filterUnread && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {getFolderUnreadCount()} unread
                      </span>
                    )}
                  {filterUnread && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Unread only
                    </span>
                  )}
                  {filterStarred && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Starred
                    </span>
                  )}
                  {filterAttachments && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      With attachments
                    </span>
                  )}
                  {totalMessages > 0 && (
                    <span className="text-gray-400 text-xs">
                      {startMessageCount}-{endMessageCount} of {totalMessages}
                    </span>
                  )}
                </>
              )}

              {view === "message" && currentMessage && (
                <span className="truncate max-w-md text-gray-500">
                  {getSubject(currentMessage)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {view === "list" && (
            <>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center text-sm font-medium transition"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <Link to="/dashboard/audience">
                <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center text-sm font-medium transition">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </Link>
            </>
          )}

          {view === "messages" && selectedMailbox && (
            <MessageActionsHeader
              selectedMessages={selectedMessages}
              onBulkMarkRead={onBulkMarkRead}
              onBulkMarkUnread={onBulkMarkUnread}
              onBulkDelete={onBulkDelete}
              onClearSelection={onClearSelection}
              onCompose={onCompose}
              onSync={onSync}
              isSyncing={isSyncing}
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              showStats={showStats}
              onShowStatsChange={onShowStatsChange}
              onFilterUnread={onFilterUnread}
              filterUnreadActive={filterUnreadActive}
              onRefreshToken={onRefreshToken}
              showRefreshToken={showRefreshToken}
              onDisconnect={onDisconnect}
              mailboxType={mailboxType}
            />
          )}

          {view === "message" && showMessageActions && (
            <>
              <button
                onClick={onReply}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center text-sm font-medium transition"
              >
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </button>
              <button
                onClick={onForward}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center text-sm font-medium transition"
              >
                <Send className="w-4 h-4 mr-2" />
                Forward
              </button>
              <button
                onClick={onDeleteMessage}
                className="px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 rounded-lg flex items-center text-sm font-medium transition"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;
