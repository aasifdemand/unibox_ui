export const getMessageId = (message, providerType) => {
  if (!message) return null;

  //   // Log for debugging
  //   console.log(`Extracting ${providerType} message ID from:`, message);

  // Gmail specific
  if (providerType === "gmail") {
    // Check for providerMessageId first (this should be the real Gmail ID)
    if (message.providerMessageId) {
      // Remove angle brackets if present
      return message.providerMessageId.replace(/[<>]/g, "");
    }

    // Check for internetMessageId (sometimes used)
    if (message.internetMessageId) {
      return message.internetMessageId.replace(/[<>]/g, "");
    }

    // Check if id is the real Gmail ID (not starting with 'r')
    if (message.id && !message.id.toString().startsWith("r")) {
      return message.id;
    }

    // Check threadId as fallback
    if (message.threadId && !message.threadId.toString().startsWith("r")) {
      return message.threadId;
    }

    // Check messageId (common in our drafts/database)
    if (message.messageId && !message.messageId.toString().startsWith("r")) {
      return message.messageId;
    }

    // Last resort - look in headers
    if (message.payload?.headers) {
      const msgIdHeader = message.payload.headers.find(
        (h) => h.name === "Message-ID",
      );
      if (msgIdHeader) {
        return msgIdHeader.value.replace(/[<>]/g, "");
      }
    }

    console.warn("Could not find valid Gmail ID in message:", message);
    return null;
  }

  // Outlook specific
  if (providerType === "outlook") {
    return message.id || message.messageId || message.internetMessageId;
  }

  // SMTP specific
  if (providerType === "smtp") {
    return message.uid || message.id || message.messageId;
  }

  // Fallback
  return message.id || message.messageId || message.uid;
};

/**
 * Gets a display ID for React keys (use this for mapping)
 */
export const getDisplayId = (message, providerType) => {
  const realId = getMessageId(message, providerType);
  // Fallback to a combination of fields if no real ID
  return (
    realId || `${message.threadId}-${message.date}` || Math.random().toString()
  );
};

export const getProviderMessageId = (message, providerType) => {
  if (!message) return null;

  if (providerType === "gmail") {
    // Gmail specific - look for providerMessageId first
    if (message.providerMessageId) {
      // Remove any angle brackets if present
      return message.providerMessageId.replace(/[<>]/g, "");
    }
    // Sometimes it's in the id field but without 'r' prefix
    if (message.id && !message.id.toString().startsWith("r")) {
      return message.id;
    }
    // Check threadId as fallback
    if (message.threadId && !message.threadId.toString().startsWith("r")) {
      return message.threadId;
    }
    // Check messageId as fallback
    if (message.messageId && !message.messageId.toString().startsWith("r")) {
      return message.messageId;
    }
    // Last resort - check if it's in the payload
    if (message.payload?.headers) {
      const msgId = message.payload.headers.find(
        (h) => h.name === "Message-ID",
      )?.value;
      if (msgId) {
        return msgId.replace(/[<>]/g, "");
      }
    }
  }

  if (providerType === "outlook") {
    // Outlook specific
    return message.id || message.messageId || message.internetMessageId;
  }

  if (providerType === "smtp") {
    // SMTP specific
    return message.uid || message.id || message.messageId;
  }

  // Fallback
  return message.id || message.messageId || message.uid;
};
