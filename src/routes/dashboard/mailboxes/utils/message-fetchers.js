// mailboxes/message-fetchers.js
export const fetchGmailMessages = async ({
  getGmailMessages,
  getGmailSentMessages,
  getGmailTrashMessages,
  getGmailSpamMessages,
  getGmailStarredMessages,
  getGmailImportantMessages,
  gmailPageTokens,
  setGmailPageTokens,
  gmailPrevTokens,
  setGmailPrevTokens,
  setHasNextPage,
  setHasPreviousPage,
  setTotalMessages,
  mailboxId,
  folder,
  page,
  direction,
  pageSize,
  filterUnread,
  filterStarred,
}) => {
  let pageToken = null;

  if (direction === 'next') pageToken = gmailPageTokens[page - 1];
  else if (direction === 'prev') pageToken = gmailPrevTokens[page];

  if (!folder) {
    const labelIds = ['INBOX'];
    if (filterUnread) labelIds.push('UNREAD');
    if (filterStarred) labelIds.push('STARRED');

    const result = await getGmailMessages(mailboxId, pageToken, pageSize, labelIds);

    if (result.success) {
      if (result.data?.nextPageToken) {
        setGmailPageTokens((prev) => ({
          ...prev,
          [page]: result.data.nextPageToken,
        }));
        if (pageToken) setGmailPrevTokens((prev) => ({ ...prev, [page + 1]: pageToken }));
        setHasNextPage(true);
      } else setHasNextPage(false);
      setHasPreviousPage(page > 1);
      setTotalMessages(result.data?.resultSizeEstimate || 0);
    }
  } else {
    const folderName = folder.name?.toLowerCase() || '';
    const folderId = folder.id || '';
    let result;

    if (folderName.includes('sent')) {
      result = await getGmailSentMessages(mailboxId, pageToken, pageSize);
    } else if (folderName.includes('trash')) {
      result = await getGmailTrashMessages(mailboxId, pageToken, pageSize);
    } else if (folderName.includes('spam')) {
      result = await getGmailSpamMessages(mailboxId, pageToken, pageSize);
    } else if (folderName.includes('star')) {
      result = await getGmailStarredMessages(mailboxId, pageToken, pageSize);
    } else if (folderName.includes('important')) {
      result = await getGmailImportantMessages(mailboxId, pageToken, pageSize);
    } else {
      result = await getGmailMessages(mailboxId, pageToken, pageSize, [folderId]);
    }

    if (result.success) {
      if (result.data?.nextPageToken) {
        setGmailPageTokens((prev) => ({
          ...prev,
          [page]: result.data.nextPageToken,
        }));
        if (pageToken) setGmailPrevTokens((prev) => ({ ...prev, [page + 1]: pageToken }));
        setHasNextPage(true);
      } else setHasNextPage(false);
      setHasPreviousPage(page > 1);
      setTotalMessages(result.data?.resultSizeEstimate || 0);
    }
  }
};

export const fetchOutlookMessages = async ({
  getOutlookMessages,
  getOutlookSentMessages,
  getOutlookTrashMessages,
  getOutlookSpamMessages,
  getOutlookArchiveMessages,
  getOutlookOutboxMessages,
  outlookSkipTokens,
  setOutlookSkipTokens,
  outlookPrevTokens,
  setOutlookPrevTokens,
  setHasNextPage,
  setHasPreviousPage,
  setTotalMessages,
  mailboxId,
  folder,
  page,
  direction,
  pageSize,
}) => {
  let skipToken = null;

  if (direction === 'next') skipToken = outlookSkipTokens[page - 1];
  else if (direction === 'prev') skipToken = outlookPrevTokens[page];

  if (!folder) {
    const result = await getOutlookMessages(mailboxId, skipToken, pageSize, 'inbox');

    if (result.success) {
      if (result.data?.nextSkipToken) {
        setOutlookSkipTokens((prev) => ({
          ...prev,
          [page]: result.data.nextSkipToken,
        }));
        if (skipToken) setOutlookPrevTokens((prev) => ({ ...prev, [page + 1]: skipToken }));
        setHasNextPage(true);
      } else setHasNextPage(false);
      setHasPreviousPage(page > 1);
      setTotalMessages(result.data?.count || 0);
    }
  } else {
    const folderName = folder.name?.toLowerCase() || '';
    const folderId = folder.id || '';
    let result;

    if (folderName.includes('sent')) {
      result = await getOutlookSentMessages(mailboxId, skipToken, pageSize);
    } else if (folderName.includes('trash')) {
      result = await getOutlookTrashMessages(mailboxId, skipToken, pageSize);
    } else if (folderName.includes('spam')) {
      result = await getOutlookSpamMessages(mailboxId, skipToken, pageSize);
    } else if (folderName.includes('archive')) {
      result = await getOutlookArchiveMessages(mailboxId, skipToken, pageSize);
    } else if (folderName.includes('outbox')) {
      result = await getOutlookOutboxMessages(mailboxId, skipToken, pageSize);
    } else {
      result = await getOutlookMessages(mailboxId, skipToken, pageSize, folderId);
    }

    if (result.success) {
      if (result.data?.nextSkipToken) {
        setOutlookSkipTokens((prev) => ({
          ...prev,
          [page]: result.data.nextSkipToken,
        }));
        if (skipToken) setOutlookPrevTokens((prev) => ({ ...prev, [page + 1]: skipToken }));
        setHasNextPage(true);
      } else setHasNextPage(false);
      setHasPreviousPage(page > 1);
      setTotalMessages(result.data?.count || 0);
    }
  }
};

export const fetchSmtpMessages = async ({
  getSmtpMessages,
  setSmtpPages,
  setHasNextPage,
  setHasPreviousPage,
  setTotalMessages,
  mailboxId,
  folder,
  page,
  pageSize,
}) => {
  const folderName = folder?.name || 'INBOX';
  const result = await getSmtpMessages(mailboxId, page, pageSize, folderName);

  if (result.success) {
    setSmtpPages((prev) => ({ ...prev, [page]: result.data }));
    setHasNextPage(page < result.data.totalPages);
    setHasPreviousPage(page > 1);
    setTotalMessages(result.data.totalCount);
  }
};
