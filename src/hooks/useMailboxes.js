// hooks/useMailboxes.js
import { useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const mailboxKeys = {
  all: ["mailboxes"],
  lists: () => [...mailboxKeys.all, "list"],
  detail: (id) => [...mailboxKeys.all, "detail", id],
};

// Fetch all senders (internal function)
const fetchSenders = async () => {
  const res = await fetch(`${API_URL}/senders`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch senders");
  }

  const data = await res.json();
  return data.data || [];
};

// Transform sender to mailbox format - WITH PROPER TYPE DETECTION
const transformSenderToMailbox = (sender) => {
  // Determine the correct type based on the sender's properties
  let type = sender.type; // Default from API

  // Override with more reliable detection
  if (sender.microsoftId) {
    type = "outlook";
    console.log(`📧 Fixed: ${sender.email} is Outlook (has microsoftId)`);
  } else if (sender.googleId) {
    type = "gmail";
    console.log(`📧 Fixed: ${sender.email} is Gmail (has googleId)`);
  } else if (sender.smtpHost) {
    type = "smtp";
    console.log(`📧 Fixed: ${sender.email} is SMTP (has smtpHost)`);
  }

  return {
    id: sender.id,
    type: type, // Use the corrected type
    email: sender.email,
    displayName: sender.displayName,
    domain: sender.domain,
    isVerified: sender.isVerified,
    isActive: sender.isActive !== undefined ? sender.isActive : true,
    createdAt: sender.createdAt,
    updatedAt: sender.updatedAt,
    lastSyncAt: sender.lastInboxSyncAt || sender.lastUsedAt || null,
    expiresAt: sender.expiresAt,
    stats: {
      dailySent: sender.dailySentCount || 0,
    },
    // Include detection fields for debugging
    _debug: {
      hasMicrosoftId: !!sender.microsoftId,
      hasGoogleId: !!sender.googleId,
      hasSmtpHost: !!sender.smtpHost,
      originalType: sender.type,
    },
  };
};

// Fetch all mailboxes
export const useMailboxes = () => {
  return useQuery({
    queryKey: mailboxKeys.lists(),
    queryFn: async () => {
      const senders = await fetchSenders();

      const mailboxes = senders.map(transformSenderToMailbox);

      return mailboxes.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};

// Get mailbox by ID
export const useMailbox = (mailboxId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: mailboxKeys.detail(mailboxId),
    queryFn: async () => {
      // Try to get from cache first
      const mailboxes = queryClient.getQueryData(mailboxKeys.lists());
      let mailbox = mailboxes?.find((m) => m.id === mailboxId);

      if (!mailbox) {
        // If not in cache, fetch all senders
        const senders = await fetchSenders();
        const sender = senders.find((s) => s.id === mailboxId);

        if (!sender) {
          throw new Error("Mailbox not found");
        }

        mailbox = transformSenderToMailbox(sender);

        // Remove stats for single mailbox
        const { _debug, ...mailboxWithoutStats } = mailbox;
        return mailboxWithoutStats;
      }

      // Remove stats for single mailbox
      const { _debug, ...mailboxWithoutStats } = mailbox;
      return mailboxWithoutStats;
    },
    enabled: !!mailboxId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

// Optional: Add a mutation for refreshing mailboxes
export const useRefreshMailboxes = () => {
  const queryClient = useQueryClient();

  return {
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: mailboxKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mailboxKeys.all });
    },
  };
};
