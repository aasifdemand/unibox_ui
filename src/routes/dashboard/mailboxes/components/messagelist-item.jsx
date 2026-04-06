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
        className={`premium-card p-5 group cursor-pointer relative overflow-hidden flex flex-col h-full bg-white transition-all duration-300 ${
          isSelected ? 'ring-2 ring-purple-500 bg-purple-50/20' : 'hover:bg-slate-50/50'
        }`}
        dir="auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="relative group/check">
            <div
              className={`w-12 h-12 rounded-lg bg-linear-to-br from-purple-500/10 to-purple-500/10 flex items-center justify-center text-purple-600 font-bold text-lg border border-purple-100/50 shadow-inner group-hover:scale-110 transition-transform duration-300 ${
                !isRead ? 'ring-2 ring-purple-500/20' : ''
              }`}
            >
              {getInitials(sender.name)}
            </div>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheck}
              onClick={(e) => e.stopPropagation()}
              className="absolute -ltr:right-1.5 rtl:left-1.5 -top-1.5 w-4 h-4 text-purple-600 rounded-md border-slate-200 focus:ring-purple-500 shadow-sm transition-opacity opacity-0 group-hover/check:opacity-100"
            />
          </div>
          <span className="text-metadata px-2 py-0.5 rounded-md border border-slate-100 bg-slate-50">
            {formatDate(message)}
          </span>
        </div>

        <div className="flex-1">
          <p
            className={`text-sender truncate transition-colors ${
              !isRead ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {displayPrefix}
            {sender.name}
          </p>
          <p
            className={`text-subject truncate mt-1 ${
              !isRead ? 'text-slate-900' : 'text-slate-700 font-medium'
            }`}
          >
            {getSubject(message)}
          </p>
          <p className="text-preview line-clamp-2 mt-2">
            {getPreview(message)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50 relative z-10">
          <div className="flex items-center space-x-2">
            {hasAttachments && <Paperclip className="w-3.5 h-3.5 text-slate-400" />}
            {message.isStarred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
            {!isRead && (
              <div className="text-metadata px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-100 italic">
                {t('mailboxes.new_badge')}
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.info('Actions drawer coming soon');
            }}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
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
      className={`group flex items-center px-6 py-4 hover:bg-slate-50/80 rounded-xl cursor-pointer transition-all duration-300 border border-transparent ${
        !isRead ? 'bg-white shadow-sm ring-1 ring-slate-100' : ''
      } ${isSelected ? 'bg-purple-50/50 border-purple-200 ring-2 ring-purple-500/10' : ''}`}
    >
      <div className="flex items-center ltr:mr-4 rtl:ml-4 shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheck}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-purple-600 rounded-md border-slate-300 focus:ring-purple-500 shadow-sm transition-all"
        />
      </div>

      <div dir="auto" className="flex-1 min-w-0 flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0 shadow-inner group-hover:scale-105 transition-transform ${
            !isRead ? 'bg-purple-600 text-white border-purple-700' : ''
          }`}
        >
          {getInitials(sender.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p
                className={`text-sender truncate ${!isRead ? 'text-slate-900' : 'text-slate-600 font-medium'}`}
              >
                {displayPrefix}
                {sender.name}
              </p>
              {!isRead && (
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              )}
            </div>
            <p className="text-metadata shrink-0">
              {formatDate(message)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 mt-0.5">
            <p
              className={`text-subject truncate flex-1 ${!isRead ? 'text-slate-900' : 'font-medium text-slate-500'}`}
            >
              {getSubject(message)}
              <span className="mx-2 font-normal text-slate-300">|</span>
              <span className="text-preview italic opacity-70">{getPreview(message)}</span>
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {hasAttachments && <Paperclip className="w-3 h-3 text-slate-300" />}
              {message.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageListItem;
