import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Send,
  Mail,
  MessageCircle,
  MousePointer2,
  AlertTriangle,
  UserMinus,
  Zap,
} from 'lucide-react';

const CampaignMetrics = ({ campaign, stats }) => {
  const { t } = useTranslation();
  const metrics = [
    {
      label: t('campaigns.metrics.total_recipients', 'Total Recipients'),
      value: stats.totalRecipients,
      icon: <Users className="w-5 h-5" />,
      theme: 'indigo',
      description: campaign.ListUploadBatch?.originalFilename || t('campaigns.metrics.recipient_list', 'Recipient List'),
      subLabel: t('campaigns.metrics.total_reach', 'Total Reach'),
    },
    {
      label: t('campaigns.metrics.emails_sent', 'Emails Sent'),
      value: stats.totalSent,
      icon: <Send className="w-5 h-5" />,
      theme: 'emerald',
      description: t('campaigns.metrics.completed_percent', { percent: stats.progress }),
      subLabel: t('campaigns.metrics.current_status', 'Current Status'),
    },
    {
      label: t('campaigns.metrics.total_opens', 'Total Opens'),
      value: stats.totalOpens,
      icon: <Mail className="w-5 h-5" />,
      theme: 'purple',
      description: stats.uniqueContacted
        ? t('campaigns.metrics.open_rate_percent', { percent: Math.round((stats.totalOpens / stats.uniqueContacted) * 100) })
        : t('campaigns.metrics.open_rate_percent', { percent: 0 }),
      subLabel: t('campaigns.metrics.engagement', 'Engagement'),
    },
    {
      label: t('campaigns.metrics.total_clicks', 'Total Clicks'),
      value: stats.totalClicks,
      icon: <MousePointer2 className="w-5 h-5" />,
      theme: 'blue',
      description: stats.uniqueContacted
        ? t('campaigns.metrics.click_rate_percent', { percent: Math.round((stats.totalClicks / stats.uniqueContacted) * 100) })
        : t('campaigns.metrics.click_rate_percent', { percent: 0 }),
      subLabel: t('campaigns.metrics.link_clicks', 'Link Clicks'),
    },
    {
      label: t('campaigns.metrics.total_replies', 'Total Replies'),
      value: stats.totalReplied,
      icon: <MessageCircle className="w-5 h-5" />,
      theme: 'amber',
      description: stats.uniqueContacted
        ? t('campaigns.metrics.reply_rate_percent', { percent: Math.round((stats.totalReplied / stats.uniqueContacted) * 100) })
        : t('campaigns.metrics.reply_rate_percent', { percent: 0 }),
      subLabel: t('campaigns.metrics.responses', 'Responses'),
    },
    {
      label: t('campaigns.metrics.bounced', 'Bounced'),
      value: stats.totalBounced || 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      theme: 'rose',
      description: stats.totalSent
        ? t('campaigns.metrics.bounce_rate_percent', { percent: Math.round(((stats.totalBounced || 0) / stats.totalSent) * 100) })
        : t('campaigns.metrics.bounce_rate_percent', { percent: 0 }),
      subLabel: t('campaigns.metrics.delivery_issues', 'Delivery Issues'),
    },
    {
      label: t('campaigns.metrics.unsubscribed', 'Unsubscribed'),
      value: stats.totalUnsubscribed || 0,
      icon: <UserMinus className="w-5 h-5" />,
      theme: 'slate',
      description: stats.totalSent
        ? t('campaigns.metrics.unsub_rate_percent', { percent: Math.round(((stats.totalUnsubscribed || 0) / stats.totalSent) * 100) })
        : t('campaigns.metrics.unsub_rate_percent', { percent: 0 }),
      subLabel: t('campaigns.metrics.opt_outs', 'Opt-Outs'),
    },
  ];

  const themes = {
    indigo:
      'from-orange-500/10 via-orange-500/5 to-transparent border-orange-200/50 hover:bg-orange-50/50',
    emerald:
      'from-orange-500/10 via-orange-500/5 to-transparent border-orange-200/50 hover:bg-orange-50/50',
    purple:
      'from-orange-500/10 via-orange-500/5 to-transparent border-orange-200/50 hover:bg-orange-50/50',
    blue: 'from-orange-500/10 via-orange-500/5 to-transparent border-orange-200/50 hover:bg-orange-50/50',
    amber:
      'from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/50 hover:bg-amber-50/50',
    rose: 'from-orange-500/10 via-orange-500/5 to-transparent border-orange-200/50 hover:bg-orange-50/50',
    slate:
      'from-slate-500/10 via-slate-500/5 to-transparent border-slate-200/50 hover:bg-slate-50/50',
  };

  const iconColors = {
    indigo: 'bg-orange-600 shadow-orange-200',
    emerald: 'bg-orange-600 shadow-orange-200',
    purple: 'bg-orange-600 shadow-orange-200',
    blue: 'bg-orange-600 shadow-orange-200',
    amber: 'bg-amber-600 shadow-amber-200',
    rose: 'bg-orange-500 shadow-orange-200',
    slate: 'bg-slate-500 shadow-slate-200',
  };

  const valueColors = {
    indigo: 'text-slate-900',
    emerald: 'text-slate-900',
    purple: 'text-slate-900',
    blue: 'text-slate-900',
    amber: 'text-slate-900',
    rose: 'text-orange-600',
    slate: 'text-slate-500',
  };

  const zapColors = {
    indigo: 'text-orange-400',
    emerald: 'text-orange-400',
    purple: 'text-orange-400',
    blue: 'text-orange-400',
    amber: 'text-amber-400',
    rose: 'text-orange-400',
    slate: 'text-slate-400',
  };

  const labelColors = {
    indigo: 'text-orange-500',
    emerald: 'text-orange-500',
    purple: 'text-orange-500',
    blue: 'text-orange-500',
    amber: 'text-amber-500',
    rose: 'text-orange-500',
    slate: 'text-slate-400',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`premium-card p-8 border-none bg-linear-to-br ${themes[metric.theme]} transition-all duration-500 hover:shadow-sm hover:-translate-y-1 group`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5 block group-hover:text-slate-900 transition-colors">
                {metric.label}
              </span>
              <span
                className={`text-[8px] font-bold uppercase tracking-widest ${labelColors[metric.theme]}`}
              >
                {metric.subLabel}
              </span>
            </div>
            <div
              className={`w-9 h-9 rounded-md flex items-center justify-center text-white shadow-sm ${iconColors[metric.theme]} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
            >
              {metric.icon}
            </div>
          </div>

          <div className="space-y-1">
            <h4
              className={`text-3xl font-black tracking-tighter tabular-nums leading-none ${valueColors[metric.theme]}`}
            >
              {metric.value.toLocaleString()}
            </h4>
            <div className="flex items-center gap-1.5 pt-1.5">
              <Zap className={`w-3 h-3 ${zapColors[metric.theme]}`} />
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
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
