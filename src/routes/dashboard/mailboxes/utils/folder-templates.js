/**
 * Standard folder templates for each mailbox provider type.
 * These are used as placeholder data in React Query to provide instant UI transitions.
 */

export const GMAIL_FOLDER_TEMPLATE = [
    { id: 'INBOX', name: 'Inbox', unreadCount: 0 },
    { id: 'SENT', name: 'Sent', unreadCount: 0 },
    { id: 'DRAFT', name: 'Drafts', unreadCount: 0 },
    { id: 'TRASH', name: 'Trash', unreadCount: 0 },
    { id: 'SPAM', name: 'Spam', unreadCount: 0 },
    { id: 'STARRED', name: 'Starred', unreadCount: 0 },
    { id: 'IMPORTANT', name: 'Important', unreadCount: 0 },
];

export const OUTLOOK_FOLDER_TEMPLATE = {
    folders: [
        { id: 'inbox', displayName: 'Inbox', unreadCount: 0 },
        { id: 'sentitems', displayName: 'Sent Items', unreadCount: 0 },
        { id: 'drafts', displayName: 'Drafts', unreadCount: 0 },
        { id: 'deleteditems', displayName: 'Deleted Items', unreadCount: 0 },
        { id: 'junkemail', displayName: 'Junk Email', unreadCount: 0 },
        { id: 'archive', displayName: 'Archive', unreadCount: 0 },
        { id: 'outbox', displayName: 'Outbox', unreadCount: 0 },
    ],
};

export const SMTP_FOLDER_TEMPLATE = {
    folders: [
        { id: 'INBOX', name: 'INBOX', unreadCount: 0 },
        { id: 'SENT', name: 'SENT', unreadCount: 0 },
        { id: 'DRAFTS', name: 'DRAFTS', unreadCount: 0 },
        { id: 'TRASH', name: 'TRASH', unreadCount: 0 },
        { id: 'SPAM', name: 'SPAM', unreadCount: 0 },
        { id: 'ARCHIVE', name: 'ARCHIVE', unreadCount: 0 },
    ],
};
