import { useTranslation } from 'react-i18next';
import { EyeOff, MailCheck, MailQuestion, RefreshCw, Send, Trash2, XCircle } from 'lucide-react';

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
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      {selectedMessages?.length > 0 ? (
        <div className="flex items-center gap-1.5 bg-purple-600 px-3 py-2 rounded-lg shadow-sm shadow-purple-500/20 animate-in zoom-in duration-300">
          <div className="flex items-center justify-center bg-white/20 px-2.5 py-1 rounded-md">
            <span className="text-xs font-black text-white">{selectedMessages.length}</span>
          </div>
          <div className="w-px h-4 bg-white/20 mx-1"></div>
          <button
            onClick={onBulkMarkRead}
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-all"
            title={t('mailboxes.mark_as_read')}
          >
            <MailCheck className="w-4 h-4" />
          </button>
          <button
            onClick={onBulkDelete}
            className="p-2 text-white/90 hover:text-purple-200 hover:bg-purple-500/20 rounded-md transition-all"
            title={t('mailboxes.delete_selected')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClearSelection}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-all"
            title={t('mailboxes.cancel')}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={onCompose}
          className="btn-primary flex items-center gap-2 transition-all  relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -ltr:translate-x-full rtl:-translate-x-full group-hover:ltr:translate-x-full transition-transform duration-700"></div>
          <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          <span>{t('mailboxes.compose')}</span>
        </button>
      )}

      {/* Action Group - Glassmorphism */}
      <div className="flex items-center p-1 bg-slate-100/50 rounded-lg border border-slate-200/60 shadow-xs">
        <button
          onClick={onSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-4 py-3 rounded-md text-xs font-bold transition-all ${
            isSyncing
              ? 'bg-white text-purple-600 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? t('mailboxes.syncing') : t('mailboxes.sync')}</span>
        </button>

        <button
          onClick={onFilterUnread}
          className={`flex items-center gap-2 px-4 py-3 rounded-md text-xs font-bold transition-all ${
            filterUnreadActive
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MailQuestion className="w-3.5 h-3.5" />
          <span>{t('mailboxes.unread_label')}</span>
        </button>

        {showRefreshToken && (
          <button
            onClick={onRefreshToken}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('mailboxes.auth_label')}</span>
          </button>
        )}
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1"></div>

      <button
        onClick={onDisconnect}
        className="group flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-transparent hover:border-purple-100"
        title={t('mailboxes.disconnect_account')}
      >
        <EyeOff className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
        <span className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-25 overflow-hidden transition-all duration-300">
          {t('mailboxes.disconnect')}
        </span>
      </button>
    </div>
  );
};

export default MessageActionsHeader;
