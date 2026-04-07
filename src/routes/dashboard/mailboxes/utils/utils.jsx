// mailboxes/utils.js
import { DateTime } from 'luxon';
import i18n from '../../../../i18n';
import { Gmail } from '../../../../icons/gmail';
import { MicrosoftOutlook } from '../../../../icons/outlook';
import { Smtp } from '../../../../icons/smtp';
import { Mail } from 'lucide-react';

export const formatMessageDate = (message, userTz = 'UTC') => {
  const dt = parseMessageDate(message, userTz);
  if (!dt) return '';

  try {
    const now = DateTime.now().setZone(userTz);
    
    if (dt.hasSame(now, 'day')) return dt.toFormat('h:mm a');
    if (dt.hasSame(now.minus({ days: 1 }), 'day')) return 'Yesterday';
    if (dt.hasSame(now, 'week')) return dt.toFormat('EEEE');
    
    return dt.toFormat('MMM d');
  } catch {
    return '';
  }
};

export const parseMessageDate = (message, userTz = 'UTC') => {
  try {
    if (message?.internalDate) return DateTime.fromMillis(parseInt(message.internalDate, 10)).setZone(userTz);
    if (message?.receivedDateTime) return DateTime.fromISO(message.receivedDateTime).setZone(userTz);
    if (message?.date) return DateTime.fromISO(new Date(message.date).toISOString()).setZone(userTz);
    return null;
  } catch {
    return null;
  }
};

export const timeAgo = (date, userTz = 'UTC') => {
  const dt = DateTime.fromISO(new Date(date).toISOString()).setZone(userTz);
  const now = DateTime.now().setZone(userTz);
  
  if (!dt.isValid) return 'just now';

  const diff = now.diff(dt, ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds']).toObject();

  if (diff.years >= 1) return `${Math.floor(diff.years)} year${Math.floor(diff.years) === 1 ? '' : 's'} ago`;
  if (diff.months >= 1) return `${Math.floor(diff.months)} month${Math.floor(diff.months) === 1 ? '' : 's'} ago`;
  if (diff.weeks >= 1) return `${Math.floor(diff.weeks)} week${Math.floor(diff.weeks) === 1 ? '' : 's'} ago`;
  if (diff.days >= 1) return `${Math.floor(diff.days)} day${Math.floor(diff.days) === 1 ? '' : 's'} ago`;
  if (diff.hours >= 1) return `${Math.floor(diff.hours)} hour${Math.floor(diff.hours) === 1 ? '' : 's'} ago`;
  if (diff.minutes >= 1) return `${Math.floor(diff.minutes)} minute${Math.floor(diff.minutes) === 1 ? '' : 's'} ago`;
  
  return 'just now';
};

export const getSenderInfo = (message, isSent = false) => {
  let email = '',
    name = '';
  try {
    const headerName = isSent ? 'To' : 'From';
    
    // 1. Try payload headers with case-insensitive search
    if (message?.payload?.headers) {
      const header = message.payload.headers.find(
        (h) => h.name.toLowerCase() === headerName.toLowerCase()
      );
      const headerValue = header?.value || '';

      if (headerValue) {
        const match = headerValue.match(/<([^>]+)>/);
        email = match ? match[1] : headerValue;
        const nameMatch = headerValue.match(/^([^<]+)/);
        name = nameMatch ? nameMatch[1].trim().replace(/["“”'‘’]/g, '') : email.split('@')[0];
      }
    }

    // 2. Fallbacks if name/email still empty
    if (!name || !email) {
      if (isSent && (message?.toRecipients?.[0] || message?.to)) {
        let to = message.toRecipients?.[0]?.emailAddress || message.to;
        if (Array.isArray(to)) to = to[0];

        if (typeof to === 'string') {
          const match = to.match(/<([^>]+)>/);
          email = match ? match[1] : to;
          const nameMatch = to.match(/^([^<]+)/);
          name = nameMatch ? nameMatch[1].trim().replace(/["“”'‘’]/g, '') : email.split('@')[0];
        } else {
          email = to?.address || to?.email || '';
          name = to?.name || email.split('@')[0];
        }
      } else if (message?.from?.emailAddress) {
        email = message.from.emailAddress.address || '';
        name = (message.from.emailAddress.name || email.split('@')[0]).replace(/["“”'‘’]/g, '');
      } else if (message?.from?.email) {
        email = message.from.email;
        name = (message.from.name || email.split('@')[0]).replace(/["“”'‘’]/g, '');
      } else if (typeof message?.from === 'string') {
        const fromStr = message.from;
        const match = fromStr.match(/<([^>]+)>/);
        email = match ? match[1] : fromStr;
        const nameMatch = fromStr.match(/^([^<]+)/);
        name = nameMatch ? nameMatch[1].trim().replace(/["“”'‘’]/g, '') : email.split('@')[0];
      }
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
      return (
        message.payload.headers.find((h) => h.name === 'Subject')?.value ||
        i18n.t('mailboxes.no_subject', '(no subject)')
      );
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

export const getInitials = (name) => {
  if (!name) return '?';
  const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  return cleanName.charAt(0).toUpperCase() || name.charAt(0).toUpperCase() || '?';
};

export const getProviderIcon = (type, className = 'w-6 h-6') => {
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

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
