import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MessageCircle, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

const MetricPulse = ({ metrics, overview }) => {
    const { t } = useTranslation();
    const openRate = overview?.avgOpenRate || 0;
    const replyRate = metrics?.replyRate || 0;
    const bounceRate = metrics?.bounceRate || 0;

    const data = [
        {
            label: t('analytics.open_rate'),
            value: openRate,
            icon: <Mail className="w-4 h-4" />,
            color: 'blue',
            status: openRate > 25 ? t('analytics.status_high') : openRate > 15 ? t('analytics.status_good') : t('analytics.status_low'),
        },
        {
            label: t('analytics.reply_rate'),
            value: replyRate,
            icon: <MessageCircle className="w-4 h-4" />,
            color: 'violet',
            status: replyRate > 3 ? t('analytics.status_elite') : replyRate > 1 ? t('analytics.status_healthy') : t('analytics.status_needs_focus'),
        },
        {
            label: t('analytics.bounce_rate'),
            value: bounceRate,
            icon: <AlertCircle className="w-4 h-4" />,
            color: 'rose',
            status: bounceRate < 2 ? t('analytics.status_minimal') : bounceRate < 5 ? t('analytics.status_stable') : t('analytics.status_needs_focus'),
        },
    ];

    return (
        <div className="premium-card p-8 h-full flex flex-col group">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t('analytics.metric_pulse_title')}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('analytics.metric_pulse_subtitle')}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100 shadow-xs">
                    <TrendingUp className="w-5 h-5" />
                </div>
            </div>

            <div className="space-y-8 flex-1">
                {data.map((item, idx) => (
                    <div key={idx} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                                    {item.icon}
                                </div>
                                <span className="text-sm font-bold text-slate-700">{item.label}</span>
                            </div>
                            <div className="text-end">
                                <span className="text-lg font-black text-slate-800">{item.value}%</span>
                                <p className={`text-[9px] font-black uppercase tracking-tighter text-${item.color}-600`}>{item.status}</p>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden p-px">
                            <div
                                className={`h-full bg-${item.color}-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.2)]`}
                                style={{ width: `${Math.min(100, item.value * (item.color === 'rose' ? 10 : 2))}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('analytics.live_system_pulse')}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
        </div>
    );
};

export default MetricPulse;
