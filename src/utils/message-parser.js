import i18n from '../i18n';

export const getSenderInfo = (message) => {
  let email = i18n.t('mailboxes.unknown_sender', 'Unknown');
  let name = i18n.t('mailboxes.unknown_sender', 'Unknown');

  try {
    if (message?.payload?.headers) {
      const fromHeader = message.payload.headers.find((h) => h.name === 'From')?.value || '';
      const match = fromHeader.match(/<([^>]+)>/);
      email = match ? match[1] : fromHeader;
      const nameMatch = fromHeader.match(/^([^<]+)/);
      name = nameMatch ? nameMatch[1].trim() : email.split('@')[0];
    } else if (message?.from?.email) {
      email = message.from.email;
      name = message.from.name || email.split('@')[0];
    } else if (message?.from?.emailAddress) {
      email = message.from.emailAddress.address || i18n.t('mailboxes.unknown_sender', 'Unknown');
      name = message.from.emailAddress.name || email.split('@')[0];
    } else if (typeof message?.from === 'string') {
      const match = message.from.match(/<([^>]+)>/);
      email = match ? match[1] : message.from;
      const nameMatch = message.from.match(/^([^<]+)/);
      name = nameMatch ? nameMatch[1].trim() : email.split('@')[0];
    }
  } catch (e) {
    console.error('Error parsing sender:', e);
  }

  return { email, name };
};

export const getSubject = (message) => {
  if (message?.subject) return message.subject;

  if (message?.payload?.headers) {
    const subjectHeader = message.payload.headers.find((h) => h.name === 'Subject')?.value;
    if (subjectHeader) return subjectHeader;
  }

  return i18n.t('mailboxes.no_subject', '(no subject)');
};

export const getPreview = (message) => {
  if (message?.bodyPreview) return message.bodyPreview;
  if (message?.snippet) return message.snippet;

  if (message?.payload?.parts) {
    const textPart = message.payload.parts.find((p) => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      try {
        const decoded = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        return decoded.substring(0, 100) + '...';
      } catch (e) {
        console.log(e);

        return '';
      }
    }
  }

  return '';
};

export const getDate = (message) => {
  if (message?.receivedDateTime) return message.receivedDateTime;
  if (message?.date) return message.date;
  if (message?.internalDate) return message.internalDate;

  if (message?.payload?.headers) {
    const dateHeader = message.payload.headers.find((h) => h.name === 'Date')?.value;
    if (dateHeader) return dateHeader;
  }

  return null;
};

export const formatDate = (dateString) => {
  if (!dateString) return i18n.t('mailboxes.unknown_date', 'Unknown');
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  } catch {
    return 'Invalid date';
  }
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase() || '?';
};
