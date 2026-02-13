// hooks/useSenders.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const senderKeys = {
  all: ["senders"],
  lists: () => [...senderKeys.all, "list"],
  detail: (id) => [...senderKeys.all, "detail", id],
};

// =========================
// FETCH ALL SENDERS
// =========================
const fetchSenders = async () => {
  const res = await fetch(`${API_URL}/senders`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch senders");
  return data.data || [];
};

export const useSenders = () => {
  return useQuery({
    queryKey: senderKeys.lists(),
    queryFn: fetchSenders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// =========================
// GET SINGLE SENDER
// =========================
const fetchSender = async (senderId) => {
  const res = await fetch(`${API_URL}/senders/${senderId}`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch sender");
  return data.data;
};

export const useSender = (senderId) => {
  return useQuery({
    queryKey: senderKeys.detail(senderId),
    queryFn: () => fetchSender(senderId),
    enabled: !!senderId,
    staleTime: 5 * 60 * 1000,
  });
};

// =========================
// CREATE SMTP SENDER
// =========================
const createSmtpSender = async (senderData) => {
  const formattedData = {
    email: senderData.email,
    displayName: senderData.displayName,
    smtpHost: senderData.host,
    smtpPort: parseInt(senderData.port) || 587,
    smtpSecure: senderData.secure,
    smtpUser: senderData.username,
    smtpPassword: senderData.password,
    imapHost: senderData.imapHost || senderData.host.replace("smtp", "imap"),
    imapPort: senderData.imapPort || 993,
    imapSecure:
      senderData.imapSecure !== undefined ? senderData.imapSecure : true,
    imapUser: senderData.imapUser || senderData.username,
    imapPassword: senderData.imapPassword || senderData.password,
  };

  const res = await fetch(`${API_URL}/senders/create`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formattedData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create SMTP sender");
  return data.data;
};

export const useCreateSmtpSender = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSmtpSender,
    onSuccess: (newSender) => {
      // Update the senders list cache
      queryClient.setQueryData(senderKeys.lists(), (old = []) => {
        return [newSender, ...old];
      });
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: senderKeys.lists() });
    },
  });
};

// =========================
// DELETE SENDER
// =========================
const deleteSender = async ({ senderId, senderType }) => {
  const url = `${API_URL}/senders/${senderId}${senderType ? `?type=${senderType}` : ""}`;
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete sender");
  return { senderId, message: data.message };
};

export const useDeleteSender = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSender,
    onSuccess: (_, { senderId }) => {
      // Remove from cache
      queryClient.setQueryData(senderKeys.lists(), (old = []) => {
        return old.filter((sender) => sender.id !== senderId);
      });
      // Remove detail query
      queryClient.removeQueries({ queryKey: senderKeys.detail(senderId) });
    },
  });
};

// =========================
// UPDATE SENDER
// =========================
const updateSender = async ({ senderId, ...updateData }) => {
  const res = await fetch(`${API_URL}/senders/${senderId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update sender");
  return data.data;
};

export const useUpdateSender = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSender,
    onSuccess: (updatedSender, { senderId }) => {
      // Update in list
      queryClient.setQueryData(senderKeys.lists(), (old = []) => {
        return old.map((sender) =>
          sender.id === senderId ? { ...sender, ...updatedSender } : sender,
        );
      });
      // Update detail query
      queryClient.setQueryData(senderKeys.detail(senderId), updatedSender);
    },
  });
};

// =========================
// TEST SMTP CONNECTION
// =========================
const testSmtp = async (smtpConfig) => {
  const res = await fetch(`${API_URL}/senders/test-smtp`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.username,
      password: smtpConfig.password,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "SMTP connection failed");
  return data;
};

export const useTestSmtp = () => {
  return useMutation({
    mutationFn: testSmtp,
  });
};

// =========================
// TEST IMAP CONNECTION
// =========================
const testImap = async (imapConfig) => {
  const res = await fetch(`${API_URL}/senders/test-imap`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: imapConfig.host,
      port: imapConfig.port,
      secure: imapConfig.secure,
      user: imapConfig.user || imapConfig.username,
      password: imapConfig.password,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "IMAP connection failed");
  return data;
};

export const useTestImap = () => {
  return useMutation({
    mutationFn: testImap,
  });
};

// =========================
// TEST EXISTING SENDER
// =========================
const testSender = async (senderId) => {
  const res = await fetch(`${API_URL}/senders/${senderId}/test`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to test sender");
  return data;
};

export const useTestSender = () => {
  return useMutation({
    mutationFn: testSender,
  });
};

// =========================
// OAUTH REDIRECTS (not mutations)
// =========================
export const initiateGmailOAuth = () => {
  window.location.href = `${API_URL}/senders/oauth/gmail`;
};

export const initiateOutlookOAuth = () => {
  window.location.href = `${API_URL}/senders/oauth/outlook`;
};
