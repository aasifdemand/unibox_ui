import React from 'react';
import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';

const OverallPerformance = ({ aggregates }) => {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden premium-card bg-white p-8 md:p-10">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 inset-inline-end-0 w-1/2 h-full bg-linear-to-inline-start from-purple-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-24 -inset-inline-start-24 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="max-w-xs shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-bold text-purple-400">
              {t('common.overview')}
            </span>
          </div>
          <h3 className="text-3xl font-bold tracking-tight mb-2 text-slate-800">
            {t('analytics.overall_performance_title')}{' '}
            <span className="text-purple-500">{t('analytics.overall_performance_span')}</span>
          </h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {t('analytics.overall_performance_description')}
          </p>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 leading-none mb-2">
                {t('analytics.sent')}
              </p>
              <p className="text-3xl font-bold tracking-tight tabular-nums text-slate-800">
                {aggregates.totalSent.toLocaleString()}
              </p>
              <div className="w-10 h-0.5 bg-purple-500"></div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 mb-2">
                {t('analytics.total_opens')}
              </p>
              <p className="text-3xl font-bold tracking-tight tabular-nums text-slate-800">
                {aggregates.totalOpens.toLocaleString()}
              </p>
              <div className="w-10 h-0.5 bg-purple-500"></div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 mb-2">
                {t('analytics.total_clicks')}
              </p>
              <p className="text-3xl font-bold tracking-tight tabular-nums text-slate-800">
                {aggregates.totalClicks.toLocaleString()}
              </p>
              <div className="w-10 h-0.5 bg-amber-500"></div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 mb-2">
                {t('analytics.replies')}
              </p>
              <p className="text-3xl font-bold tracking-tight tabular-nums text-slate-800">
                {aggregates.totalReplied.toLocaleString()}
              </p>
              <div className="w-10 h-0.5 bg-purple-500"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  {t('analytics.open_rate')}
                </p>
                <p className="text-xl font-bold text-purple-600 tabular-nums">
                  {aggregates.avgOpenRate}%
                </p>
              </div>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${aggregates.avgOpenRate}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  {t('analytics.click_rate')}
                </p>
                <p className="text-xl font-bold text-amber-500 tabular-nums">
                  {aggregates.avgClickRate}%
                </p>
              </div>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${aggregates.avgClickRate}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  {t('analytics.reply_rate')}
                </p>
                <p className="text-xl font-bold text-purple-500 tabular-nums">
                  {aggregates.avgReplyRate}%
                </p>
              </div>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${aggregates.avgReplyRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallPerformance;
