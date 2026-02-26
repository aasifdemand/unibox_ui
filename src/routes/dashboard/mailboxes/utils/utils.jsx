// mailboxes/utils.js
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import i18n from '../../../../i18n';
import { Gmail } from '../../../../icons/gmail';
import { MicrosoftOutlook } from '../../../../icons/outlook';
import { Smtp } from '../../../../icons/smtp';
import { Mail } from 'lucide-react';

export const formatMessageDate = (message) => {
  const date = parseMessageDate(message);
  if (!date) return '';

  try {
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM d');
  } catch {
    return '';
  }
};

export const parseMessageDate = (message) => {
  try {
    if (message?.internalDate) return new Date(parseInt(message.internalDate, 10));
    if (message?.receivedDateTime) return new Date(message.receivedDateTime);
    if (message?.date) return new Date(message.date);
    return null;
  } catch {
    return null;
  }
};

export const getSenderInfo = (message, isSent = false) => {
  let email = '',
    name = '';
  try {
    if (message?.payload?.headers) {
      const headerName = isSent ? 'To' : 'From';
      const headerValue = message.payload.headers.find((h) => h.name === headerName)?.value || '';
      const match = headerValue.match(/<([^>]+)>/);
      email = match ? match[1] : headerValue;
      const nameMatch = headerValue.match(/^([^<]+)/);
      name = nameMatch ? nameMatch[1].trim().replace(/"/g, '') : email.split('@')[0];
    } else if (isSent && (message?.toRecipients?.[0] || message?.to)) {
      let to = message.toRecipients?.[0]?.emailAddress || message.to;
      if (Array.isArray(to)) to = to[0];

      if (typeof to === 'string') {
        const match = to.match(/<([^>]+)>/);
        email = match ? match[1] : to;
        const nameMatch = to.match(/^([^<]+)/);
        name = nameMatch ? nameMatch[1].trim().replace(/"/g, '') : email.split('@')[0];
      } else {
        email = to?.address || to?.email || '';
        name = to?.name || email.split('@')[0];
      }
    } else if (message?.from?.emailAddress) {
      email = message.from.emailAddress.address || '';
      name = message.from.emailAddress.name || email.split('@')[0];
    } else if (message?.from?.email) {
      email = message.from.email;
      name = message.from.name || email.split('@')[0];
    } else if (typeof message?.from === 'string') {
      email = message.from;
      name = email.split('@')[0];
    }
  } catch (e) {
    console.error('Error parsing sender:', e);
  }
  return {
    email,
    name: name || email.split('@')[0] || i18n.t('mailboxes.unknown_sender', 'Unknown'),
    isSent: !!isSent,
  };
};

export const getSubject = (message) => {
  try {
    if (message?.subject) return message.subject;
    if (message?.payload?.headers) {
      return message.payload.headers.find((h) => h.name === 'Subject')?.value || i18n.t('mailboxes.no_subject', '(no subject)');
    }
  } catch (e) {
    console.error('Error getting subject:', e);
  }
  return i18n.t('mailboxes.no_subject', '(no subject)');
};

export const getFullMessageBody = (message) => {
  try {
    let text = '';

    // Try to get full content first from payload
    if (message?.payload) {
      const decodeBase64 = (data) => {
        try {
          const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = atob(base64);
          try {
            return decodeURIComponent(escape(decoded));
          } catch {
            return decoded;
          }
        } catch (e) {
          console.error('Base64 decode error:', e);
          return '';
        }
      };

      if (message.payload.parts && message.payload.parts.length > 0) {
        const textPart = message.payload.parts.find(
          (part) => part.mimeType === 'text/plain' && part.body?.data,
        );
        if (textPart) {
          text = decodeBase64(textPart.body.data);
        } else {
          const htmlPart = message.payload.parts.find(
            (part) => part.mimeType === 'text/html' && part.body?.data,
          );
          if (htmlPart) text = decodeBase64(htmlPart.body.data);
        }
      } else if (message.payload.body?.data) {
        text = decodeBase64(message.payload.body.data);
      }
    }

    if (!text) {
      text =
        message.html ||
        message.body ||
        message.text ||
        message.bodyPreview ||
        message.snippet ||
        '';
    }

    if (!text) return '';

    // Standardize HTML to text if needed
    if (text.includes('<') && (text.includes('>') || text.includes('&lt;'))) {
      const doc = new DOMParser().parseFromString(text, 'text/html');
      text = doc.body.textContent || doc.body.innerText || '';
    }

    // Fix common encoding artifacts
    text = text
      .replace(/â\u0080\u0099/g, "'")
      .replace(/â\u0080\u0098/g, "'")
      .replace(/â\u0080\u009c/g, '"')
      .replace(/â\u0080\u009d/g, '"')
      .replace(/â\u0080\u0093/g, '-')
      .replace(/â\u0080\u0094/g, '--')
      .replace(/â\u0080¦/g, '...')
      .replace(/â\u0082¬/g, '€')
      .replace(/Â/g, '')
      .replace(/â¯/g, ' ')
      .replace(/â€™/g, "'")
      .replace(/â€˜/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€\u009d/g, '"')
      .replace(/â€/g, '"')
      .replace(/â€“/g, '-')
      .replace(/â€”/g, '--')
      .replace(/â€¦/g, '...')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n');

    const txt = document.createElement('textarea');
    txt.innerHTML = text;
    text = txt.value;

    return text.trim();
  } catch (e) {
    console.error('Error getting full message body:', e);
    return '';
  }
};

export const getMessageBody = (message) => {
  let text = getFullMessageBody(message);
  if (!text) return '';

  // Remove quoted replies for a cleaner view/preview
  const lines = text.split('\n');
  const cleanLines = [];
  let inQuote = false;

  for (const line of lines) {
    if (line.trim().startsWith('>')) {
      inQuote = true;
      continue;
    }
    if (inQuote && line.trim() === '') continue;
    inQuote = false;
    cleanLines.push(line);
  }

  text = cleanLines.join('\n').trim();

  // Remove "On ... wrote:" patterns
  const wroteIndex = text.search(/On .+ wrote:/);
  if (wroteIndex > 0) {
    text = text.substring(0, wroteIndex).trim();
  }

  return text.trim();
};

export const getPreview = (message) => {
  // Use professional snippets if available (Gmail/Outlook)
  const officialPreview = message.snippet || message.bodyPreview;
  if (officialPreview) return officialPreview;

  const body = getMessageBody(message);
  if (!body) return '';
  return body.substring(0, 100) + (body.length > 100 ? '...' : '');
};

export const getInitials = (name) => name?.charAt(0)?.toUpperCase() || '?';

export const getProviderIcon = (type, className = "w-6 h-6") => {
  switch (type) {
    case 'gmail':
      return <Gmail className={className} />;
    case 'outlook':
      return <MicrosoftOutlook className={className} />;
    case 'smtp':
      return <Smtp className={className} />;
    default:
      return <Mail className={`${className} text-gray-500`} />;
  }
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
  }
  return 'just now';
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
