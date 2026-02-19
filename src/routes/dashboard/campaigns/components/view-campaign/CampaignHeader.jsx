import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Edit,
  Trash2,
  Play,
  Pause,
  Download,
  Loader2,
  Rocket,
  ShieldCheck,
  Layout,
} from "lucide-react";

const CampaignHeader = ({
  campaign,
  previews,
  actions,
  setShowDeleteModal,
  getStatusBadge,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-6">
        <Link
          to="/dashboard/campaigns"
          className="group relative w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 active:scale-95"
          title="Back to Campaigns"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              {previews.campaignName}
            </h1>
            <div className="scale-110 origin-left">
              {getStatusBadge(campaign.status)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Subject:
            </span>
            <p className="text-sm font-bold text-slate-500 tracking-tight">
              {previews.subject}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Action buttons based on status */}
        {campaign.status === "draft" && (
          <button
            onClick={actions.handleActivate}
            disabled={actions.activate.isPending}
            className="btn-primary py-3 px-8 flex items-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-white font-black uppercase tracking-widest text-[11px]"
          >
            {actions?.activate?.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            Start Campaign
          </button>
        )}

        {campaign.status === "running" && (
          <button
            onClick={actions.handlePause}
            disabled={actions.pause.isPending}
            className="py-3 px-8 flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
          >
            {actions.pause.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            Pause
          </button>
        )}

        {campaign.status === "paused" && (
          <button
            onClick={actions.handleResume}
            // disabled={actions?.resume?.isPending}
            className="btn-primary py-3 px-8 flex items-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-white font-black uppercase tracking-widest text-[11px]"
          >
            {actions?.resume?.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Resume
          </button>
        )}

        {(campaign.status === "draft" || campaign.status === "paused") && (
          <Link
            to={`/dashboard/campaigns/${campaign.id}/edit`}
            className="h-12 px-6 flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        )}

        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={actions.delete.isPending}
          className="h-12 px-6 flex items-center gap-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/30 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
        >
          {actions.delete.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Delete
        </button>

        <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl transition-all shadow-sm">
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CampaignHeader;
