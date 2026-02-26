/**
 * Robustly identifies if a folder matches a specific system type.
 * Handles case-insensitivity and checks both ID and Name to support various providers.
 */
export const isFolderType = (folder, type) => {
    if (!folder) return false;

    const id = (folder.id || '').toUpperCase();
    const name = (folder.name || folder.displayName || '').toUpperCase();
    const t = type.toUpperCase();

    // Helper for exact or near-exact matches
    const isMatch = (val, targets) => {
        if (!val) return false;
        return targets.some(target =>
            val === target ||
            val === `[GMAIL]/${target}` ||
            val.endsWith(`/${target}`) ||
            val.startsWith(`${target}/`)
        );
    };

    switch (t) {
        case 'INBOX':
            return isMatch(id, ['INBOX']) || isMatch(name, ['INBOX']);
        case 'SENT':
            return isMatch(id, ['SENT', 'SENTITEMS', 'SENT MESSAGES', 'SENT MAIL']) || isMatch(name, ['SENT', 'SENT ITEMS', 'SENT MESSAGES', 'SENT MAIL']);
        case 'DRAFTS':
            return isMatch(id, ['DRAFT', 'DRAFTS']) || isMatch(name, ['DRAFT', 'DRAFTS']);
        case 'TRASH':
            return isMatch(id, ['TRASH', 'DELETEDITEMS', 'DELETED', 'BIN']) || isMatch(name, ['TRASH', 'DELETED ITEMS', 'DELETED', 'BIN', 'RECYCLE BIN']);
        case 'SPAM':
            return isMatch(id, ['SPAM', 'JUNK', 'JUNKEMAIL']) || isMatch(name, ['SPAM', 'JUNK', 'JUNK EMAIL']);
        case 'ARCHIVE':
            return isMatch(id, ['ARCHIVE']) || isMatch(name, ['ARCHIVE']);
        case 'STARRED':
            return isMatch(id, ['STARRED', 'FLAGGED']) || isMatch(name, ['STARRED', 'FLAGGED', 'STAR']);
        case 'IMPORTANT':
            return isMatch(id, ['IMPORTANT', 'IMPORTANT MESSAGES']) || isMatch(name, ['IMPORTANT', 'IMPORTANT MESSAGES']);
        case 'OUTBOX':
            return isMatch(id, ['OUTBOX']) || isMatch(name, ['OUTBOX']);
        case 'CATEGORY_PERSONAL':
            return isMatch(id, ['CATEGORY_PERSONAL']) || isMatch(name, ['CATEGORY_PERSONAL', 'PERSONAL']);
        case 'CATEGORY_SOCIAL':
            return isMatch(id, ['CATEGORY_SOCIAL']) || isMatch(name, ['CATEGORY_SOCIAL', 'SOCIAL']);
        case 'CATEGORY_PROMOTIONS':
            return isMatch(id, ['CATEGORY_PROMOTIONS']) || isMatch(name, ['CATEGORY_PROMOTIONS', 'PROMOTIONS']);
        case 'CATEGORY_UPDATES':
            return isMatch(id, ['CATEGORY_UPDATES']) || isMatch(name, ['CATEGORY_UPDATES', 'UPDATES']);
        case 'CATEGORY_FORUMS':
            return isMatch(id, ['CATEGORY_FORUMS']) || isMatch(name, ['CATEGORY_FORUMS', 'FORUMS']);
        case 'CONVERSATION_HISTORY':
            return isMatch(id, ['CONVERSATION HISTORY', 'CONVERSATION_HISTORY']) || isMatch(name, ['CONVERSATION HISTORY', 'CONVERSATION_HISTORY']);
        case 'RSS_FEEDS':
            return isMatch(id, ['RSS FEEDS', 'RSS_FEEDS']) || isMatch(name, ['RSS FEEDS', 'RSS_FEEDS']);
        default:
            return false;
    }
};
