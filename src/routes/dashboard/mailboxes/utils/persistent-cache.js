import {
    GMAIL_FOLDER_TEMPLATE,
    OUTLOOK_FOLDER_TEMPLATE,
    SMTP_FOLDER_TEMPLATE,
} from './folder-templates';

const CACHE_KEY = 'UNIBOX_FOLDER_CACHE';

/**
 * Gets the persistent folder list for a mailbox.
 * If no specific cache exists for the mailboxId, it returns the collective cache for the provider type.
 * If no collective cache exists, it returns the hardcoded template.
 */
export const getPersistentFolders = (type, mailboxId) => {
    try {
        const rawCache = localStorage.getItem(CACHE_KEY);
        const cache = rawCache ? JSON.parse(rawCache) : {};

        // 1. Try specific mailbox cache
        if (mailboxId && cache[mailboxId]) {
            return cache[mailboxId];
        }

        // 2. Try collective provider type cache
        if (type && cache[type]) {
            return cache[type];
        }

        // 3. Fallback to hardcoded templates
        switch (type) {
            case 'gmail':
                return GMAIL_FOLDER_TEMPLATE;
            case 'outlook':
                return OUTLOOK_FOLDER_TEMPLATE;
            case 'smtp':
                return SMTP_FOLDER_TEMPLATE;
            default:
                return [];
        }
    } catch (e) {
        console.error('Failed to read folder cache', e);
        return [];
    }
};

/**
 * Updates the persistent cache for both the specific mailbox and the collective provider type.
 */
export const setPersistentFolders = (type, mailboxId, folders) => {
    if (!folders) return;

    try {
        const rawCache = localStorage.getItem(CACHE_KEY);
        const cache = rawCache ? JSON.parse(rawCache) : {};

        // Update specific mailbox (Keep unread counts)
        if (mailboxId) {
            cache[mailboxId] = folders;
        }

        // Update collective provider type (Inheritance)
        // Strip mailbox-specific unread counts for the collective cache
        if (type) {
            const processFolders = (items) => {
                if (!Array.isArray(items)) return items;
                return items.map((f) => ({
                    ...f,
                    unreadCount: 0,
                    childFolders: processFolders(f.childFolders),
                }));
            };

            const collectiveFolders = Array.isArray(folders)
                ? processFolders(folders)
                : folders.folders
                    ? { ...folders, folders: processFolders(folders.folders) }
                    : folders;

            cache[type] = collectiveFolders;
        }

        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.error('Failed to update folder cache', e);
    }
};
