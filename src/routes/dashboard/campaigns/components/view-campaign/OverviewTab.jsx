import React from "react";
import {
  Activity,
  Target,
  ExternalLink,
  Zap,
  ShieldCheck,
  Database,
  Clock,
  Settings2,
} from "lucide-react";

const OverviewTab = ({
  campaign,
  stats,
  previews,
  placeholders,
  formatDate,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Left Column: Progress & Details */}
      <div className="lg:col-span-2 space-y-8">
        {/* Campaign Progress */}
        <div className="premium-card bg-white border-slate-200/60 p-8 shadow-2xl shadow-slate-900/2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Campaign Progress
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Live Sending Progress
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-600 tabular-nums">
                {stats.progress}%
              </span>
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none">
                Complete
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40 p-0.5">
              <div
                className="h-full bg-linear-to-r from-indigo-500 via-indigo-600 to-indigo-700 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-500/20"
                style={{ width: `${stats.progress}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-size-[40px_40px] animate-[shimmer_2s_infinite_linear]"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-4 px-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Remaining
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">
                  {(stats.totalRecipients - stats.totalSent).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Total Sent
                </span>
                <span className="text-2xl font-black text-emerald-600 tracking-tighter tabular-nums">
                  {stats.totalSent.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="premium-card bg-white border-slate-200/60 p-8 shadow-2xl shadow-slate-900/2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-8">
            <Database className="w-5 h-5 text-indigo-600" />
            Campaign Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <DetailItem label="Campaign Name" value={previews.campaignName} />
              <DetailItem
                label="Subject Line"
                value={previews.subject}
                subValue={
                  placeholders.length > 0
                    ? `Variables used: ${placeholders.join(", ")}`
                    : null
                }
              />
              <DetailItem
                label="Preview Text"
                value={previews.previewText || "Not set"}
              />
              <DetailItem
                label="Sender Type"
                value={campaign.senderType || "Standard"}
                uppercase
              />
            </div>
            <div className="space-y-6">
              <DetailItem
                label="Created Date"
                value={formatDate(campaign.createdAt)}
              />
              <DetailItem
                label="Scheduled For"
                value={
                  campaign.scheduledAt
                    ? formatDate(campaign.scheduledAt)
                    : "Immediate"
                }
              />
              <DetailItem
                label="Last Updated"
                value={formatDate(campaign.updatedAt)}
              />
              <DetailItem
                label="Sending Rate"
                value={`${campaign.throttlePerMinute || 10} emails / min`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Settings */}
      <div className="space-y-8">
        <div className="premium-card bg-white border-slate-200/60 p-8 shadow-2xl shadow-slate-900/2 h-full">
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-8">
            <Settings2 className="w-5 h-5 text-indigo-600" />
            Campaign Settings
          </h3>

          <div className="space-y-6">
            <SettingItem
              icon={<Activity className="w-4 h-4" />}
              label="Track Opens"
              status={campaign.trackOpens}
              desc="Monitor when recipients open your emails"
            />
            <SettingItem
              icon={<Target className="w-4 h-4" />}
              label="Track Clicks"
              status={campaign.trackClicks}
              desc="Track link interactions within emails"
            />
            <SettingItem
              icon={<ExternalLink className="w-4 h-4" />}
              label="Unsubscribe Link"
              status={campaign.unsubscribeLink}
              desc="Include mandatory opt-out option"
            />

            <div className="pt-8 mt-8 border-t border-slate-100">
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">
                    Campaign Status
                  </p>
                  <p className="text-[11px] font-medium text-indigo-700 leading-tight">
                    All settings verified. Campaign is optimized and ready.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, subValue, uppercase }) => (
  <div>
    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1.5">
      {label}
    </p>
    <p
      className={`text-sm font-bold text-slate-800 tracking-tight ${uppercase ? "uppercase" : ""}`}
    >
      {value}
    </p>
    {subValue && (
      <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
        {subValue}
      </p>
    )}
  </div>
);

const SettingItem = ({ icon, label, status, desc }) => (
  <div className="flex items-start gap-4 group">
    <div
      className={`p-3 rounded-xl transition-all duration-300 ${status ? "bg-emerald-50 text-emerald-600 scale-110 shadow-lg shadow-emerald-100" : "bg-slate-50 text-slate-400 opacity-50"}`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
          {label}
        </p>
        <span
          className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${status ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}
        >
          {status ? "Active" : "Disabled"}
        </span>
      </div>
      <p className="text-[10px] font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
        {desc}
      </p>
    </div>
  </div>
);

export default OverviewTab;
