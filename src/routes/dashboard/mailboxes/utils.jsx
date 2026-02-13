// mailboxes/utils.js
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { Gmail } from "../../../icons/gmail";
import { MicrosoftOutlook } from "../../../icons/outlook";
import { Mail } from "lucide-react";

export const formatMessageDate = (message) => {
  const date = parseMessageDate(message);
  if (!date) return "";

  try {
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM d");
  } catch {
    return "";
  }
};

export const parseMessageDate = (message) => {
  try {
    if (message?.internalDate)
      return new Date(parseInt(message.internalDate, 10));
    if (message?.receivedDateTime) return new Date(message.receivedDateTime);
    if (message?.date) return new Date(message.date);
    return null;
  } catch {
    return null;
  }
};

export const getSenderInfo = (message) => {
  let email = "",
    name = "";
  try {
    if (message?.payload?.headers) {
      const from =
        message.payload.headers.find((h) => h.name === "From")?.value || "";
      const match = from.match(/<([^>]+)>/);
      email = match ? match[1] : from;
      const nameMatch = from.match(/^([^<]+)/);
      name = nameMatch
        ? nameMatch[1].trim().replace(/"/g, "")
        : email.split("@")[0];
    } else if (message?.from?.emailAddress) {
      email = message.from.emailAddress.address || "";
      name = message.from.emailAddress.name || email.split("@")[0];
    } else if (message?.from?.email) {
      email = message.from.email;
      name = message.from.name || email.split("@")[0];
    } else if (typeof message?.from === "string") {
      email = message.from;
      name = email.split("@")[0];
    }
  } catch (e) {
    console.error("Error parsing sender:", e);
  }
  return { email, name: name || email.split("@")[0] || "Unknown" };
};

export const getSubject = (message) => {
  try {
    if (message?.subject) return message.subject;
    if (message?.payload?.headers) {
      return (
        message.payload.headers.find((h) => h.name === "Subject")?.value ||
        "(no subject)"
      );
    }
  } catch (e) {
    console.error("Error getting subject:", e);
  }
  return "(no subject)";
};

export const getPreview = (message) => {
  try {
    if (message?.bodyPreview) return message.bodyPreview;
    if (message?.snippet) return message.snippet;
    if (message?.text) return message.text.substring(0, 100) + "...";
  } catch (e) {
    console.error("Error getting preview:", e);
  }
  return "";
};

export const getInitials = (name) => name?.charAt(0)?.toUpperCase() || "?";

export const getProviderIcon = (type) => {
  switch (type) {
    case "gmail":
      return <Gmail className="w-6 h-6" />;
    case "outlook":
      return <MicrosoftOutlook className="w-6 h-6" />;
    case "smtp":
      return <Mail className="w-6 h-6 text-green-500" />;
    default:
      return <Mail className="w-6 h-6 text-gray-500" />;
  }
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1)
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
  }
  return "just now";
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
