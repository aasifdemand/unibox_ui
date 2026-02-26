import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  File,
  MoreVertical,
  Paperclip,
  Printer,
  Reply,
  Send,
  Star,
  Trash2,
} from 'lucide-react';
import { formatFileSize } from '../utils/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { getMessageId } from '../utils/getmessage-id';

const MessageDetailView = ({
  message,
  mailbox,
  onBack,
  onDelete,
  onReply,
  onForward,
  onMarkRead,
  onMarkUnread,
  onStar,
  onPrint,
  onDownload,
}) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const realMessageId = getMessageId(message, mailbox?.type);

  const getSenderInfo = (msg) => {
    let email = '',
      name = '';

    try {
      // Outlook format (from your API response)
      if (msg?.from?.emailAddress) {
        email = msg.from.emailAddress.address || '';
        name = msg.from.emailAddress.name || '';
      }
      // SMTP format (from your API response)
      else if (msg?.from && typeof msg.from === 'string') {
        // Parse "Nathaniel Pierce" <nathaniel.pierce@cubetvolt.info>
        const match = msg.from.match(/^(?:"?(.+?)"?\s*)?(?:<(.+?)>)?$/);
        if (match) {
          name = match[1] || '';
          email = match[2] || msg.from;
        }
        // If no match, use the whole string as email
        if (!email) {
          email = msg.from;
          name = email.split('@')[0];
        }
      }
      // Gmail format
      else if (msg?.payload?.headers) {
        const from = msg.payload.headers.find((h) => h.name === 'From')?.value || '';
        const match = from.match(/<([^>]+)>/);
        email = match ? match[1] : from;
        const nameMatch = from.match(/^([^<]+)/);
        name = nameMatch ? nameMatch[1].trim().replace(/"/g, '') : email.split('@')[0];
      }
      // Direct from string (fallback)
      else if (msg?.from) {
        email = msg.from;
        name = email.split('@')[0];
      }
    } catch (e) {
      console.error('Error parsing sender:', e);
    }

    // Clean up name
    if (name) {
      name = name.replace(/^["']|["']$/g, '').trim();
    }
    if (!name && email) {
      name = email.split('@')[0];
    }

    return { email, name };
  };

  const getRecipients = (msg) => {
    // SMTP format (from your API response)
    if (msg?.to) {
      // Parse comma-separated list
      return msg.to
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    // Outlook format
    if (msg?.toRecipients) {
      return msg.toRecipients.map((r) => r.emailAddress?.address).filter(Boolean);
    }
    // Gmail format
    if (msg?.payload?.headers) {
      const to = msg.payload.headers.find((h) => h.name === 'To')?.value || '';
      return to.split(',').map((t) => t.trim());
    }
    return [];
  };

  const getCcRecipients = (msg) => {
    // SMTP format (from your API response)
    if (msg?.cc) {
      return msg.cc
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    // Outlook format
    if (msg?.ccRecipients) {
      return msg.ccRecipients.map((r) => r.emailAddress?.address).filter(Boolean);
    }
    // Gmail format
    if (msg?.payload?.headers) {
      const cc = msg.payload.headers.find((h) => h.name === 'Cc')?.value || '';
      return cc.split(',').map((t) => t.trim());
    }
    return [];
  };

  const getSubject = (msg) => {
    if (msg?.subject) return msg.subject;
    if (msg?.payload?.headers) {
      return (
        msg.payload.headers.find((h) => h.name === 'Subject' || h.name === 'subject')?.value ||
        t('mailboxes.no_subject')
      );
    }
    return t('mailboxes.no_subject');
  };

  const getDate = (msg) => {
    if (msg?.date) return new Date(msg.date);
    if (msg?.receivedDateTime) return new Date(msg.receivedDateTime);
    if (msg?.internalDate) return new Date(parseInt(msg.internalDate, 10));
    return new Date();
  };

  const getAttachments = (msg) => {
    return msg?.attachments || [];
  };

  const sender = getSenderInfo(message);
  const recipients = getRecipients(message);
  const ccRecipients = getCcRecipients(message);
  const date = getDate(message);
  const attachments = getAttachments(message);

  const formatPlainText = (text) => {
    if (!text) return null;

    // Handle collapsed "On ... wrote:" patterns and other common reply headers
    // More flexible regex for different date formats and languages
    let processedText = text.replace(/([^\n])\s*(On\s+.*wrote:)/gi, '$1\n\n$2');
    // Ensure newlines before blockquotes
    processedText = processedText.replace(/([^\n])\s*(>)/g, '$1\n$2');

    const lines = processedText.split(/\r?\n/);
    const elements = [];
    let currentBlockquote = [];

    const flushBlockquote = () => {
      if (currentBlockquote.length > 0) {
        elements.push(
          <blockquote key={`bq-${elements.length}`} className="border-l-4 border-blue-200 pl-4 my-4 text-slate-500 italic bg-slate-50/50 py-3 rounded-r-2xl">
            {currentBlockquote.map((line, i) => (
              <div key={i}>{line || '\u00A0'}</div>
            ))}
          </blockquote>
        );
        currentBlockquote = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      // Detect quote lines or empty lines between quote lines
      if (trimmedLine.startsWith('>') || (trimmedLine === '' && currentBlockquote.length > 0 && index < lines.length - 1 && lines[index + 1].trim().startsWith('>'))) {
        currentBlockquote.push(line.replace(/^>\s?/, ''));
      } else {
        flushBlockquote();
        elements.push(<div key={index} className="min-h-[1.5em]">{line}</div>);
      }
    });

    flushBlockquote();
    return <div className="text-slate-700 leading-relaxed font-sans">{elements}</div>;
  };

  const renderMessageBody = () => {
    // Function to find body in Gmail parts (recursive)
    const findGmailBody = (parts) => {
      if (!parts) return null;

      // Try to find HTML first
      for (const part of parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return { data: part.body.data, mimeType: 'text/html' };
        }
        if (part.parts) {
          const result = findGmailBody(part.parts);
          if (result) return result;
        }
      }

      // Try to find plain text if no HTML found
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return { data: part.body.data, mimeType: 'text/plain' };
        }
      }

      return null;
    };

    const decodeGmailData = (data) => {
      try {
        // Convert URL-safe base64 to standard base64
        const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
        // Decode to binary string
        const binary = atob(base64);
        // Convert binary string to a Uint8Array and decode as UTF-8
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
      } catch (e) {
        console.error('Failed to decode base64:', e);
        return '';
      }
    };

    // Refined HTML detection helper
    const isHtmlContent = (content) => {
      return /<(?:p|div|br|table|html|body|span|b|i|strong|em|h[1-6]|hr|ul|ol|li)[^>]*?>/i.test(content);
    };

    // Priority 1: Direct HTML property (Common for SMTP and updated models)
    if (message?.html) {
      return (
        <div className="mail-content-html prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: message.html }} />
      );
    }

    // Gmail format
    if (mailbox?.type === 'gmail') {
      if (message?.payload?.body?.data) {
        const content = decodeGmailData(message.payload.body.data);
        if (isHtmlContent(content)) {
          return <div className="mail-content-html prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
        }
        return formatPlainText(content);
      }
      if (message?.payload?.parts) {
        const bodyPart = findGmailBody(message.payload.parts);
        if (bodyPart) {
          const content = decodeGmailData(bodyPart.data);
          if (bodyPart.mimeType === 'text/html' || isHtmlContent(content)) {
            return (
              <div className="mail-content-html prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            );
          }
          return formatPlainText(content);
        }
      }
    }

    // Outlook format
    if (mailbox?.type === 'outlook') {
      if (message?.body?.content) {
        const content = message.body.content;
        if (message.body.contentType === 'html' || isHtmlContent(content)) {
          return (
            <div
              className="mail-content-html prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          );
        }
        return formatPlainText(content);
      }
      if (message?.bodyPreview) {
        return formatPlainText(message.bodyPreview);
      }
    }

    // Fallback to text property
    if (message?.text || message?.body) {
      const content = message.text || message.body;
      if (isHtmlContent(content)) {
        return <div className="mail-content-html prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
      }
      return formatPlainText(content);
    }

    return (
      <p className="text-slate-400 font-bold uppercase tracking-widest text-center py-20 italic">
        {t('mailboxes.no_content_available')}
      </p>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 z-20 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 group shadow-sm text-slate-600 font-bold text-sm flex items-center"
            >
              <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
              <span className="ltr:ml-1.5 ltr:mr-1.5 rtl:ml-1.5 hidden sm:inline">{t('mailboxes.back_to_list')}</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
            <h2 dir="auto" className="text-lg font-bold text-slate-800 tracking-tight truncate max-w-50 sm:max-w-md">
              {getSubject(message)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onReply} className="btn-primary flex items-center px-4 py-2 group">
              <Reply className="w-4 h-4 ltr:mr-2 rtl:ml-2 group-hover:-translate-x-0.5 transition-transform" />
              {t('mailboxes.reply')}
            </button>
            <button onClick={onForward} className="btn-secondary flex items-center px-4 py-2">
              <Send className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {t('mailboxes.forward')}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2.5 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-200 shadow-sm text-slate-600"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showActions && (
                <div className="absolute ltr:right-0 rtl:left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200 py-2 z-30 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t('mailboxes.message_options')}
                  </div>
                  <button
                    onClick={() => {
                      onMarkRead?.(realMessageId);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 ltr:text-left ltr:text-right rtl:text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                  >
                    <Eye className="w-4 h-4 ltr:mr-3 rtl:ml-3 text-slate-400" />
                    {t('mailboxes.mark_as_read')}
                  </button>
                  <button
                    onClick={() => {
                      onMarkUnread?.(realMessageId);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 ltr:text-left ltr:text-right rtl:text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                  >
                    <EyeOff className="w-4 h-4 ltr:mr-3 rtl:ml-3 text-slate-400" />
                    {t('mailboxes.mark_as_unread')}
                  </button>
                  <button
                    onClick={() => {
                      onStar?.(realMessageId, message.isStarred);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 ltr:text-left ltr:text-right rtl:text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ltr:mr-3 rtl:ml-3 ${message?.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`}
                    />
                    {message?.isStarred ? t('mailboxes.unstar_message') : t('mailboxes.star_message')}
                  </button>
                  <div className="h-px bg-slate-100 mx-2 my-2"></div>
                  <button
                    onClick={() => {
                      onPrint?.(message);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 ltr:text-left ltr:text-right rtl:text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                  >
                    <Printer className="w-4 h-4 ltr:mr-3 rtl:ml-3 text-slate-400" />
                    {t('mailboxes.print_message')}
                  </button>
                  <button
                    onClick={() => {
                      onDownload?.(message);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 ltr:text-left ltr:text-right rtl:text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                  >
                    <Download className="w-4 h-4 ltr:mr-3 rtl:ml-3 text-slate-400" />
                    {t('mailboxes.save_offline')}
                  </button>
                  <div className="h-px bg-slate-100 mx-2 my-2"></div>
                  <button
                    onClick={() => {
                      onDelete?.(realMessageId);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 ltr:text-left ltr:text-right rtl:text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 ltr:mr-3 rtl:ml-3 shadow-sm" />
                    {t('mailboxes.move_to_trash')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div dir="auto" className="max-w-5xl mx-auto space-y-8">
          {/* Sender & Context Header */}
          <div className="premium-card p-6 md:p-10 bg-white relative overflow-hidden group">
            {/* Background Decorative Element */}
            <div className="absolute top-0 ltr:right-0 rtl:left-0 w-64 h-64 bg-linear-to-bl from-blue-500/5 to-transparent rounded-full -ltr:mr-20 rtl:ml-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>

            <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 p-0.5 shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-[14px] flex items-center justify-center text-white font-extrabold text-2xl border border-white/20">
                  {sender.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                      {getSubject(message)}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <p className="text-lg font-bold text-slate-700">{sender.name}</p>
                      <span className="text-slate-300">•</span>
                      <p className="text-sm font-medium text-slate-500">{sender.email}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 ltr:text-right rtl:text-left shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {t('mailboxes.received_on')}
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {format(date, t('common.date_time_format'))}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pb-6 border-b border-slate-100">
                  <div className="flex items-center text-sm font-medium">
                    <span className="text-slate-400 w-12 font-bold uppercase tracking-widest text-[10px]">
                      {t('mailboxes.to_label')}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {recipients.map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-xs font-bold border border-slate-200/50"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  {ccRecipients.length > 0 && (
                    <div className="flex items-center text-sm font-medium">
                      <span className="text-slate-400 w-12 font-bold uppercase tracking-widest text-[10px]">
                        {t('mailboxes.cc_label')}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {ccRecipients.map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-xs font-bold border border-slate-200/50"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-6">
                  {message?.isStarred && (
                    <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-100 shadow-sm shadow-amber-500/5">
                      <Star className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5 fill-current" />
                      {t('mailboxes.pinned_message')}
                    </span>
                  )}
                  {message?.isRead === false && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-blue-100 shadow-sm shadow-blue-500/5">
                      {t('mailboxes.priority_inbox_label')}
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider border border-slate-100">
                    {t('mailboxes.account_type_label', { type: mailbox?.type || 'Direct' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center ltr:ml-2 ltr:mr-2 rtl:ml-2">
                <Paperclip className="w-4 h-4 ltr:mr-2 rtl:ml-2 text-blue-500" />
                {t('mailboxes.attached_media_assets', { count: attachments.length })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      onDownload?.(att.id || att.attachmentId || att.partId, att.filename)
                    }
                    className="premium-card p-4 hover:shadow-blue-500/10 hover:border-blue-200 cursor-pointer transition-all group/att"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-slate-50 group-hover/att:bg-blue-50 rounded-xl transition-colors">
                        <File className="w-6 h-6 text-slate-400 group-hover/att:text-blue-500 transition-colors" />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate group-hover/att:text-blue-600 transition-colors">
                      {att.filename}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      {formatFileSize(att.size)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Message Body - Premium Canvas */}
          <div className="premium-card bg-white min-h-100 overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('mailboxes.email_content_canvas')}
              </div>
            </div>
            <div className="p-8 md:p-12 prose max-w-none text-slate-800">{renderMessageBody()}</div>
          </div>

          {/* Quick Footer */}
          <div className="text-center pb-12">
            <div className="w-12 h-px bg-slate-200 mx-auto mb-6"></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {t('mailboxes.end_of_thread')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetailView;
