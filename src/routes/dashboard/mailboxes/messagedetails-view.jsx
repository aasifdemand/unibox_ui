import {
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  File,
  MoreVertical,
  Paperclip,
  Printer,
  Reply,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import { formatFileSize } from "./utils";
import { format } from "date-fns";
import { useState } from "react";

const MessageDetailView = ({
  message,
  mailbox,
  onBack,
  onDelete,
  onReply,
  onForward,
  onMarkRead,
  onMarkUnread,
  onStar,
  onPrint,
  onDownload,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getSenderInfo = (msg) => {
    let email = "",
      name = "";
    try {
      if (msg?.payload?.headers) {
        const from =
          msg.payload.headers.find((h) => h.name === "From")?.value || "";
        const match = from.match(/<([^>]+)>/);
        email = match ? match[1] : from;
        const nameMatch = from.match(/^([^<]+)/);
        name = nameMatch
          ? nameMatch[1].trim().replace(/"/g, "")
          : email.split("@")[0];
      } else if (msg?.from?.emailAddress) {
        email = msg.from.emailAddress.address || "";
        name = msg.from.emailAddress.name || email.split("@")[0];
      } else if (msg?.from?.email) {
        email = msg.from.email;
        name = msg.from.name || email.split("@")[0];
      }
    } catch (e) {
      console.error("Error parsing sender:", e);
    }
    return { email, name: name || email.split("@")[0] || "Unknown" };
  };

  const getRecipients = (msg) => {
    if (msg?.toRecipients) {
      return msg.toRecipients
        .map((r) => r.emailAddress?.address)
        .filter(Boolean);
    }
    if (msg?.payload?.headers) {
      const to = msg.payload.headers.find((h) => h.name === "To")?.value || "";
      return to.split(",").map((t) => t.trim());
    }
    return [];
  };

  const getSubject = (msg) => {
    if (msg?.subject) return msg.subject;
    if (msg?.payload?.headers) {
      return (
        msg.payload.headers.find((h) => h.name === "Subject")?.value ||
        "(no subject)"
      );
    }
    return "(no subject)";
  };

  const getDate = (msg) => {
    if (msg?.receivedDateTime) return new Date(msg.receivedDateTime);
    if (msg?.internalDate) return new Date(parseInt(msg.internalDate, 10));
    if (msg?.date) return new Date(msg.date);
    return new Date();
  };

  const getAttachments = (msg) => {
    if (msg?.attachments) return msg.attachments;
    if (msg?.payload?.parts) {
      return msg.payload.parts.filter(
        (p) => p.filename && p.filename.length > 0,
      );
    }
    return [];
  };

  const sender = getSenderInfo(message);
  const recipients = getRecipients(message);
  const date = getDate(message);
  const attachments = getAttachments(message);

  const renderMessageBody = () => {
    if (mailbox?.type === "gmail") {
      if (message?.payload?.body?.data) {
        const html = atob(
          message.payload.body.data.replace(/-/g, "+").replace(/_/g, "/"),
        );
        return <div dangerouslySetInnerHTML={{ __html: html }} />;
      }
      if (message?.payload?.parts) {
        const htmlPart = message.payload.parts.find(
          (p) => p.mimeType === "text/html",
        );
        if (htmlPart?.body?.data) {
          const html = atob(
            htmlPart.body.data.replace(/-/g, "+").replace(/_/g, "/"),
          );
          return <div dangerouslySetInnerHTML={{ __html: html }} />;
        }
        const textPart = message.payload.parts.find(
          (p) => p.mimeType === "text/plain",
        );
        if (textPart?.body?.data) {
          const text = atob(
            textPart.body.data.replace(/-/g, "+").replace(/_/g, "/"),
          );
          return <pre className="whitespace-pre-wrap font-sans">{text}</pre>;
        }
      }
    } else if (mailbox?.type === "outlook") {
      if (message?.body?.content) {
        return (
          <div dangerouslySetInnerHTML={{ __html: message.body.content }} />
        );
      }
      if (message?.bodyPreview) {
        return (
          <pre className="whitespace-pre-wrap font-sans">
            {message.bodyPreview}
          </pre>
        );
      }
    } else if (mailbox?.type === "smtp") {
      if (message?.html) {
        return <div dangerouslySetInnerHTML={{ __html: message.html }} />;
      }
      if (message?.text) {
        return (
          <pre className="whitespace-pre-wrap font-sans">{message.text}</pre>
        );
      }
    }
    return <p className="text-gray-500 italic">No content available</p>;
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center text-gray-600"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span className="ml-1">Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onReply}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center text-sm font-medium transition"
            >
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </button>
            <button
              onClick={onForward}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center text-sm font-medium transition"
            >
              <Send className="w-4 h-4 mr-2" />
              Forward
            </button>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onMarkRead();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Mark as read
                  </button>
                  <button
                    onClick={() => {
                      onMarkUnread();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Mark as unread
                  </button>
                  <button
                    onClick={() => {
                      onStar();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {message.isStarred ? "Remove star" : "Add star"}
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      onPrint();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      onDownload();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      onDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 p-6">
        {/* Subject */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {getSubject(message)}
        </h1>

        {/* Sender Info */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-start">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg mr-4 shrink-0">
              {sender.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {sender.name}
                  </p>
                  <p className="text-sm text-gray-500">{sender.email}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {format(date, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">To:</span> {recipients.join(", ")}
              </p>
              {message.cc?.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Cc:</span>{" "}
                  {message.cc.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Paperclip className="w-4 h-4 mr-2" />
              Attachments ({attachments.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition group"
                >
                  <div className="flex items-center mb-2">
                    <File className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {att.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(att.size)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Body */}
        <div className="prose max-w-none bg-white rounded-xl p-6 border border-gray-200">
          {renderMessageBody()}
        </div>
      </div>
    </div>
  );
};

export default MessageDetailView;
