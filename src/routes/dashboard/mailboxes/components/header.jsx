import {
  ChevronRight,
  Plus,
  RefreshCw,
  Reply,
  Send,
  Trash2,
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
            <>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="btn-secondary flex items-center py-2 px-4 shadow-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin text-blue-500" : "text-slate-400"}`}
                />
                <span className="text-sm">Refresh List</span>
              </button>

              <button
                onClick={() => setShowSenderModal(true)}
                className="btn-primary flex items-center py-2 px-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-sm">Add Mailbox</span>
              </button>
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
