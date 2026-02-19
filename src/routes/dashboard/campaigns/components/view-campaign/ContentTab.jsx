import React from "react";
import { Mail, Layout, Type, ShieldCheck, Database, Eye } from "lucide-react";

const ContentTab = ({
  previews,
  placeholders,
  sampleRecipient,
  selectedRecipientForPreview,
}) => {
  return (
    <div className="space-y-10 pb-20 mt-4">
      {/* Email Content Preview */}
      <div className="premium-card bg-white border-slate-200/60 p-10 shadow-2xl shadow-slate-900/2">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Email Content
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Preview how your email looks
            </p>
          </div>
          {selectedRecipientForPreview && (
            <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in duration-500">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                Recipient:{" "}
                {selectedRecipientForPreview.name ||
                  selectedRecipientForPreview.email}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Subject Line
              </span>
              <p className="text-sm font-bold text-slate-900 tracking-tight">
                {previews.subject}
              </p>
            </div>
            {previews.previewText && (
              <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Preview Text
                </span>
                <p className="text-sm font-medium text-slate-600 italic">
                  "{previews.previewText}"
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                HTML Preview
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Live Preview
                </span>
              </div>
            </div>
            <div className="relative rounded-4xl border border-slate-200/60 bg-white p-1 shadow-2xl shadow-slate-900/2 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-20"></div>
              <div className="p-8 min-h-100 bg-slate-50/30 rounded-[28px] overflow-auto custom-scrollbar">
                <div
                  dangerouslySetInnerHTML={{ __html: previews.html }}
                  className="prose max-w-none [&_p]:my-4 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5"
                />
              </div>
            </div>
          </div>

          {previews.text && (
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Plain Text Version
              </span>
              <pre className="p-8 bg-slate-900 rounded-4xl text-indigo-300 text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-2xl shadow-indigo-900/10 border border-slate-800">
                {previews.text}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Template Variables */}
      <div className="premium-card bg-white border-slate-200/60 p-10 shadow-2xl shadow-slate-900/2">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Dynamic Variables
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Placeholders used in your email
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholders.map((placeholder) => {
            const key = placeholder.replace(/{{|}}/g, "").trim();
            const sampleValue =
              sampleRecipient?.metadata?.[key] ||
              sampleRecipient?.[key] ||
              null;

            return (
              <div
                key={placeholder}
                className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 group hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <code className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {placeholder}
                </code>
                <div className="mt-4 space-y-1">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">
                    Sample Value:
                  </span>
                  <p className="text-[13px] font-bold text-slate-700 tracking-tight truncate">
                    {sampleValue || (
                      <span className="text-slate-300 italic">None</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-6 bg-slate-900 rounded-4xl flex items-center gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20 relative z-10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
              Variable Check
            </p>
            <p className="text-sm font-medium text-slate-300 leading-snug">
              All variables are verified. Data will be automatically inserted
              into your emails when sending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentTab;
