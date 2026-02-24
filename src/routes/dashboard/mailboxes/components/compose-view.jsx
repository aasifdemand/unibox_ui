/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { X, Send, Paperclip, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import HtmlEmailEditor from '../../../../components/shared/html-editor';
import toast from 'react-hot-toast';
import { getSenderInfo, getFullMessageBody, parseMessageDate } from '../utils/utils';

const ComposeView = ({
  selectedMailbox,
  onClose,
  onSend,
  replyToMessage,
  forwardMessage,
  onSaveDraft,
}) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (replyToMessage) {
      const sender = getSenderInfo(replyToMessage);
      const date = parseMessageDate(replyToMessage);
      const formattedDate = date ? date.toLocaleString() : 'Unknown Date';

      setTo(sender.email);
      setSubject(
        replyToMessage.subject?.toLowerCase().startsWith('re:')
          ? replyToMessage.subject
          : `Re: ${replyToMessage.subject || '(no subject)'}`,
      );

      // Extract body and format as clean HTML for the rich editor
      const rawBody = getFullMessageBody(replyToMessage);
      const htmlBody = rawBody
        .split('\n')
        .map((line) => line.trim())
        .join('<br />');

      // Premium quote style: top space for typing, then attribution, then styled blockquote
      const quote = `
        <p><br /></p>
        <p><br /></p>
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #500050;">
          On ${formattedDate}, ${sender.name} &lt;${sender.email}&gt; wrote:
          <blockquote style="margin: 5px 0 5px 0.8ex; border-left: 2px solid #cbd5e1; padding-left: 1ex; color: #475569;">
            ${htmlBody}
          </blockquote>
        </div>
      `.trim();

      setBody(quote);
    } else if (forwardMessage) {
      setSubject(
        forwardMessage.subject?.toLowerCase().startsWith('fwd:')
          ? forwardMessage.subject
          : `Fwd: ${forwardMessage.subject || '(no subject)'}`,
      );

      const sender = getSenderInfo(forwardMessage);
      const date = parseMessageDate(forwardMessage);
      const formattedDate = date ? date.toLocaleString() : 'Unknown Date';

      const rawBody = getFullMessageBody(forwardMessage);
      const htmlBody = rawBody
        .split('\n')
        .map((line) => line.trim())
        .join('<br />');

      const quote = `
        <p><br /></p>
        <p><br /></p>
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #500050;">
          ---------- Forwarded message ----------<br />
          From: <b>${sender.name}</b> &lt;${sender.email}&gt;<br />
          Date: ${formattedDate}<br />
          Subject: ${forwardMessage.subject}<br /><br />
          <div style="color: #475569;">
            ${htmlBody}
          </div>
        </div>
      `.trim();

      setBody(quote);
    }
  }, [replyToMessage, forwardMessage]);

  const handleSend = () => {
    if (!to) {
      toast.error('Please specify at least one recipient.');
      return;
    }

    onSend({
      to: to.split(',').map((e) => e.trim()),
      subject,
      html: body,
      body: body.replace(/<[^>]*>/g, ''),
    });
  };

  const handleSaveDraft = () => {
    onSaveDraft?.({
      to: to.split(',').map((e) => e.trim()),
      subject,
      html: body,
    });
    toast.success('Draft saved');
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200">
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
              {replyToMessage ? 'Reply' : forwardMessage ? 'Forward' : 'New Message'}
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
        <div className="p-6 space-y-4">
          <div className="flex items-center border border-slate-200 rounded-lg px-4 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <span className="text-sm font-medium text-slate-500 w-12">To:</span>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-4 border border-slate-200 rounded-lg px-4 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <span className="text-sm font-medium text-slate-500 w-12">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Editor Area */}
          <div className="border border-slate-200 rounded-lg overflow-hidden h-96">
            <HtmlEmailEditor value={body} onChange={setBody} userFields={[]} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            title="Attach image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Save draft
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSend}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeView;
