import {
  ChevronRight,
  Plus,
  RefreshCw,
  Reply,
  Send,
  Trash2,
  Search,
  LayoutGrid,
  List,
  Filter,
  XCircle,
} from "lucide-react";
import MessageActionsHeader from "./messageactions-header";
import { useAudienceData } from "../../audience/hooks/use-audience-data";
import ShowSender from "../../../../modals/showsender";

const Header = ({
  view,
  selectedMailbox,
  selectedFolder,
  currentMessage,
  mailboxesCount,
  getFolderUnreadCount,
  filterUnread,
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
  mailboxViewMode,
  onToggleMailboxViewMode,
  mailboxSearch,
  onMailboxSearchChange,
  mailboxTypeFilter,
  onMailboxTypeChange,
  selectedSenderIds,
  onBulkSenderDelete,
  onClearSenderSelection,
}) => {
  const {
    senderType,
    smtpData,
    showSenderModal,
    setSenderType,
    setSmtpData,
    setShowSenderModal,
    handleGmailOAuth,
    handleOutlookOAuth,
    handleSmtpSubmit,
  } = useAudienceData();
  return (
    <div className="bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 px-4 md:px-8 py-5 sticky top-0 z-20 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full mx-auto">
        <div className="flex items-center gap-6">
          {view !== "list" && (
            <button
              onClick={onBack}
              className="group p-2.5 bg-slate-50 hover:bg-white rounded-2xl transition-all border border-slate-200 shadow-xs hover:shadow-md hover:-translate-x-0.5 active:translate-x-0 group"
              aria-label="Go back"
            >
              <ChevronRight className="w-5 h-5 text-slate-500 rotate-180 group-hover:text-blue-600 transition-colors" />
            </button>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {view === "list" && (
                  <>
                    Mail<span className="text-gradient">boxes</span>
                  </>
                )}
                {view === "messages" && (
                  <span className="truncate max-w-50 md:max-w-md">
                    {selectedFolder?.name ||
                      selectedMailbox?.displayName ||
                      "Inbox"}
                  </span>
                )}
                {view === "message" && "Conversation"}
              </h1>

              {view === "messages" && selectedMailbox && (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60 shadow-xs">
                    {selectedMailbox.email}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 font-sans">
              {view === "list" && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">
                    {mailboxesCount} CONNECTED ACCOUNTS
                  </span>
                </div>
              )}

              {view === "messages" && selectedMailbox && (
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {selectedFolder && (
                      <span className="px-3 py-1 bg-blue-50/50 text-blue-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border border-blue-100 shadow-xs">
                        {selectedFolder.name}
                      </span>
                    )}
                    {getFolderUnreadCount() > 0 && !filterUnread && (
                      <span className="px-3 py-1 bg-rose-50/50 text-rose-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border border-rose-100 shadow-xs animate-pulse">
                        {getFolderUnreadCount()} PRIORITY
                      </span>
                    )}
                    {filterUnread && (
                      <span className="px-3 py-1 bg-indigo-50/50 text-indigo-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border border-indigo-100 shadow-xs">
                        UNREAD FOCUS
                      </span>
                    )}
                  </div>

                  {totalMessages > 0 && (
                    <div className="flex items-center gap-2 ml-1">
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Displaying {startMessageCount}-{endMessageCount} of{" "}
                        {totalMessages.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {view === "message" && currentMessage && (
                <p className="text-xs font-bold text-slate-400 opacity-80 max-w-sm truncate italic">
                  Re: {getSubject(currentMessage)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {view === "list" && (
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/80">
              <div className="relative group flex items-center bg-slate-50/50 rounded-xl px-3 py-1.5 border border-slate-200/50 min-w-[200px] shadow-inner transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors shrink-0" />
                <input
                  type="text"
                  placeholder="Search mailboxes..."
                  value={mailboxSearch}
                  onChange={(e) => onMailboxSearchChange(e.target.value)}
                  className="w-full pl-2 bg-transparent text-sm font-bold placeholder:text-slate-400 focus:outline-none transition-all text-slate-700"
                />
              </div>

              <div className="h-6 w-px bg-slate-200/80 mx-1 shrink-0"></div>

              <div className="relative flex items-center min-w-[130px]">
                <Filter className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={mailboxTypeFilter}
                  onChange={(e) => onMailboxTypeChange(e.target.value)}
                  className="appearance-none w-full pl-9 pr-8 py-2 min-h-[36px] bg-slate-50/50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all cursor-pointer shadow-sm"
                >
                  <option value="all">ALL PROVIDERS</option>
                  <option value="gmail">GMAIL</option>
                  <option value="outlook">OUTLOOK</option>
                  <option value="smtp">SMTP</option>
                </select>
                <ChevronRight className="absolute right-3 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              <div className="h-6 w-px bg-slate-200/80 mx-1 shrink-0"></div>

              <div className="flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200/50 shadow-inner">
                <button
                  onClick={() => mailboxViewMode !== "grid" && onToggleMailboxViewMode()}
                  className={`p-1.5 rounded-lg transition-all ${mailboxViewMode === "grid"
                    ? "bg-white shadow-sm ring-1 ring-slate-200/50 text-blue-600"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                    }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => mailboxViewMode !== "list" && onToggleMailboxViewMode()}
                  className={`p-1.5 rounded-lg transition-all ${mailboxViewMode === "list"
                    ? "bg-white shadow-sm ring-1 ring-slate-200/50 text-blue-600"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                    }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-200/80 mx-1 shrink-0"></div>

              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 bg-slate-50/50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-all shadow-sm group"
                title="Refresh Mailboxes"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-500" : "text-slate-500 group-hover:text-blue-600"
                    }`}
                />
              </button>

              {selectedSenderIds?.length > 0 ? (
                <div className="flex items-center gap-1.5 bg-rose-600 px-3 py-1.5 rounded-xl shadow-lg shadow-rose-500/20 animate-in zoom-in duration-300">
                  <div className="flex items-center justify-center bg-white/20 px-2.5 py-1 rounded-lg">
                    <span className="text-[10px] font-black text-white">
                      {selectedSenderIds.length}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/20 mx-1"></div>
                  <button
                    onClick={onBulkSenderDelete}
                    className="flex items-center gap-2 px-3 py-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all text-[11px] font-black uppercase tracking-widest"
                    title="Delete Selected Mailboxes"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={onClearSenderSelection}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all ml-1"
                    title="Clear Selection"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSenderModal(true)}
                  className="btn-primary flex items-center py-2 px-4 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2 shrink-0" />
                  <span className="text-sm">Add Mailbox</span>
                </button>
              )}

              {/* Add Sender Modal */}
              {showSenderModal && (
                <ShowSender
                  setShowSenderModal={setShowSenderModal}
                  setSenderType={setSenderType}
                  senderType={senderType}
                  handleGmailOAuth={handleGmailOAuth}
                  handleOutlookOAuth={handleOutlookOAuth}
                  handleSmtpSubmit={handleSmtpSubmit}
                  smtpData={smtpData}
                  setSmtpData={setSmtpData}
                  isSubmitting={isLoading.creatingSender}
                />
              )}
            </div>
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
              onFilterUnread={onFilterUnread}
              filterUnreadActive={filterUnreadActive}
              onRefreshToken={onRefreshToken}
              showRefreshToken={showRefreshToken}
              onDisconnect={onDisconnect}
              mailboxType={mailboxType}
            />
          )}

          {view === "message" && showMessageActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={onReply}
                className="btn-secondary flex items-center py-2 px-4 text-sm"
              >
                <Reply className="w-4 h-4 mr-2 text-slate-400" />
                Reply
              </button>
              <button
                onClick={onForward}
                className="btn-secondary flex items-center py-2 px-4 text-sm"
              >
                <Send className="w-4 h-4 mr-2 text-slate-400" />
                Forward
              </button>
              <button
                onClick={onDeleteMessage}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-red-100 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;
