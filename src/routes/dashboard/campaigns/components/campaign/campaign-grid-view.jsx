import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  if (campaigns.length === 0) {
    return (
      <div className="premium-card bg-white border-none p-20 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl shadow-slate-800/10">
        <div className="absolute top-0 ltr:left-1/2 ltr:right-1/2 rtl:left-1/2 -translate-x-1/2 w-125 h-75 bg-indigo-500/5 rounded-full blur-[100px] -mt-40"></div>

        <div className="relative mb-10">
          <div className="w-24 h-24 bg-linear-to-br from-blue-600 to-indigo-700 rounded-4xl flex items-center justify-center rotate-3 group hover:rotate-6 transition-transform duration-500 shadow-2xl shadow-indigo-500/20">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-2 -ltr:right-2 rtl:left-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
            <Target className="w-4 h-4 text-white" />
          </div>
        </div>

        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter mb-4">
          {t('campaigns.no_campaigns_found')}
        </h3>
        <p className="text-sm font-medium text-slate-400 max-w-sm mb-10 leading-relaxed">
          {searchTerm
            ? t('campaigns.no_matches')
            : t('campaigns.empty_creation_hint')}
        </p>

        <Link
          to={'/dashboard/campaigns/create'}
          className="btn-primary py-4 px-10 flex items-center gap-4 shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-white font-extrabold uppercase tracking-widest text-xs"
        >
          <Plus className="w-5 h-5 text-white" />
          {t('campaigns.create_campaign')}
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
            className={`group relative flex flex-col bg-white rounded-3xl border border-slate-200/60 transition-all duration-300 hover:shadow-xl hover:shadow-slate-800/5 hover:-translate-y-1 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-indigo-500/10' : ''
              }`}
          >


            {/* Top Right Selection Checkbox - Integrated */}
            <div className={`absolute top-5 ltr:right-5 rtl:left-5 z-20 transition-opacity duration-300 ${isSelected || selectedCampaigns.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSelectCampaign(campaign.id)}
                className="w-5 h-5 text-indigo-600 rounded-lg border-slate-200 shadow-sm focus:ring-indigo-500 cursor-pointer bg-white/50 backdrop-blur-md transition-all hover:scale-110"
                disabled={isAnyLoading}
              />
            </div>

            <div className="p-6 relative z-10 flex flex-col h-full">
              {/* Header Section */}
              <div className="flex items-start gap-4 mb-6 ltr:pr-8 rtl:pl-8">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center transition-all duration-300">
                    <Send className="w-5 h-5 text-indigo-600" />
                  </div>
                  {campaign.status === 'running' && (
                    <div className="absolute -bottom-1 -ltr:right-1 rtl:left-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5 pt-0.5">
                    {campaign.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border shadow-xs transition-all duration-500 ${color.replace('bg-', 'text-').replace('-100', '-600').replace('-50', '-100')} border-current/20 bg-${color.split('-')[1]}-50/50 backdrop-blur-sm`}
                    >
                      <span className="flex items-center gap-1.5">
                        {React.cloneElement(icon, { className: 'w-2.5 h-2.5' })}
                        {label}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Surface - Sleek Glassmorphic Design */}
              <div className="mb-6 group/progress transition-all duration-300">
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-400'}`}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Overall Progress
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 tracking-tight tabular-nums flex items-baseline">
                    {progress}
                    <span className="text-[10px] text-slate-500 ltr:ml-0.5 ltr:mr-0.5 rtl:ml-0.5 font-semibold">%</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden transition-all duration-300">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                    className={`h-full relative rounded-full transition-all duration-300 ${campaign.status === 'running'
                      ? 'bg-emerald-500'
                      : 'bg-indigo-500'
                      }`}
                  >
                  </motion.div>
                </div>
              </div>

              {/* Stats Grid - Vibrant Multi-colored Cards */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-8 mt-2">
                {[
                  {
                    label: t('analytics.recipients'),
                    value: campaign.totalRecipients,
                    icon: Target,
                    theme: 'indigo',
                  },
                  { label: t('analytics.sent'), value: campaign.totalSent, icon: Send, theme: 'blue' },
                  { label: t('analytics.open_rate'), value: openRate, icon: BarChart3, theme: 'violet' },
                  { label: t('analytics.click_rate'), value: clickRate, icon: MousePointer2, theme: 'rose' },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col group/stat"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-5 h-5 rounded-md bg-${stat.theme}-50/50 flex flex-shrink-0 items-center justify-center`}>
                        <stat.icon
                          className={`w-3 h-3 text-${stat.theme}-500`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none truncate">
                        {stat.label}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-bold tracking-tight text-slate-800 tabular-nums">
                        {stat.value?.toLocaleString() || '0'}
                      </span>
                      {stat.theme === 'violet' || stat.theme === 'rose' ? (
                        stat.value !== '-' && <span className="text-[11px] font-semibold text-slate-400">%</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Intelligence Tray */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-100/80 mt-auto">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {t('campaigns.campaign_date')}
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700 tracking-tight">
                    {campaign.status === 'scheduled'
                      ? formatDateTime(campaign.scheduledAt)
                      : campaign.status === 'draft'
                        ? formatDate(campaign.createdAt)
                        : formatDate(campaign.scheduledAt || campaign.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleActivateCampaign(campaign.id)}
                      disabled={isLoadingAction.activate}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                      title={t('common.activate')}
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
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all active:scale-90"
                      title={t('common.pause')}
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
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                      title={t('common.resume')}
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
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-500 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                    title={t('analytics.view_analytics')}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(campaign)}
                    disabled={isLoadingAction.delete}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                    title={t('common.delete')}
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
