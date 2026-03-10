import React from 'react';
import { Mail, ShieldCheck, Database, Eye } from 'lucide-react';

const ContentTab = ({
  previews,
  placeholders,
  sampleRecipient,
  selectedRecipientForPreview,
  steps,
  activeStepIndex,
  setActiveStepIndex,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 mt-4 animate-in fade-in duration-700">
      {/* Step Navigation Sidebar */}
      {steps && steps.length > 0 && (
        <div className="lg:w-64 shrink-0 space-y-4">
          <div className="bg-slate-50 border border-slate-200/60 rounded-4xl p-4 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 mb-4">
              Sequence Steps
            </p>

            {/* Step 0: Main */}
            <button
              onClick={() => setActiveStepIndex(0)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                activeStepIndex === 0
                  ? 'bg-white shadow-xl shadow-indigo-500/5 border border-indigo-100 ring-2 ring-indigo-500/10'
                  : 'hover:bg-white/60 text-slate-500'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeStepIndex === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}
              >
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p
                  className={`text-[10px] font-black uppercase tracking-tight ${activeStepIndex === 0 ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  Step 1: Main
                </p>
              </div>
            </button>

            {/* Follow-up Steps */}
            {steps
              .filter((s) => s.stepOrder > 0)
              .map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(step.stepOrder)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    activeStepIndex === step.stepOrder
                      ? 'bg-white shadow-xl shadow-indigo-500/5 border border-indigo-100 ring-2 ring-indigo-500/10'
                      : 'hover:bg-white/60 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeStepIndex === step.stepOrder ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}
                  >
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p
                      className={`text-[10px] font-black uppercase tracking-tight ${activeStepIndex === step.stepOrder ? 'text-indigo-600' : 'text-slate-400'}`}
                    >
                      Step {step.stepOrder + 1}: Follow-up
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 space-y-10">
        {/* Email Content Preview */}
        <div className="premium-card bg-white border-slate-200/60 p-10 shadow-2xl shadow-slate-900/2">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                {activeStepIndex === 0 ? 'Main Email' : `Follow-up #${activeStepIndex}`} Content
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Preview how your {activeStepIndex === 0 ? 'initial' : 'follow-up'} email looks
              </p>
            </div>
            {selectedRecipientForPreview && (
              <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in duration-500">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                  Recipient: {selectedRecipientForPreview.name || selectedRecipientForPreview.email}
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
              {previews.previewText && activeStepIndex === 0 && (
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Preview Text
                  </span>
                  <p className="text-sm font-medium text-slate-600 italic">
                    &quot;{previews.previewText}&quot;
                  </p>
                </div>
              )}
              {activeStepIndex > 0 && steps.find((s) => s.stepOrder === activeStepIndex) && (
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Wait Time
                  </span>
                  <p className="text-sm font-bold text-indigo-600">
                    {Math.round(
                      steps.find((s) => s.stepOrder === activeStepIndex).delayMinutes / 1440,
                    )}{' '}
                    Days
                  </p>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mt-2 mb-1">
                    Condition
                  </span>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    {steps.find((s) => s.stepOrder === activeStepIndex).condition === 'no_reply'
                      ? 'If No Reply'
                      : 'Always Send'}
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
                <div className="absolute top-0 ltr:left-0 ltr:right-0 rtl:left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-20"></div>
                <div className="p-8 min-h-100 bg-slate-50/30 rounded-[28px] overflow-auto custom-scrollbar">
                  <div
                    dangerouslySetInnerHTML={{ __html: previews.html }}
                    className="prose max-w-none [&_p]:my-4 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ltr:pl-5 ltr:pr-5 rtl:pl-5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ltr:pl-5 ltr:pr-5 rtl:pl-5"
                  />
                </div>
              </div>
            </div>
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
                Placeholders used in this step
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placeholders.map((placeholder) => {
              const key = placeholder.replace(/{{|}}/g, '').trim();
              const sampleValue =
                sampleRecipient?.metadata?.[key] || sampleRecipient?.[key] || null;

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
                      {sampleValue || <span className="text-slate-300 italic">None</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentTab;
