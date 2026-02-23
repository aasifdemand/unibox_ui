import React, { useMemo } from "react";
import {
  MessageCircle,
  Loader2,
  Eye,
  Reply,
  ShieldCheck,
  Mail,
} from "lucide-react";
import Button from "../../../../../components/ui/button";

const RepliesTab = ({ replies, repliesLoading, formatDate, viewReply }) => {
  const repliesList = Array.isArray(replies) ? replies : [];

  return (
    <div className="space-y-10 pb-20 mt-4">

      <div className="premium-card bg-white border-slate-200/60 p-10 shadow-2xl shadow-slate-900/2">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Reply className="w-5 h-5 text-indigo-600" />
              Campaign Replies
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Manage replies from this campaign
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {repliesList.length}
            </span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Total Replies
            </p>
          </div>
        </div>

        {repliesLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
              Loading replies...
            </p>
          </div>
        ) : repliesList && repliesList.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {repliesList.map((reply) => {
              // Get recipient from the nested recipient object
              const recipient = reply.recipient;

              return (
                <div
                  key={reply.id}
                  className="group relative p-8 rounded-8 bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-500">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">
                            {recipient?.name ||
                              reply.replyFrom?.split("@")[0] ||
                              "Unknown"}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {reply.replyFrom || "No Email"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-800 tracking-tight">
                          {reply.subject || "No Subject"}
                        </p>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 italic">
                          "
                          {(reply.body || reply.text || reply.html || "")
                            .replace(/<[^>]*>/g, "")
                            .replace(/&nbsp;/g, " ")
                            .substring(0, 200)}
                          ..."
                        </p>

                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-100 shadow-sm">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {recipient?.status || "Replied"}
                          </span>
                        </div>
                        <span className="text-[11px] font-black text-slate-300 tabular-nums uppercase">
                          Received: {formatDate(reply.receivedAt)}
                        </span>
                        {reply.email?.subject && (
                          <span className="text-[11px] font-black text-slate-300 tabular-nums uppercase">
                            Re: {reply.email.subject}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => viewReply(reply)}
                      variant="primary"
                      className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 group-hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-center"
                    >
                      <Eye className="w-4 h-4" />
                      View Message
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center rotate-3 border border-slate-100">
                <Reply className="w-10 h-10 text-slate-200" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 rotate-12">
                <ShieldCheck className="w-5 h-5 text-indigo-200" />
              </div>
            </div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight">
              No replies yet
            </h4>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">
              When you receive replies from this campaign, they will appear
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepliesTab;
