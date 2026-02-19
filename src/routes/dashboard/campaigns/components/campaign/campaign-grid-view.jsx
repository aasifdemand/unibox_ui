import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Edit,
  Eye,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Send,
  Trash2,
  Zap,
  Target,
  BarChart3,
  MousePointer2,
} from "lucide-react";
import {
  calculateClickRate,
  calculateOpenRate,
  calculateProgress,
  formatDate,
  formatDateTime,
  getStatusInfo,
} from "../../campaign-utils";

const CampaignGridView = ({
  campaigns,
  selectedCampaigns,
  handleSelectCampaign,
  isAnyLoading,
  handleActivateCampaign,
  handlePauseCampaign,
  handleResumeCampaign,
  handleViewCampaign,
  handleDeleteClick,
  isLoadingAction,
  searchTerm,
}) => {
  if (campaigns.length === 0) {
    return (
      <div className="premium-card bg-white border-none p-20 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl shadow-slate-800/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-75 bg-indigo-500/5 rounded-full blur-[100px] -mt-40"></div>

        <div className="relative mb-10">
          <div className="w-24 h-24 bg-linear-to-br from-blue-600 to-indigo-700 rounded-4xl flex items-center justify-center rotate-3 group hover:rotate-6 transition-transform duration-500 shadow-2xl shadow-indigo-500/20">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
            <Target className="w-4 h-4 text-white" />
          </div>
        </div>

        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter mb-4">
          No Campaigns Found
        </h3>
        <p className="text-sm font-medium text-slate-400 max-w-sm mb-10 leading-relaxed">
          {searchTerm
            ? "No campaigns match your search criteria."
            : "Get started by creating your first email campaign."}
        </p>

        <Link
          to={"/dashboard/campaigns/create"}
          className="btn-primary py-4 px-10 flex items-center gap-4 shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-white font-extrabold uppercase tracking-widest text-xs"
        >
          <Plus className="w-5 h-5 text-white" />
          Create Campaign
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {campaigns.map((campaign) => {
        const { label, color, icon } = getStatusInfo(campaign.status);
        const progress = calculateProgress(campaign);
        const openRate = calculateOpenRate(campaign);
        const clickRate = calculateClickRate(campaign);
        const isSelected = selectedCampaigns.includes(campaign.id);

        return (
          <div
            key={campaign.id}
            className={`group relative overflow-hidden premium-card bg-white border-slate-200/60 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/8 ${
              isSelected ? "border-indigo-500 ring-4 ring-indigo-500/5" : ""
            }`}
          >
            {/* Status Indicator Bar */}
            <div
              className={`absolute top-0 left-0 w-full h-1 ${
                campaign.status === "running"
                  ? "bg-emerald-500"
                  : campaign.status === "paused"
                    ? "bg-amber-500"
                    : campaign.status === "completed"
                      ? "bg-indigo-500"
                      : "bg-slate-300"
              }`}
            ></div>

            <div className="p-7">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectCampaign(campaign.id)}
                        className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        disabled={isAnyLoading}
                      />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 border ${color.replace("bg-", "text-").replace("-100", "-600").replace("-50", "-100")}`}
                    >
                      {icon}
                      {label}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {campaign.name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 line-clamp-1">
                    {campaign.subject || "No Subject"}
                  </p>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                    Progress
                  </span>
                  <span className="text-sm font-extrabold text-slate-800 tabular-nums">
                    {progress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      campaign.status === "running"
                        ? "bg-emerald-500"
                        : "bg-indigo-600"
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Recipients
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 tracking-tighter">
                    {campaign.totalRecipients?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Open Rate
                    </span>
                    <BarChart3 className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="text-sm font-extrabold text-indigo-600 tracking-tighter tabular-nums">
                    {openRate}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Send className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Sent
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 tracking-tighter">
                    {campaign.totalSent?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Click Rate
                    </span>
                    <MousePointer2 className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="text-sm font-extrabold text-indigo-600 tracking-tighter tabular-nums">
                    {clickRate}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100/60">
                <div className="flex flex-col">
                  <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-[0.2em]">
                    Date
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {campaign.status === "scheduled"
                      ? formatDateTime(campaign.scheduledAt)
                      : campaign.status === "draft"
                        ? formatDate(campaign.createdAt)
                        : formatDate(
                            campaign.scheduledAt || campaign.createdAt,
                          )}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {campaign.status === "draft" && (
                    <button
                      onClick={() => handleActivateCampaign(campaign.id)}
                      disabled={isLoadingAction.activate}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                      title="Activate Campaign"
                    >
                      {isLoadingAction.activate &&
                      isLoadingAction.variables === campaign.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {campaign.status === "running" && (
                    <button
                      onClick={() => handlePauseCampaign(campaign.id)}
                      disabled={isLoadingAction.pause}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all active:scale-90"
                      title="Pause Campaign"
                    >
                      {isLoadingAction.pause &&
                      isLoadingAction.variables === campaign.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {campaign.status === "paused" && (
                    <button
                      onClick={() => handleResumeCampaign(campaign.id)}
                      disabled={isLoadingAction.resume}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                      title="Resume Campaign"
                    >
                      {isLoadingAction.resume &&
                      isLoadingAction.variables === campaign.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleViewCampaign(campaign.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    title="View Analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(campaign)}
                    disabled={isLoadingAction.delete}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    title="Delete Campaign"
                  >
                    {isLoadingAction.delete &&
                    isLoadingAction.variables === campaign.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CampaignGridView;
