import {
  BarChart3,
  EyeOff,
  Grid,
  List,
  MailCheck,
  MailQuestion,
  RefreshCw,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";

const MessageActionsHeader = ({
  selectedMessages,
  onBulkMarkRead,
  onBulkMarkUnread,
  onBulkDelete,
  onClearSelection,
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
  mailboxType,
}) => {
  return (
    <>
      {selectedMessages?.length > 0 ? (
        <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1.5 rounded-lg">
          <span className="text-sm font-medium text-blue-700 mr-1">
            {selectedMessages.length}
          </span>
          <button
            onClick={onBulkMarkRead}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
            title="Mark as read"
          >
            <MailCheck className="w-4 h-4" />
          </button>
          {mailboxType === "smtp" && (
            <button
              onClick={onBulkMarkUnread}
              className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition"
              title="Mark as unread"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onBulkDelete}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClearSelection}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition"
            title="Clear"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={onCompose}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center text-sm font-medium transition"
        >
          <Send className="w-4 h-4 mr-2" />
          Compose
        </button>
      )}

      <button
        onClick={onSync}
        disabled={isSyncing}
        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center text-sm font-medium transition disabled:opacity-50"
      >
        <RefreshCw
          className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
        />
        Sync
      </button>

      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-2 ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          title="List view"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("grid")}
          className={`px-3 py-2 ${
            viewMode === "grid"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          title="Grid view"
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={() => onShowStatsChange(!showStats)}
        className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition ${
          showStats
            ? "bg-blue-600 text-white"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        Stats
      </button>

      <button
        onClick={onFilterUnread}
        className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition ${
          filterUnreadActive
            ? "bg-blue-600 text-white"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <MailQuestion className="w-4 h-4 mr-2" />
        Unread
      </button>

      {showRefreshToken && (
        <button
          onClick={onRefreshToken}
          className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center text-sm font-medium transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Token
        </button>
      )}

      <button
        onClick={onDisconnect}
        className="px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 rounded-lg flex items-center text-sm font-medium transition"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Disconnect
      </button>
    </>
  );
};

export default MessageActionsHeader;
