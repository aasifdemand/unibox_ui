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
  onBulkDelete,
  onClearSelection,
  onCompose,
  onSync,
  isSyncing,
  onFilterUnread,
  filterUnreadActive,
  onRefreshToken,
  showRefreshToken,
  onDisconnect,
}) => {
  return (
    <div className="flex items-center gap-3">
      {selectedMessages?.length > 0 ? (
        <div className="flex items-center gap-1.5 bg-blue-600 px-3 py-2 rounded-2xl shadow-lg shadow-blue-500/20 animate-in zoom-in duration-300">
          <div className="flex items-center justify-center bg-white/20 px-2.5 py-1 rounded-xl">
            <span className="text-xs font-black text-white">
              {selectedMessages.length}
            </span>
          </div>
          <div className="w-px h-4 bg-white/20 mx-1"></div>
          <button
            onClick={onBulkMarkRead}
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Mark as Read"
          >
            <MailCheck className="w-4 h-4" />
          </button>
          <button
            onClick={onBulkDelete}
            className="p-2 text-white/90 hover:text-rose-200 hover:bg-rose-500/20 rounded-xl transition-all"
            title="Delete Selected"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClearSelection}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Cancel"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={onCompose}
          className="group relative flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          <span>Compose</span>
        </button>
      )}

      {/* Action Group - Glassmorphism */}
      <div className="flex items-center p-1 bg-slate-100/50 rounded-2xl border border-slate-200/60 shadow-xs">
        <button
          onClick={onSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isSyncing
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
          />
          <span>{isSyncing ? "Syncing" : "Sync"}</span>
        </button>

        <button
          onClick={onFilterUnread}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            filterUnreadActive
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <MailQuestion className="w-3.5 h-3.5" />
          <span>Unread</span>
        </button>

        {showRefreshToken && (
          <button
            onClick={onRefreshToken}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Auth</span>
          </button>
        )}
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1"></div>

      <button
        onClick={onDisconnect}
        className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
        title="Disconnect Account"
      >
        <EyeOff className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
        <span className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-25 overflow-hidden transition-all duration-300">
          Disconnect
        </span>
      </button>
    </div>
  );
};

export default MessageActionsHeader;
