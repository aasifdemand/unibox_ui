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
import {
  formatMessageDate,
  getSenderInfo as getSenderInfoUtil,
  getSubject as getSubjectUtil,
  getInitials,
  formatFileSize,
} from '../utils/utils';
import { format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { getMessageId } from '../utils/getmessage-id';

const SafeHtmlRenderer = ({ htmlContent }) => {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState('400px');

  // Inject styles to restore the "Premium" look that was lost during iframe transition
  const safeContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  html, body { 
    height: auto !important; 
    min-height: 0 !important; 
    overflow: visible !important; 
    margin: 0; 
    padding: 0;
  }
  body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; 
    font-size: 15px;
    line-height: 1.6;
    color: #334155; /* slate-700 */
    padding: 32px !important;
  }
  img { 
    max-width: 100% !important; 
    height: auto !important; 
    display: block; 
    margin: 1em 0;
  }
  a { 
    color: #6366f1; /* primary-500 */
    text-decoration: underline; 
    word-break: break-all;
  }
  p { margin-bottom: 1.25em; }
  h1, h2, h3, h4 { 
    font-family: 'Outfit', sans-serif !important; 
    color: #1e293b; /* slate-800 */
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  blockquote {
    border-left: 4px solid #e2e8f0;
    padding-left: 1.25rem;
    margin: 1.5em 0;
    color: #64748b;
    font-style: italic;
  }
  table { 
    width: 100% !important; 
    max-width: 100% !important; 
    border-collapse: collapse; 
    margin: 1em 0;
    table-layout: fixed;
  }
  /* Preserve original email styling if it exists */
  ${htmlContent.includes('<style>') ? '' : `
    ul, ol { margin-bottom: 1.25em; padding-left: 1.5em; }
    li { margin-bottom: 0.5em; }
  `}
</style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

  const updateHeight = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const body = iframeRef.current.contentWindow.document.body;
        const html = iframeRef.current.contentWindow.document.documentElement;

        // Let it layout first, then measure
        setTimeout(() => {
          if (!iframeRef.current) return;
          const newHeight = Math.max(
            body.scrollHeight || 0,
            body.offsetHeight || 0,
            html.clientHeight || 0,
            html.scrollHeight || 0,
            html.offsetHeight || 0
          );
          if (newHeight > 0) {
            setHeight(`${newHeight + 30}px`); // Add slight padding
          }
        }, 100);
      } catch (err) {
        setHeight('800px');
      }
    }
  };

  useEffect(() => {
    setHeight('400px');
  }, [htmlContent]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={safeContent}
      onLoad={updateHeight}
      title="Message Content"
      className="w-full border-none outline-none bg-transparent mail-iframe"
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      style={{ height, minHeight: '400px', display: 'block' }}
      scrolling="no"
    />
  );
};

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
  isIntegrated = false,
}) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const realMessageId = getMessageId(message, mailbox?.type);

  const getSenderInfo = (msg) => getSenderInfoUtil(msg);

  const getRecipients = (msg) => {
    if (msg?.to) {
      return (typeof msg.to === 'string' ? msg.to : '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (msg?.toRecipients) {
      return msg.toRecipients.map((r) => r.emailAddress?.address).filter(Boolean);
    }
    if (msg?.payload?.headers) {
      const to = msg.payload.headers.find((h) => h.name === 'To' || h.name === 'to')?.value || '';
      return to.split(',').map((t) => t.trim());
    }
    return [];
  };

  const getCcRecipients = (msg) => {
    if (msg?.cc) {
      return (typeof msg.cc === 'string' ? msg.cc : '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (msg?.ccRecipients) {
      return msg.ccRecipients.map((r) => r.emailAddress?.address).filter(Boolean);
    }
    if (msg?.payload?.headers) {
      const cc = msg.payload.headers.find((h) => h.name === 'Cc' || h.name === 'cc')?.value || '';
      return cc.split(',').map((t) => t.trim());
    }
    return [];
  };

  const getSubject = (msg) => getSubjectUtil(msg);

  const getDate = (msg) => {
    if (msg?.date) return new Date(msg.date);
    if (msg?.receivedDateTime) return new Date(msg.receivedDateTime);
    if (msg?.internalDate) return new Date(parseInt(msg.internalDate, 10));
    return new Date();
  };

  const getAttachments = (msg) => msg?.attachments || [];

  const sender = getSenderInfo(message);
  const recipients = getRecipients(message);
  const ccRecipients = getCcRecipients(message);
  const date = getDate(message);
  const attachments = getAttachments(message);

  const formatPlainText = (text) => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const signatureWords = ['Cheers', 'Best', 'Regards', 'Sincerely', 'Thanks', 'Bästa', 'Hälsningar', 'Yours', 'Talk soon', 'Kind regards'];

    const linkify = (t) => {
      if (typeof t !== 'string') return t;
      const parts = t.split(/(\s+)/);
      return parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold decoration-blue-600/30 underline-offset-4">
              {part}
            </a>
          );
        }
        if (part.match(emailRegex)) {
          return (
            <a key={i} href={`mailto:${part}`} className="text-blue-600 hover:underline font-semibold decoration-blue-600/30 underline-offset-4">
              {part}
            </a>
          );
        }
        return part;
      });
    };

    const lines = text.split(/\n/);
    const blocks = [];
    let currentBlock = null;

    const flush = () => {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Signature detection (start of signature)
      const isSignatureStart = signatureWords.some(word =>
        trimmed.toLowerCase().startsWith(word.toLowerCase())
      );

      if (isSignatureStart && currentBlock?.type !== 'signature') {
        flush();
      }

      // Quote detection
      if (trimmed.startsWith('>')) {
        if (currentBlock?.type !== 'quote') flush();
        if (!currentBlock) currentBlock = { type: 'quote', lines: [] };
        currentBlock.lines.push(line.replace(/^>\s?/, ''));
        return;
      }

      // List detection
      const listMatch = trimmed.match(/^([-*•]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        if (currentBlock?.type !== 'list') flush();
        if (!currentBlock) currentBlock = { type: 'list', items: [] };
        currentBlock.items.push(listMatch[2]);
        return;
      }

      // Empty line handling
      if (trimmed === '') {
        flush();
        return;
      }

      // Signature continuation
      if (currentBlock?.type === 'signature') {
        currentBlock.lines.push(line);
        return;
      }

      // If we hit a signature start word
      if (isSignatureStart) {
        currentBlock = { type: 'signature', lines: [line] };
        return;
      }

      // Default: Treat every line as a new paragraph block to maximize vertical space (space-y-9)
      flush();
      currentBlock = { type: 'paragraph', content: line };
      flush();
    });
    flush();

    return (
      <div className="text-slate-700 font-sans break-words whitespace-pre-wrap overflow-hidden prose prose-slate max-w-none space-y-9 select-text">
        {blocks.map((block, bIdx) => {
          if (block.type === 'quote') {
            return (
              <blockquote key={bIdx} className="border-l-4 border-slate-200 pl-8 my-8 text-slate-500 italic bg-linear-to-r from-slate-50/80 to-transparent py-5 rounded-r-[2.5rem]">
                {block.lines.map((l, lIdx) => (
                  <div key={lIdx} className="leading-relaxed">{linkify(l) || '\u00A0'}</div>
                ))}
              </blockquote>
            );
          }

          if (block.type === 'list') {
            return (
              <ul key={bIdx} className="list-none space-y-4 ltr:pl-5 rtl:pr-5 border-l border-slate-100 ltr:ml-2 rtl:mr-2">
                {block.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start group">
                    <span className="shrink-0 ltr:mr-4 rtl:ml-4 w-1.5 h-1.5 rounded-full bg-blue-500/30 group-hover:bg-blue-500 mt-2.5 transition-colors" />
                    <span className="text-base font-medium leading-relaxed tracking-tight text-slate-600">{linkify(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          if (block.type === 'signature') {
            return (
              <div key={bIdx} className="pt-4 border-t border-slate-100/50 mt-10 space-y-1">
                {block.lines.map((l, lIdx) => (
                  <div key={lIdx} className="text-[15px] font-semibold text-slate-500 leading-relaxed italic opacity-90">
                    {linkify(l)}
                  </div>
                ))}
              </div>
            );
          }

          // Paragraph
          return (
            <p key={bIdx} className="text-[16px] font-medium text-slate-600 leading-[1.6] tracking-tight">
              {linkify(block.content)}
            </p>
          );
        })}
      </div>
    );
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
        <div className="mail-content-html w-full max-w-none">
          <SafeHtmlRenderer htmlContent={message.html} />
        </div>
      );
    }

    // Gmail format
    if (mailbox?.type === 'gmail') {
      if (message?.payload?.body?.data) {
        const content = decodeGmailData(message.payload.body.data);
        if (isHtmlContent(content)) {
          return <div className="mail-content-html w-full max-w-none"><SafeHtmlRenderer htmlContent={content} /></div>;
        }
        return formatPlainText(content);
      }
      if (message?.payload?.parts) {
        const bodyPart = findGmailBody(message.payload.parts);
        if (bodyPart) {
          const content = decodeGmailData(bodyPart.data);
          if (bodyPart.mimeType === 'text/html' || isHtmlContent(content)) {
            return (
              <div className="mail-content-html w-full max-w-none">
                <SafeHtmlRenderer htmlContent={content} />
              </div>
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
            <div className="mail-content-html w-full max-w-none">
              <SafeHtmlRenderer htmlContent={content} />
            </div>
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
        return <div className="mail-content-html w-full max-w-none"><SafeHtmlRenderer htmlContent={content} /></div>;
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
    <div className={`flex flex-col animate-in fade-in duration-500 ${isIntegrated ? 'w-full' : 'h-full bg-slate-50 overflow-hidden'}`}>

      {/* Message Content Area */}
      <div className={`min-w-0 ${isIntegrated ? 'p-0 w-full' : 'flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8'}`}>
        <div dir="auto" className={`mx-auto space-y-8 min-w-0 w-full ${isIntegrated ? 'max-w-none' : 'max-w-5xl'}`}>
          {/* Sender & Context Header */}
          <div className={`${isIntegrated ? 'p-6 md:p-8 bg-transparent' : 'premium-card p-6 md:p-10 bg-white shadow-xl shadow-slate-200/50'} relative overflow-hidden group border-b border-slate-100`}>
            {/* Background Decorative Element */}
            {!isIntegrated && (
              <div className="absolute top-0 ltr:right-0 rtl:left-0 w-64 h-64 bg-linear-to-bl from-blue-500/5 to-transparent rounded-full -ltr:mr-20 rtl:ml-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            )}

            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black text-slate-800 tracking-tight">{sender.name}</p>
                    <p className="text-xs font-bold text-slate-400">&lt;{sender.email}&gt;</p>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                    {format(date, t('common.date_time_format'))}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="text-slate-400 font-black uppercase tracking-widest text-[8px] opacity-70">
                      {t('mailboxes.to_label')}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {recipients.map((r, i) => (
                        <span key={i} className="text-slate-500 text-[10px] font-bold">
                          {r}{i < recipients.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                  {ccRecipients.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="text-slate-400 font-black uppercase tracking-widest text-[8px] opacity-70">
                        {t('mailboxes.cc_label')}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ccRecipients.map((r, i) => (
                          <span key={i} className="text-slate-500 text-[10px] font-bold">
                            {r}{i < ccRecipients.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <div className={`space-y-4 ${isIntegrated ? 'px-6 md:px-8' : ''}`}>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                <Paperclip className="w-3.5 h-3.5 ltr:mr-2 rtl:ml-2 text-blue-500" />
                {t('mailboxes.attached_media_assets', { count: attachments.length })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      onDownload?.(att.id || att.attachmentId || att.partId, att.filename)
                    }
                    className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200 cursor-pointer transition-all group/att"
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

          {/* Main Message Body */}
          <div className={`${isIntegrated ? '' : 'premium-card bg-white'} min-h-100 min-w-0`}>
            <div className={`p-8 md:p-12 prose max-w-none text-slate-800 overflow-x-auto ${isIntegrated ? '' : ''}`}>
              {renderMessageBody()}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default MessageDetailView;
