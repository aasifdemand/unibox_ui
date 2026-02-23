import Modal from "../components/shared/modal";
import { Mail, Calendar, MessageCircle, Reply, AtSign } from "lucide-react";
import Button from "../components/ui/button";
import DOMPurify from "dompurify";

const ShowReply = ({
  isOpen,
  setIsOpen,
  loading,
  reply,
  setSelectedRecipientId,
  formatDate,
}) => {
  const getSafeBody = () => {
    if (!reply) return "";

    const raw = reply.body || reply.html || reply.text || "";

    // Check if the content is HTML
    const isHtml = /<[a-z][\s\S]*>/i.test(raw);

    // If HTML exists → sanitize only
    if (isHtml) {
      return DOMPurify.sanitize(raw);
    }

    // Clean plain text replies
    let cleaned = raw;

    // Remove "On ... wrote:"
    cleaned = cleaned.split(/On .* wrote:/i)[0];

    // Remove quoted lines starting with >
    cleaned = cleaned
      .split("\n")
      .filter((line) => !line.trim().startsWith(">"))
      .join("\n");

    // Remove excessive > > > markers
    cleaned = cleaned.replace(/(>\s*)+/g, "");

    // Convert to clean paragraphs
    const formatted = cleaned
      .trim()
      .replace(/\n{2,}/g, "</p><p>")
      .replace(/\n/g, "<br/>");

    const finished = `<p>${formatted}</p>`;
    return DOMPurify.sanitize(finished);
  };

  const safeBody = getSafeBody();

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setSelectedRecipientId?.(null);
      }}
      maxWidth="max-w-3xl"
      closeOnBackdrop={true}
    >
      {/* Header */}
      <div className="bg-linear-to-br from-indigo-600 to-blue-700 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
          <Reply className="w-16 h-16 text-white" />
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 backdrop-blur-sm">
              <Reply className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white uppercase tracking-tighter">
                Reply Details
              </h3>
              <p className="text-[10px] font-bold text-indigo-100/70 uppercase tracking-widest mt-0.5">
                View recipient response
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full"></div>
            </div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-6">
              Loading reply...
            </p>
          </div>
        ) : reply ? (
          <div className="space-y-6">
            {/* Sender Info */}
            <div className="bg-linear-to-br from-indigo-50 to-blue-50 rounded-4xl p-6 border border-indigo-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-lg shadow-indigo-500/10 flex items-center justify-center border border-indigo-200">
                  <AtSign className="w-7 h-7 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white rounded-xl text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest border border-indigo-200">
                      From
                    </span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-800">
                    {reply.replyFrom}
                  </p>
                  {reply.replyTo && (
                    <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                      To: {reply.replyTo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Subject
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 line-clamp-2">
                  {reply.subject}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Received
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {formatDate(reply.receivedAt)}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-slate-50 rounded-4xl p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Message
                </span>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-37.5">
                {safeBody ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: safeBody }}
                  />
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No message content available
                  </p>
                )}
              </div>
            </div>

            {/* Original Email */}
            {reply.email && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                  Original Email
                </p>
                <p className="text-xs text-slate-600">
                  Sent: {formatDate(reply.email.sentAt)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-200">
              <MessageCircle className="w-10 h-10 text-slate-300" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-2">
              No Reply Found
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              This recipient hasn't replied yet.
            </p>
          </div>
        )}

        <div className="pt-6 mt-8 border-t border-slate-100 flex justify-end">
          <Button
            onClick={() => {
              setIsOpen(false);
              setSelectedRecipientId?.(null);
            }}
            variant="primary"
            className="px-8 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all active:scale-95"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShowReply;
