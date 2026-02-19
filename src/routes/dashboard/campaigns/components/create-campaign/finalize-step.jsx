import React from "react";
import {
  Clock,
  Shield,
  Zap,
  Activity,
  Gauge,
  FileText,
  User,
  Mail,
  Database,
} from "lucide-react";
import Input from "../../../../../components/ui/input";

const Step3Finalize = ({
  register,
  errors,
  watch,
  watchScheduleType,
  selectedBatch,
  selectedSender,
}) => {
  const campaignName = watch("name");
  const subject = watch("subject");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Campaign Summary */}
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tighter">
                Campaign Summary
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Review your configuration before launch
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest">
              Ready to Send
            </span>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="group p-5 bg-slate-50/50 rounded-3xl border-2 border-slate-100 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Campaign Name
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {campaignName || "Untitled Campaign"}
                </p>
              </div>

              <div className="group p-5 bg-slate-50/50 rounded-3xl border-2 border-slate-100 hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Mail className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Email Subject
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 line-clamp-1">
                  {subject || "No subject set"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="group p-5 bg-slate-50/50 rounded-3xl border-2 border-slate-100 hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Database className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Recipient List
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {selectedBatch?.originalFilename || "No list selected"}
                </p>
              </div>

              <div className="group p-5 bg-slate-50/50 rounded-3xl border-2 border-slate-100 hover:border-purple-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Sender Account
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {selectedSender?.email || "No sender selected"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Schedule Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
              Schedule Sending
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "now", title: "Send Now", desc: "Process immediately" },
              {
                id: "later",
                title: "Schedule for Later",
                desc: "Choose specific time",
              },
            ].map((option) => (
              <label
                key={option.id}
                className={`group relative flex items-center p-5 bg-white border-2 rounded-4xl cursor-pointer transition-all duration-300 hover:border-blue-200 ${watch("scheduleType") === option.id ? "border-blue-500 bg-blue-50/20 ring-4 ring-blue-500/5 shadow-sm" : "border-slate-100"}`}
              >
                <input
                  type="radio"
                  {...register("scheduleType")}
                  value={option.id}
                  className="w-5 h-5 appearance-none border-2 border-slate-200 rounded-full checked:border-blue-500 checked:bg-blue-500 transition-all"
                />
                <div className="ml-4">
                  <p className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">
                    {option.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {option.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {watchScheduleType === "later" && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <Input
                label="Dispatch Date & Time"
                type="datetime-local"
                {...register("scheduledAt")}
                error={errors.scheduledAt?.message}
                required
                className="rounded-2xl border-2 border-slate-100 focus:border-blue-500"
              />
            </div>
          )}

          <Input
            label="Sending Rate (emails/min)"
            type="number"
            {...register("throttlePerMinute", { valueAsNumber: true })}
            error={errors.throttlePerMinute?.message}
            icon={Gauge}
            className="rounded-2xl border-2 border-slate-100 focus:border-blue-500"
            helperText="Lower rates can improve inbox placement"
          />
        </div>

        {/* Tracking & Compliance */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
              Tracking & Rules
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "trackOpens",
                title: "Open Tracking",
                desc: "Monitor views",
              },
              {
                id: "trackClicks",
                title: "Click Tracking",
                desc: "Monitor link activity",
              },
              {
                id: "unsubscribeLink",
                title: "Unsubscribe Link",
                desc: "CAN-SPAM Compliance",
                highlight: true,
              },
            ].map((setting) => (
              <label
                key={setting.id}
                className={`flex items-center justify-between p-5 rounded-4xl border-2 cursor-pointer transition-all duration-300 ${
                  setting.highlight
                    ? "bg-amber-50/30 border-amber-100 hover:border-amber-200"
                    : "bg-white border-slate-100 hover:border-blue-200"
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">
                    {setting.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {setting.desc}
                  </p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(setting.id)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5 shadow-sm"></div>
                </div>
              </label>
            ))}
          </div>

          <div className="p-5 rounded-3xl bg-blue-50/40 border border-blue-100">
            <div className="flex gap-4">
              <Shield className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase tracking-widest">
                By launching, you agree to follow anti-spam laws and ensure you
                have permission to contact these recipients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Finalize;
