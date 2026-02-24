import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Calendar,
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
} from 'lucide-react';
import {
  calculateClickRate,
  calculateOpenRate,
  calculateProgress,
  formatDate,
  formatDateTime,
  getStatusInfo,
} from '../../campaign-utils';

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
            ? 'No campaigns match your search criteria.'
            : 'Get started by creating your first email campaign.'}
        </p>

        <Link
          to={'/dashboard/campaigns/create'}
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
              isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/5' : ''
            }`}
          >
            {/* Status Indicator Bar */}
            <div
              className={`absolute top-0 left-0 w-full h-1 ${
                campaign.status === 'running'
                  ? 'bg-emerald-500'
                  : campaign.status === 'paused'
                    ? 'bg-amber-500'
                    : campaign.status === 'completed'
                      ? 'bg-indigo-500'
                      : 'bg-slate-300'
              }`}
            ></div>

            {/* Ambient Glow Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full -ml-12 -mb-12 blur-2xl group-hover:bg-blue-500/10 transition-colors duration-700"></div>

            <div className="p-7 relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -left-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectCampaign(campaign.id)}
                        className="w-5 h-5 text-indigo-600 rounded-lg border-white shadow-xl focus:ring-indigo-500 cursor-pointer bg-white"
                        disabled={isAnyLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                      {campaign.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 border transition-all duration-300 ${color.replace('bg-', 'text-').replace('-100', '-600').replace('-50', '-100')} border-current bg-transparent`}
                      >
                        {icon}
                        {label}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all active:scale-95">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Surface */}
              <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/50 mb-8 group/progress hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full animate-pulse ${campaign.status === 'running' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-indigo-500'}`}
                    ></div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Progress
                    </span>
                  </div>
                  <span className="text-lg font-black text-slate-800 tracking-tighter tabular-nums">
                    {progress}
                    <span className="text-[10px] text-slate-400 ml-0.5">%</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20 group-hover/progress:h-4 transition-all duration-500">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                    className={`h-full relative transition-all duration-300 ${
                      campaign.status === 'running'
                        ? 'bg-linear-to-r from-emerald-400 to-emerald-600'
                        : 'bg-linear-to-r from-blue-500 to-indigo-600'
                    }`}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_3s_infinite]"></div>
                  </motion.div>
                </div>
              </div>

              {/* Advanced Intelligence Stats */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  {
                    label: 'Recipients',
                    value: campaign.totalRecipients,
                    icon: Target,
                    rate: null,
                  },
                  { label: 'Sent', value: campaign.totalSent, icon: Send, rate: null },
                  { label: 'Open Rate', value: openRate, icon: BarChart3, rate: true },
                  { label: 'Click Rate', value: clickRate, icon: MousePointer2, rate: true },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 border border-slate-100 group/stat hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center group-hover/stat:bg-indigo-50 transition-colors">
                        <stat.icon
                          className={`w-3 h-3 ${stat.rate ? 'text-indigo-500' : 'text-slate-400'}`}
                        />
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                        {stat.label}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-black tracking-tight tabular-nums ${stat.rate ? 'text-indigo-600' : 'text-slate-800'}`}
                    >
                      {stat.value?.toLocaleString() || '0'}
                      {stat.rate && stat.value !== '-' && (
                        <span className="ml-0.5 text-[10px] opacity-70">%</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom Actions Intelligence */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100/60 mt-auto">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Date
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-600 tracking-tight">
                    {campaign.status === 'scheduled'
                      ? formatDateTime(campaign.scheduledAt)
                      : campaign.status === 'draft'
                        ? formatDate(campaign.createdAt)
                        : formatDate(campaign.scheduledAt || campaign.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100/50">
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleActivateCampaign(campaign.id)}
                      disabled={isLoadingAction.activate}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-slate-400 hover:text-emerald-600 hover:shadow-lg hover:shadow-emerald-500/10 transition-all active:scale-90 border border-transparent hover:border-emerald-100"
                      title="Activate Campaign"
                    >
                      {isLoadingAction.activate && isLoadingAction.variables === campaign.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {campaign.status === 'running' && (
                    <button
                      onClick={() => handlePauseCampaign(campaign.id)}
                      disabled={isLoadingAction.pause}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-slate-400 hover:text-amber-600 hover:shadow-lg hover:shadow-amber-500/10 transition-all active:scale-90 border border-transparent hover:border-amber-100"
                      title="Pause Campaign"
                    >
                      {isLoadingAction.pause && isLoadingAction.variables === campaign.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {campaign.status === 'paused' && (
                    <button
                      onClick={() => handleResumeCampaign(campaign.id)}
                      disabled={isLoadingAction.resume}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-slate-400 hover:text-emerald-600 hover:shadow-lg hover:shadow-emerald-500/10 transition-all active:scale-90 border border-transparent hover:border-emerald-100"
                      title="Resume Campaign"
                    >
                      {isLoadingAction.resume && isLoadingAction.variables === campaign.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleViewCampaign(campaign.id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-indigo-500 hover:text-indigo-700 hover:shadow-lg hover:shadow-indigo-500/10 transition-all border border-transparent hover:border-indigo-100"
                    title="View Analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(campaign)}
                    disabled={isLoadingAction.delete}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-slate-400 hover:text-rose-600 hover:shadow-lg hover:shadow-rose-500/10 transition-all border border-transparent hover:border-rose-100"
                    title="Delete Campaign"
                  >
                    {isLoadingAction.delete && isLoadingAction.variables === campaign.id ? (
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
