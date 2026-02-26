import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, Loader2, Send } from 'lucide-react';

const TopCampaigns = ({ campaigns, isLoading }) => {
  const { t } = useTranslation();
  return (
    <div className="premium-card p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {t('analytics.top_campaigns_title')} <span className="text-blue-500">{t('analytics.campaigns_span')}</span>
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {t('analytics.campaigns_subtitle')}
          </p>
        </div>
        <Link
          to="/dashboard/campaigns"
          className="btn-secondary py-2 px-4 text-[10px] font-extrabold uppercase tracking-widest shadow-xs flex items-center gap-2"
        >
          {t('common.view_all')} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {t('analytics.loading_campaigns')}
          </p>
        </div>
      ) : campaigns?.length > 0 ? (
        <div className="space-y-4 flex-1">
          {campaigns.map((campaign, index) => (
            <Link
              key={campaign.id}
              to={`/dashboard/campaigns/${campaign.id}`}
              className="group block p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="w-10 h-10 shrink-0 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-blue-600 font-extrabold text-xs shadow-xs group-hover:scale-110 transition-transform">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 truncate pe-4 text-sm group-hover:text-blue-600 transition-colors">
                      {campaign.name}
                    </h4>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        {t('analytics.sent')}
                      </p>
                      <p className="text-xs font-extrabold text-slate-700 tabular-nums">
                        {campaign.totalSent > 1000
                          ? `${(campaign.totalSent / 1000).toFixed(1)}k`
                          : campaign.totalSent}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        {t('analytics.replies')}
                      </p>
                      <p className="text-xs font-extrabold text-emerald-600 tabular-nums">
                        {campaign.totalReplied}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        {t('analytics.reply_rate')}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-blue-600 tabular-nums">
                          {Math.round(campaign.replyRate || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-200 shadow-inner">
            <Send className="w-8 h-8 text-slate-300" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-800 mb-1">{t('analytics.no_campaigns_yet')}</h4>
          <p className="text-xs text-slate-500 font-medium">
            {t('analytics.no_campaigns_description')}
          </p>
        </div>
      )}
    </div>
  );
};

export default TopCampaigns;
