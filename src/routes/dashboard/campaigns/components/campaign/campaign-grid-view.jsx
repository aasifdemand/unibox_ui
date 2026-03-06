import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

import {
  Calendar,
  Loader2,
  Pause,
  Play,
  Plus,
  Send,
  Trash2,
  Zap,
  Target,
  BarChart3,
  MousePointer2,
  MessageCircle,
  ArrowUpRight,
} from 'lucide-react';
import {
  calculateClickRate,
  calculateOpenRate,
  calculateProgress,
  calculateReplyRate,
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
      <div className="bg-white rounded-3xl p-20 text-center flex flex-col items-center justify-center relative overflow-hidden border border-slate-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-75 bg-indigo-500/5 rounded-full blur-[100px] -mt-40"></div>

        <div className="relative mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-4xl flex items-center justify-center rotate-3 hover:rotate-6 transition-transform duration-500 shadow-2xl shadow-indigo-500/20">
            <Zap className="w-10 h-10 text-white" />
          </div>
        </div>

        <h3 className="text-2xl font-extrabold text-slate-800 tracking-tighter mb-3">
          {t('campaigns.no_campaigns_found')}
        </h3>
        <p className="text-sm font-medium text-slate-400 max-w-sm mb-10 leading-relaxed">
          {searchTerm
            ? t('campaigns.no_matches')
            : t('campaigns.empty_creation_hint')}
        </p>

        <Link
          to={'/dashboard/campaigns/create'}
          className="btn-primary py-3 px-8 flex items-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-white font-extrabold uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4 text-white" />
          {t('campaigns.create_campaign')}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {campaigns.map((campaign) => {
        const { label, color, icon } = getStatusInfo(campaign.status);
        const progress = calculateProgress(campaign);
        const openRate = calculateOpenRate(campaign);
        const clickRate = calculateClickRate(campaign);
        const replyRate = calculateReplyRate(campaign);
        const isSelected = selectedCampaigns.includes(campaign.id);

        const statusColors = {
          draft: { dot: 'bg-slate-400', bar: 'from-slate-300 to-slate-400' },
          scheduled: { dot: 'bg-amber-400', bar: 'from-amber-400 to-orange-400' },
          running: { dot: 'bg-emerald-500', bar: 'from-emerald-400 to-teal-500' },
          sending: { dot: 'bg-emerald-500', bar: 'from-emerald-400 to-teal-500' },
          completed: { dot: 'bg-blue-500', bar: 'from-blue-400 to-indigo-500' },
          paused: { dot: 'bg-rose-400', bar: 'from-rose-400 to-pink-500' },
        };
        const sc = statusColors[campaign.status] || statusColors.draft;

        return (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`group relative flex flex-col bg-white rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/8 hover:-translate-y-0.5 overflow-hidden ${isSelected
              ? 'border-indigo-400 ring-2 ring-indigo-500/15 shadow-indigo-500/10'
              : 'border-slate-200/80 hover:border-slate-300'
              }`}
          >
            {/* Progress stripe along top */}
            <div className="h-1 w-full bg-slate-100 overflow-hidden flex-shrink-0">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: 'circOut', delay: 0.3 }}
                className={`h-full bg-gradient-to-r ${sc.bar}`}
              />
            </div>

            {/* Checkbox */}
            <div className={`absolute top-5 ltr:right-5 rtl:left-5 z-20 transition-opacity duration-200 ${isSelected || selectedCampaigns.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSelectCampaign(campaign.id)}
                className="w-4.5 h-4.5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
                disabled={isAnyLoading}
              />
            </div>

            <div className="p-6 flex flex-col flex-1">
              {/* Header */}
              <div className="flex items-start gap-4 mb-5 ltr:pr-6 rtl:pl-6">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Send className="w-4.5 h-4.5 text-white" />
                  </div>
                  {campaign.status === 'running' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-black text-slate-800 tracking-tight line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
                    {campaign.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} inline-block`} />
                      {label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject */}
              {campaign.subject && (
                <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-5 px-1 border-l-2 border-slate-200 ltr:pl-3 rtl:pr-3">
                  {campaign.subject}
                </p>
              )}

              {/* Metrics Grid - 2×2 */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: t('analytics.recipients'), value: campaign.totalRecipients?.toLocaleString() || '0', icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
                  { label: t('analytics.sent'), value: campaign.totalSent?.toLocaleString() || '0', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: t('analytics.open_rate'), value: openRate, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: t('analytics.click_rate'), value: clickRate, icon: MousePointer2, color: 'text-orange-500', bg: 'bg-orange-50' },
                ].map((m, i) => (
                  <div key={i} className="flex flex-col bg-slate-50/60 rounded-2xl px-3.5 pt-3 pb-2.5 border border-slate-100/80">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-5 h-5 rounded-md ${m.bg} flex items-center justify-center flex-shrink-0`}>
                        <m.icon className={`w-3 h-3 ${m.color}`} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none truncate">{m.label}</span>
                    </div>
                    <span className="text-xl font-black text-slate-800 tabular-nums tracking-tight">{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Reply Rate Banner */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100/60 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-widest">{t('analytics.reply_rate')}</span>
                </div>
                <span className="text-sm font-black text-indigo-700 tabular-nums">{replyRate}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-500">
                    {campaign.status === 'scheduled'
                      ? formatDateTime(campaign.scheduledAt)
                      : formatDate(campaign.scheduledAt || campaign.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleActivateCampaign(campaign.id)}
                      disabled={isLoadingAction.activate}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                      title={t('common.activate')}
                    >
                      {isLoadingAction.activate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {campaign.status === 'running' && (
                    <button
                      onClick={() => handlePauseCampaign(campaign.id)}
                      disabled={isLoadingAction.pause}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all active:scale-90"
                      title={t('common.pause')}
                    >
                      {isLoadingAction.pause ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {campaign.status === 'paused' && (
                    <button
                      onClick={() => handleResumeCampaign(campaign.id)}
                      disabled={isLoadingAction.resume}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                      title={t('common.resume')}
                    >
                      {isLoadingAction.resume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  <button
                    onClick={() => handleViewCampaign(campaign.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                    title={t('analytics.view_analytics')}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(campaign)}
                    disabled={isLoadingAction.delete}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                    title={t('common.delete')}
                  >
                    {isLoadingAction.delete ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CampaignGridView;
