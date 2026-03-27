import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  Plus,
  RefreshCw,
  Reply,
  Send,
  Trash2,
  Search,
  Filter,
  XCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Paperclip,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import MessageActionsHeader from './messageactions-header';
import ShowSender from '../../../../modals/showsender';
import {
  useCreateSmtpSender,
  initiateGmailOAuth,
  initiateOutlookOAuth,
} from '../../../../hooks/useSenders';
import FilterDropdown from '../../../../components/ui/filter-dropdown';

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
              className="p-2 hover:bg-slate-100 rounded-md transition-all text-slate-400 hover:text-orange-600 active:scale-90"
              aria-label="Go back"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {view === 'list' && (
                  <>
                    {t('mailboxes.mail')}
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
                    {composeType === 'reply'
                      ? t('mailboxes.reply')
                      : composeType === 'forward'
                        ? t('mailboxes.forward')
                        : t('mailboxes.new_message')}
                  </span>
                )}
              </h1>

              {view === 'messages' && selectedMailbox && (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60 shadow-xs">
                    {selectedMailbox.email}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 font-sans">
              {view === 'list' && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                    {t('mailboxes.connected_accounts', { count: mailboxesCount })}
                  </p>
                </div>
              )}

              {view === 'messages' && selectedMailbox && (
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {selectedFolder && (
                      <span className="px-3 py-1 bg-orange-50/50 text-orange-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border border-orange-100 shadow-xs">
                        {selectedFolder.name}
                      </span>
                    )}
                    {getFolderUnreadCount() > 0 && !filterUnread && (
                      <span className="px-3 py-1 bg-orange-50/50 text-orange-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border border-orange-100 shadow-xs animate-pulse">
                        {getFolderUnreadCount()} {t('mailboxes.priority')}
                      </span>
                    )}
                    {filterUnread && (
                      <span className="px-3 py-1 bg-orange-50/50 text-orange-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border border-orange-100 shadow-xs">
                        {t('mailboxes.unread_focus')}
                      </span>
                    )}
                  </div>

                  {totalMessages > 0 && (
                    <div className="flex items-center gap-2 mx-1">
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {t('mailboxes.displaying_count', {
                          start: startMessageCount,
                          end: endMessageCount,
                          total: totalMessages.toLocaleString(),
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {view === 'message' && currentMessage && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-orange-500/50"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t('mailboxes.viewing_conversation')}
                  </p>
                </div>
              )}

              {view === 'compose' && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-orange-500/50"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {selectedMailbox?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          {view === 'list' && (
            <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full">
              <FilterDropdown
                badgeCount={(mailboxSearch ? 1 : 0) + (mailboxTypeFilter !== 'all' ? 1 : 0)}
              >
                <div className="relative group flex items-center bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 w-full focus-within:ring-2 focus-within:ring-orange-500/10 focus-within:border-orange-500/40 focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
                  <input
                    type="text"
                    placeholder={t('mailboxes.search_mailboxes')}
                    value={mailboxSearch}
                    onChange={(e) => onMailboxSearchChange(e.target.value)}
                    className="w-full px-3 bg-transparent text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 focus:outline-none text-slate-700"
                  />
                </div>

                {/* Mailbox Type Filter Dropdown */}
                <div className="flex flex-col gap-1 w-full bg-slate-50 p-2 rounded-md border border-slate-100 mt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 flex items-center gap-2">
                    <Filter className="w-3 h-3" />
                    {t('mailboxes.provider_filter', 'Provider')}
                  </label>
                  <div className="flex flex-col gap-0.5 max-h-[40vh] overflow-y-auto">
                    {[
                      { value: 'all', label: t('mailboxes.all_providers') },
                      { value: 'gmail', label: t('mailboxes.gmail_provider') },
                      { value: 'outlook', label: t('mailboxes.outlook_provider') },
                      { value: 'smtp', label: t('mailboxes.smtp_provider') },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onMailboxTypeChange(option.value)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left w-full group ${
                          (option.value === 'all' &&
                            (!mailboxTypeFilter || mailboxTypeFilter.length === 0)) ||
                          (Array.isArray(mailboxTypeFilter) &&
                            mailboxTypeFilter.includes(option.value))
                            ? 'bg-orange-50 text-orange-700'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all shrink-0 ${
                            (option.value === 'all' &&
                              (!mailboxTypeFilter || mailboxTypeFilter.length === 0)) ||
                            (Array.isArray(mailboxTypeFilter) &&
                              mailboxTypeFilter.includes(option.value))
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-300 bg-white group-hover:border-orange-300 text-transparent'
                          }`}
                        >
                          <CheckCircle className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest truncate">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </FilterDropdown>

              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 transition-all shadow-xs group"
                title="Refresh Mailboxes"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    isLoading
                      ? 'animate-spin text-orange-500'
                      : 'text-slate-500 group-hover:text-orange-600'
                  }`}
                />
              </button>

              {selectedSenderIds?.length > 0 ? (
                <div className="flex items-center gap-1.5 bg-orange-600 px-3 py-1.5 rounded-md shadow-sm shadow-orange-500/20 animate-in zoom-in duration-300">
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
                  className="btn-primary flex items-center py-3 px-8 whitespace-nowrap shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
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
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-bold transition-all border border-red-100 flex items-center"
              >
                <Trash2 className="w-4 h-4 me-2" />
                {t('mailboxes.delete')}
              </button>
            </div>
          )}

          {view === 'compose' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 mr-2">
                <button
                  onClick={onAttach}
                  className="p-2 text-slate-500 hover:bg-white hover:text-orange-600 rounded-md transition-all hover:shadow-sm"
                  title={t('mailboxes.attach_file')}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={onAttachImage}
                  className="p-2 text-slate-500 hover:bg-white hover:text-orange-600 rounded-md transition-all hover:shadow-sm"
                  title={t('mailboxes.attach_image')}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <button
                  onClick={onTogglePreview}
                  className={`p-2 rounded-md transition-all ${
                    showPreview
                      ? 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200'
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
                className={`flex items-center gap-2 px-8 py-2.5 rounded-md text-sm font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                  isSending
                    ? 'bg-orange-400 cursor-not-allowed text-white/50'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20 shadow-sm'
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
