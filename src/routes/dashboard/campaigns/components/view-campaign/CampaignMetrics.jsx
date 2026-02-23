import React from "react";
import { Users, Send, Mail, MessageCircle, Zap } from "lucide-react";

const CampaignMetrics = ({ campaign, stats }) => {
  const metrics = [

    {
      label: "Total Recipients",
      value: stats.totalRecipients,
      icon: <Users className="w-5 h-5" />,
      theme: "indigo",
      description:
        campaign.ListUploadBatch?.originalFilename || "Recipient List",
      subLabel: "Total Reach",
    },
    {
      label: "Emails Sent",
      value: stats.totalSent,
      icon: <Send className="w-5 h-5" />,
      theme: "emerald",
      description: `${stats.progress}% Completed`,
      subLabel: "Current Status",
    },
    {
      label: "Total Opens",
      value: stats.totalOpened,
      icon: <Mail className="w-5 h-5" />,
      theme: "purple",
      description: stats.totalSent
        ? `${Math.round((stats.totalOpened / stats.totalSent) * 100)}% Open Rate`
        : "0% Open Rate",
      subLabel: "Engagement",
    },
    {
      label: "Total Replies",
      value: stats.totalReplied,
      icon: <MessageCircle className="w-5 h-5" />,
      theme: "amber",
      description: stats.totalSent
        ? `${Math.round((stats.totalReplied / stats.totalSent) * 100)}% Reply Rate`
        : "0% Reply Rate",
      subLabel: "Responses",
    },
  ];

  const themes = {
    indigo:
      "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-200/50 hover:bg-indigo-50/50",
    emerald:
      "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/50 hover:bg-emerald-50/50",
    purple:
      "from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/50 hover:bg-purple-50/50",
    amber:
      "from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/50 hover:bg-amber-50/50",
  };

  const iconColors = {
    indigo: "bg-indigo-600 shadow-indigo-200",
    emerald: "bg-emerald-600 shadow-emerald-200",
    purple: "bg-purple-600 shadow-purple-200",
    amber: "bg-amber-600 shadow-amber-200",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {metrics?.map((metric, index) => (
        <div
          key={index}
          className={`premium-card p-7 border-none bg-linear-to-br ${themes[metric.theme]} transition-all duration-500 hover:shadow-2xl hover:translate-y-1 group`}
        >
          <div className="flex items-start justify-between mb-8">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block group-hover:text-slate-900 transition-colors">
                {metric.label}
              </span>
              <span
                className={`text-[8px] font-bold uppercase tracking-widest ${metric.theme === "indigo" ? "text-indigo-500" : metric.theme === "emerald" ? "text-emerald-500" : metric.theme === "purple" ? "text-purple-500" : "text-amber-500"}`}
              >
                {metric.subLabel}
              </span>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${iconColors[metric.theme]} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
            >
              {metric.icon}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
              {metric.value.toLocaleString()}
            </h4>
            <div className="flex items-center gap-2 pt-2">
              <Zap
                className={`w-3 h-3 ${metric.theme === "indigo" ? "text-indigo-400" : metric.theme === "emerald" ? "text-emerald-400" : metric.theme === "purple" ? "text-purple-400" : "text-amber-400"}`}
              />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {metric.description}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CampaignMetrics;
