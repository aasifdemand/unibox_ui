import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useSenderStore = create((set) => ({
  senders: [],
  isLoading: false,
  error: null,

  fetchSenders: async () => {
    try {
      set({ isLoading: true });

      const res = await fetch(`${API_URL}/senders`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch senders");
      }

      set({ senders: data.data || [], isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // For OAuth (Gmail/Outlook) - Updated routes
  initiateGmailOAuth: () => {
    window.location.href = `${API_URL}/senders/oauth/gmail`;
  },

  initiateOutlookOAuth: () => {
    window.location.href = `${API_URL}/senders/oauth/outlook`;
  },

  // =========================
  // TEST SMTP CONNECTION ONLY
  // =========================
  testSmtp: async (smtpConfig) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/senders/test-smtp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.username,
          password: smtpConfig.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "SMTP connection failed");
      }

      set({ isLoading: false });
      return {
        success: true,
        message: data.message || "SMTP connection successful",
      };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return {
        success: false,
        error: err.message,
      };
    }
  },

  // =========================
  // TEST IMAP CONNECTION ONLY
  // =========================
  testImap: async (imapConfig) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/senders/test-imap`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: imapConfig.host,
          port: imapConfig.port,
          secure: imapConfig.secure,
          user: imapConfig.user || imapConfig.username,
          password: imapConfig.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "IMAP connection failed");
      }

      set({ isLoading: false });
      return {
        success: true,
        message: data.message || "IMAP connection successful",
      };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return {
        success: false,
        error: err.message,
      };
    }
  },

  // For SMTP
  createSmtpSender: async (senderData) => {
    try {
      set({ isLoading: true, error: null });

      // Format data for new API
      const formattedData = {
        email: senderData.email,
        displayName: senderData.displayName,
        smtpHost: senderData.host,
        smtpPort: parseInt(senderData.port) || 587,
        smtpSecure: senderData.secure,
        smtpUser: senderData.username,
        smtpPassword: senderData.password,
        // IMAP fields (optional)
        imapHost:
          senderData.imapHost || senderData.host.replace("smtp", "imap"),
        imapPort: senderData.imapPort || 993,
        imapSecure:
          senderData.imapSecure !== undefined ? senderData.imapSecure : true,
        imapUser: senderData.imapUser || senderData.username,
        imapPassword: senderData.imapPassword || senderData.password,
      };

      const res = await fetch(`${API_URL}/senders/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create SMTP sender");
      }

      // Add to senders list
      set((state) => ({
        senders: [data.data, ...state.senders],
        isLoading: false,
      }));

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  deleteSender: async (senderId, senderType) => {
    try {
      set({ isLoading: true, error: null });

      // ✅ Add type as query parameter
      const url = `${API_URL}/senders/${senderId}${senderType ? `?type=${senderType}` : ""}`;

      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete sender");
      }

      // Remove from senders list
      set((state) => ({
        senders: state.senders.filter((sender) => sender.id !== senderId),
        isLoading: false,
      }));

      return { success: true, message: data.message };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Test sender connection (for existing senders)
  testSender: async (senderId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/senders/${senderId}/test`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to test sender");
      }

      set({ isLoading: false });
      return { success: true, message: data.message };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Get single sender
  getSender: async (senderId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/senders/${senderId}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch sender");
      }

      set({ isLoading: false });
      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Update sender
  updateSender: async (senderId, updateData) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/senders/${senderId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update sender");
      }

      // Update in senders list
      set((state) => ({
        senders: state.senders.map((sender) =>
          sender.id === senderId ? { ...sender, ...data.data } : sender,
        ),
        isLoading: false,
      }));

      return { success: true, data: data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  clearError: () => set({ error: null }),
}));
