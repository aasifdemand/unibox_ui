import { useTranslation } from 'react-i18next';
import { MoreVertical, Paperclip, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMessageId } from '../utils/getmessage-id';

const MessageListItem = ({
  message,
  isSelected,
  onCheck,
  onSelect,
  viewMode = 'list',
  formatDate,
  getSender,
  getSubject,
  getPreview,
  getInitials,
  mailboxType,
  isSent,
}) => {
  const { t } = useTranslation();
  // Get the real message ID
  const realMessageId = getMessageId(message, mailboxType);

  const isRead = message.isRead || !message.unread;
  const sender = getSender(message, isSent);
  const hasAttachments = message.hasAttachments || message.attachmentCount > 0;
  const displayPrefix = isSent ? t('mailboxes.prefix_to') : '';

  const handleCheck = (e) => {
    e.stopPropagation();
    if (realMessageId) {
      onCheck(realMessageId, e.target.checked);
    } else {
      console.error('No valid message ID found', message);
      toast.error('Cannot select message: Invalid ID');
    }
  };

  const handleSelect = () => {
    if (realMessageId) {
      onSelect(message); // Pass the whole message, the handler will extract ID
    } else {
      console.error('No valid message ID found', message);
      toast.error('Cannot open message: Invalid ID');
    }
  };

  if (viewMode === 'grid') {
    return (
      <div
        onClick={handleSelect}
        className={`premium-card p-5 group cursor-pointer relative overflow-hidden flex flex-col h-full bg-white transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/20' : 'hover:bg-slate-50/50'
          }`}
        dir="auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="relative group/check">
            <div
              className={`w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100/50 shadow-inner group-hover:scale-110 transition-transform duration-300 ${!isRead ? 'ring-2 ring-blue-500/20' : ''
                }`}
            >
              {getInitials(sender.name)}
            </div>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheck}
              onClick={(e) => e.stopPropagation()}
              className="absolute -ltr:right-1.5 rtl:left-1.5 -top-1.5 w-4 h-4 text-blue-600 rounded-md border-slate-200 focus:ring-blue-500 shadow-sm transition-opacity opacity-0 group-hover/check:opacity-100"
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
            {formatDate(message)}
          </span>
        </div>

        <div className="flex-1">
          <p
            className={`text-sm font-bold truncate transition-colors ${!isRead ? 'text-slate-800' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            {displayPrefix}
            {sender.name}
          </p>
          <p
            className={`text-sm font-extrabold truncate mt-1 tracking-tight ${!isRead ? 'text-slate-800' : 'text-slate-700'
              }`}
          >
            {getSubject(message)}
          </p>
          <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-2 leading-relaxed opacity-80">
            {getPreview(message)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50 relative z-10">
          <div className="flex items-center space-x-2">
            {hasAttachments && <Paperclip className="w-3.5 h-3.5 text-slate-400" />}
            {message.isStarred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
            {!isRead && (
              <div className="flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-widest border border-blue-100">
                {t('mailboxes.new_badge')}
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.info('Actions drawer coming soon');
            }}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleSelect}
      className={`group flex items-start p-4 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent ${!isRead ? 'bg-blue-50/40 border-blue-100/50' : 'hover:border-slate-100'
        } ${isSelected ? 'bg-blue-100/30 border-blue-200 ring-2 ring-blue-500/5' : ''}`}
    >
      <div className="flex items-center mt-1 ltr:mr-4 rtl:ml-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheck}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 shadow-sm transition-all"
        />
      </div>

      <div dir="auto" className="flex-1 min-w-0">
        <div className="flex items-center mb-1">
          <div
            className={`w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-600 font-bold text-sm ltr:mr-4 rtl:ml-4 shrink-0 border border-slate-200/50 shadow-inner group-hover:scale-105 transition-transform ${!isRead ? 'from-blue-100 to-blue-50 text-blue-600 border-blue-200' : ''
              }`}
          >
            {getInitials(sender.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm truncate font-bold tracking-tight ${!isRead ? 'text-slate-800' : 'text-slate-700'
                    }`}
                >
                  {displayPrefix}
                  {sender.name}
                </p>
                {message.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                {!isRead && (
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ltr:ml-4 ltr:mr-4 rtl:ml-4">
                {hasAttachments && <Paperclip className="w-3.5 h-3.5 text-slate-400" />}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {formatDate(message)}
                </p>
              </div>
            </div>

            <p
              className={`text-sm mt-0.5 truncate tracking-tight ${!isRead ? 'font-extrabold text-slate-800' : 'font-medium text-slate-600'
                }`}
            >
              {getSubject(message)}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-medium line-clamp-1 ltr:ml-14 ltr:mr-14 rtl:ml-14 opacity-80 leading-relaxed">
          {getPreview(message)}
        </p>

        {message.labels?.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 ltr:ml-14 ltr:mr-14 rtl:ml-14">
            {message.labels.slice(0, 3).map((label) => (
              <span
                key={label}
                className="px-2 py-0.5 bg-slate-100 text-slate-500 font-bold rounded-md text-[9px] uppercase tracking-widest border border-slate-200/50"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageListItem;
