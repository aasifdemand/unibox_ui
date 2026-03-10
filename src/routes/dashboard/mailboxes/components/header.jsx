import { useTranslation } from 'react-i18next';
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
  Eye,
  EyeOff,
  Image as ImageIcon,
  Paperclip,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import MessageActionsHeader from './messageactions-header';
import ShowSender from '../../../../modals/showsender';
import {
  useCreateSmtpSender,
  initiateGmailOAuth,
  initiateOutlookOAuth
} from '../../../../hooks/useSenders';

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
  // Compose Props
  onSendCompose,
  onSaveDraft,
  isSending,
  composeType, // 'new', 'reply', 'forward'
  onTogglePreview,
  showPreview,
  onAttach,
  onAttachImage,
}) => {
  const { t } = useTranslation();
  const createSmtpSender = useCreateSmtpSender();

  const [showSenderModal, setShowSenderModal] = useState(false);
  const [senderType, setSenderType] = useState('gmail');
  const [smtpData, setSmtpData] = useState({
    displayName: '',
    email: '',
    host: '',
    port: '587',
    username: '',
    password: '',
    secure: true,
    imapHost: '',
    imapPort: '993',
    imapSecure: true,
    imapUser: '',
    imapPassword: '',
    provider: 'custom',
  });

  const handleGmailOAuth = () => initiateGmailOAuth();
  const handleOutlookOAuth = () => initiateOutlookOAuth();

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();

    const formData = { ...smtpData };
    if (!formData.imapHost && formData.host) {
      formData.imapHost = formData.host.replace('smtp', 'imap');
    }
    if (!formData.imapUser) {
      formData.imapUser = formData.username;
    }
    if (!formData.imapPassword) {
      formData.imapPassword = formData.password;
    }

    try {
      await createSmtpSender.mutateAsync(formData);
      setShowSenderModal(false);
      setSmtpData({
        displayName: '', email: '', host: '', port: '587', username: '', password: '',
        secure: true, imapHost: '', imapPort: '993', imapSecure: true, imapUser: '',
        imapPassword: '', provider: 'custom',
      });
      toast.success(t('campaigns.msg_smtp_success'));
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(t('campaigns.msg_smtp_failed', { message: error.message }));
    }
  };
  return (
    <div className="w-full px-4 md:px-8 mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full mx-auto">
        <div className="flex items-center gap-6">
          {view !== 'list' && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-blue-600 active:scale-90"
              aria-label="Go back"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {view === 'list' && (
                  <>
                    {t('mailboxes.mail')} <span className="text-gradient ms-3 me-3">{t('mailboxes.subtitle')}</span>
                  </>
                )}
                {view === 'messages' && (
                  <span className="truncate max-w-50 md:max-w-md">
                    {selectedFolder?.name || selectedMailbox?.displayName || 'Inbox'}
                  </span>
                )}
                {view === 'message' && (
                  <span className="truncate max-w-sm md:max-w-xl">
                    {getSubject(currentMessage)}
                  </span>
                )}
                {view === 'compose' && (
                  <span>
                    {composeType === 'reply' ? t('mailboxes.reply') : composeType === 'forward' ? t('mailboxes.forward') : t('mailboxes.new_message')}
                  </span>
                )}
              </h1>

              {view === 'messages' && selectedMailbox && (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60 shadow-xs">
                    {selectedMailbox.email}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 font-sans">
              {view === 'list' && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                    {t('mailboxes.connected_accounts', { count: mailboxesCount })}
                  </p>
                </div>
              )}

              {view === 'messages' && selectedMailbox && (
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {selectedFolder && (
                      <span className="px-3 py-1 bg-blue-50/50 text-blue-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border border-blue-100 shadow-xs">
                        {selectedFolder.name}
                      </span>
                    )}
                    {getFolderUnreadCount() > 0 && !filterUnread && (
                      <span className="px-3 py-1 bg-rose-50/50 text-rose-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border border-rose-100 shadow-xs animate-pulse">
                        {getFolderUnreadCount()} {t('mailboxes.priority')}
                      </span>
                    )}
                    {filterUnread && (
                      <span className="px-3 py-1 bg-indigo-50/50 text-indigo-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border border-indigo-100 shadow-xs">
                        {t('mailboxes.unread_focus')}
                      </span>
                    )}
                  </div>

                  {totalMessages > 0 && (
                    <div className="flex items-center gap-2 mx-1">
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {t('mailboxes.displaying_count', { start: startMessageCount, end: endMessageCount, total: totalMessages.toLocaleString() })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {view === 'message' && currentMessage && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500/50"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t('mailboxes.viewing_conversation')}
                  </p>
                </div>
              )}

              {view === 'compose' && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500/50"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {selectedMailbox?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {view === 'list' && (
            <div className="flex items-center gap-3">
              <div className="relative group flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-60 transition-all focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500/40 focus-within:bg-white">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors shrink-0" />
                <input
                  type="text"
                  placeholder={t('mailboxes.search_mailboxes')}
                  value={mailboxSearch}
                  onChange={(e) => onMailboxSearchChange(e.target.value)}
                  className="w-full px-3 bg-transparent text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 focus:outline-none text-slate-700"
                />
              </div>

              <div className="relative flex items-center min-w-40 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500/40 focus-within:bg-white transition-all shadow-xs">
                <Filter className="w-4 h-4 text-slate-400 ms-4 shrink-0 pointer-events-none" />
                <select
                  value={mailboxTypeFilter}
                  onChange={(e) => onMailboxTypeChange(e.target.value)}
                  className="appearance-none w-full ps-2 pe-10 py-3 bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="all">{t('mailboxes.all_providers')}</option>
                  <option value="gmail">{t('mailboxes.gmail_provider')}</option>
                  <option value="outlook">{t('mailboxes.outlook_provider')}</option>
                  <option value="smtp">{t('mailboxes.smtp_provider')}</option>
                </select>
                <ChevronRight className="absolute right-4 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                <button
                  onClick={() => mailboxViewMode !== 'grid' && onToggleMailboxViewMode()}
                  className={`p-2 rounded-xl transition-all ${mailboxViewMode === 'grid'
                    ? 'bg-white shadow-sm ring-1 ring-slate-200 text-blue-600'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                    }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => mailboxViewMode !== 'list' && onToggleMailboxViewMode()}
                  className={`p-2 rounded-xl transition-all ${mailboxViewMode === 'list'
                    ? 'bg-white shadow-sm ring-1 ring-slate-200 text-blue-600'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                    }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-3 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition-all shadow-xs group"
                title="Refresh Mailboxes"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading
                    ? 'animate-spin text-blue-500'
                    : 'text-slate-500 group-hover:text-blue-600'
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
                    title={t('mailboxes.delete_selected_mailboxes')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('mailboxes.delete')}</span>
                  </button>
                  <button
                    onClick={onClearSenderSelection}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all mx-1"
                    title="Clear Selection"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSenderModal(true)}
                  className="btn-primary flex items-center py-3 px-8 whitespace-nowrap shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 me-2 shrink-0" />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">
                    {t('mailboxes.add_mailbox')}
                  </span>
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
                  isSubmitting={createSmtpSender.isPending}
                />
              )}
            </div>
          )}

          {view === 'messages' && selectedMailbox && (
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

          {view === 'message' && showMessageActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={onReply}
                className="btn-secondary flex items-center py-2 px-4 text-sm"
              >
                <Reply className="w-4 h-4 me-2 text-slate-400" />
                {t('mailboxes.reply')}
              </button>
              <button
                onClick={onForward}
                className="btn-secondary flex items-center py-2 px-4 text-sm"
              >
                <Send className="w-4 h-4 me-2 text-slate-400" />
                {t('mailboxes.forward')}
              </button>
              <button
                onClick={onDeleteMessage}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-red-100 flex items-center"
              >
                <Trash2 className="w-4 h-4 me-2" />
                {t('mailboxes.delete')}
              </button>
            </div>
          )}

          {view === 'compose' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200 mr-2">
                <button
                  onClick={onAttach}
                  className="p-2 text-slate-500 hover:bg-white hover:text-blue-600 rounded-xl transition-all hover:shadow-sm"
                  title={t('mailboxes.attach_file')}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={onAttachImage}
                  className="p-2 text-slate-500 hover:bg-white hover:text-blue-600 rounded-xl transition-all hover:shadow-sm"
                  title={t('mailboxes.attach_image')}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <button
                  onClick={onTogglePreview}
                  className={`p-2 rounded-xl transition-all ${showPreview
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                    }`}
                  title={showPreview ? t('mailboxes.hide_preview') : t('mailboxes.show_preview')}
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={onSaveDraft}
                className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {t('mailboxes.save_draft')}
              </button>
              <button
                onClick={onSendCompose}
                disabled={isSending}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isSending
                  ? 'bg-blue-400 cursor-not-allowed text-white/50'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 shadow-lg'
                  }`}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('mailboxes.sending_label')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('mailboxes.send_label')}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Header;
