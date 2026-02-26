/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Paperclip, Image as ImageIcon, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import i18n from '../../../../i18n';
import {
  getSenderInfo,
  getFullMessageBody,
  parseMessageDate,
  formatFileSize,
  getInitials,
} from '../utils/utils';


const ComposeView = ({
  selectedMailbox,
  onClose,
  onSend,
  replyToMessage,
  forwardMessage,
  onSaveDraft,
}) => {
  const { t } = useTranslation();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState(''); // The new message content
  const [quoteHtml, setQuoteHtml] = useState(''); // The original message content
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = React.useRef(null);
  const imageInputRef = React.useRef(null);

  // Derived state for the final body
  const bodyHtml = `
    <div class="email-body">
      ${messageText.replace(/\n/g, '<br />')}
      ${quoteHtml ? `<div class="gmail_quote" style="margin-top: 20px; border-left: 2px solid #cbd5e1; padding-left: 1ex; color: #475569;">${quoteHtml}</div>` : ''}
    </div>
  `.trim();

  useEffect(() => {
    if (replyToMessage) {
      const sender = getSenderInfo(replyToMessage);
      const date = parseMessageDate(replyToMessage);
      const formattedDate = date ? date.toLocaleString() : i18n.t('mailboxes.unknown_date', 'Unknown Date');

      setTo(sender.email);
      setSubject(
        replyToMessage.subject?.toLowerCase().startsWith('re:')
          ? replyToMessage.subject
          : `Re: ${replyToMessage.subject || t('mailboxes.no_subject')}`,
      );

      // Extract body and format as clean HTML for the rich editor
      const rawBody = getFullMessageBody(replyToMessage);
      const htmlBody = rawBody
        .split('\n')
        .map((line) => line.trim())
        .join('<br />');

      // Premium quote style: top space for typing, then attribution, then styled blockquote
      const quote = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #500050; margin-top: 20px;">
          On ${formattedDate}, ${sender.name} &lt;${sender.email}&gt; wrote:
          <blockquote style="margin: 5px 0 5px 0.8ex; border-left: 2px solid #cbd5e1; padding-left: 1ex; color: #475569;">
            ${htmlBody}
          </blockquote>
        </div>
      `.trim();

      setQuoteHtml(quote);
    } else if (forwardMessage) {
      setSubject(
        forwardMessage.subject?.toLowerCase().startsWith('fwd:')
          ? forwardMessage.subject
          : `Fwd: ${forwardMessage.subject || t('mailboxes.no_subject')}`,
      );

      const sender = getSenderInfo(forwardMessage);
      const date = parseMessageDate(forwardMessage);
      const formattedDate = date ? date.toLocaleString() : i18n.t('mailboxes.unknown_date', 'Unknown Date');

      const rawBody = getFullMessageBody(forwardMessage);
      const htmlBody = rawBody
        .split('\n')
        .map((line) => line.trim())
        .join('<br />');

      const quote = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #500050; margin-top: 20px;">
          ---------- Forwarded message ----------<br />
          From: <b>${sender.name}</b> &lt;${sender.email}&gt;<br />
          Date: ${formattedDate}<br />
          Subject: ${forwardMessage.subject}<br /><br />
          <div style="color: #475569;">
            ${htmlBody}
          </div>
        </div>
      `.trim();

      setQuoteHtml(quote);
    }
  }, [replyToMessage, forwardMessage]);

  const handleSend = async () => {
    if (!to) {
      toast.error(t('mailboxes.recipient_required_error'));
      return;
    }

    setIsSending(true);
    try {
      await onSend({
        to: to.split(',').map((e) => e.trim()),
        subject,
        html: bodyHtml,
        body: bodyHtml.replace(/<[^>]*>/g, ''),
        attachments,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            content: event.target.result.split(',')[1],
            contentType: file.type,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    onSaveDraft?.({
      to: to.split(',').map((e) => e.trim()),
      subject,
      html: bodyHtml,
    });
    toast.success(t('mailboxes.draft_saved_success'));
  };

  return (
    <div className="h-full flex flex-col bg-white ltr:border-l ltr:border-r rtl:border-l border-slate-200">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />

      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-medium text-slate-900">
              {replyToMessage ? t('mailboxes.reply') : forwardMessage ? t('mailboxes.forward') : t('mailboxes.new_message')}
            </h2>
            <p className="text-sm text-slate-500">{selectedMailbox?.email}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="group relative">
              <div className="flex items-center border-b border-slate-100 py-3 group-focus-within:border-blue-500 transition-colors">
                <span className="text-sm font-semibold text-slate-400 w-20">{t('mailboxes.to_label')}</span>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder={t('mailboxes.recipient_placeholder')}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="group relative">
              <div className="flex items-center border-b border-slate-100 py-3 group-focus-within:border-blue-500 transition-colors">
                <span className="text-sm font-semibold text-slate-400 w-20">{t('mailboxes.subject_label')}</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('mailboxes.subject_placeholder')}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-300 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
              {t('mailboxes.your_message')}
            </label>
            <div className="border border-slate-100 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all bg-white shadow-sm">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={t('mailboxes.compose_placeholder')}
                className="w-full min-h-[400px] p-8 text-base text-slate-800 placeholder:text-slate-300 outline-none resize-none no-scrollbar font-normal leading-relaxed"
              />
            </div>
          </div>

          {showPreview && (
            <div className="pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 mb-4 block">
                {t('mailboxes.live_content_canvas')}
              </label>
              {/* Integrated Preview Canvas */}
              <div className="premium-card bg-white min-h-[400px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col group">
                <div className="bg-slate-50 border-b border-slate-100 px-8 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200/60 shadow-xs">
                    {t('mailboxes.email_content_canvas')}
                  </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto no-scrollbar">
                  {/* Canvas Header */}
                  <div className="flex items-start gap-6 pb-10 border-b border-slate-50 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 p-0.5 shadow-xl shadow-blue-500/20 flex-shrink-0">
                      <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-[14px] flex items-center justify-center text-white font-extrabold text-2xl border border-white/20">
                        {getInitials(selectedMailbox?.name || 'U')}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight mb-2 truncate">
                        {subject || t('mailboxes.no_subject')}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-sm font-bold text-slate-700">{selectedMailbox?.name}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-medium text-slate-500 truncate">{selectedMailbox?.email}</span>
                      </div>
                      {to && (
                        <div className="flex items-center mt-3 pt-3 border-t border-slate-50">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ltr:mr-3 rtl:ml-3">{t('mailboxes.to_label')}</span>
                          <div className="flex flex-wrap gap-2">
                            {to.split(',').map((r, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-50 rounded text-slate-600 text-[10px] font-bold border border-slate-100 uppercase tracking-tight">
                                {r.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-50/50 px-4 py-2 rounded-xl border border-slate-100 ltr:text-right rtl:text-left shrink-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('mailboxes.preview_style')}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('mailboxes.high_fidelity')}</p>
                    </div>
                  </div>

                  {/* Canvas Body */}
                  <div
                    className="prose prose-slate max-w-none text-slate-800 mail-content-html"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  />

                  {/* Attachments within Canvas */}
                  {attachments.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-blue-500" />
                        {t('mailboxes.attachments_count', { count: attachments.length })}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 bg-slate-50/50 border border-slate-100 rounded-2xl p-3 group/item transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 hover:border-blue-200"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/item:text-blue-500 transition-colors">
                              <Paperclip className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{file.filename}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                              onClick={() => removeAttachment(index)}
                              className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-100 px-8 py-6 flex items-center justify-between bg-white">
        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all"
            title={t('mailboxes.attach_file')}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-3 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all"
            title={t('mailboxes.attach_image')}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-3 rounded-xl transition-all ${showPreview ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
              }`}
            title={showPreview ? t('mailboxes.hide_preview') : t('mailboxes.show_preview')}
          >
            {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <div className="w-px h-6 bg-slate-100 mx-2" />
          <button
            onClick={handleSaveDraft}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all active:scale-95"
          >
            {t('mailboxes.save_draft')}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            {t('mailboxes.discard')}
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${isSending
              ? 'bg-blue-400 cursor-not-allowed text-white/50'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
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
      </div>
    </div>
  );
};

export default ComposeView;
