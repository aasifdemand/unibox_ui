import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckCircle, Layers, Zap, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const CampaignStats = ({
  totalCampaigns,
  activeCampaigns,
  scheduledCampaigns,
  completedCampaigns,
}) => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('campaigns.stats_total'),
      value: totalCampaigns ?? 0,
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      bgColor: 'bg-indigo-50',
      color: 'from-indigo-500 to-blue-600',
      description: t('campaigns.desc_all'),
      trend: 'up',
      change: totalCampaigns > 0 ? `${totalCampaigns}` : '0',
    },
    {
      title: t('campaigns.status_active'),
      value: activeCampaigns ?? 0,
      icon: <Zap className="w-5 h-5 text-emerald-600" />,
      bgColor: 'bg-emerald-50',
      color: 'from-emerald-500 to-teal-600',
      description: t('campaigns.desc_running'),
      trend: activeCampaigns > 0 ? 'up' : 'idle',
      change: activeCampaigns > 0 ? `${activeCampaigns}` : '0',
    },
    {
      title: t('campaigns.status_scheduled'),
      value: scheduledCampaigns ?? 0,
      icon: <Calendar className="w-5 h-5 text-amber-600" />,
      bgColor: 'bg-amber-50',
      color: 'from-amber-500 to-orange-600',
      description: t('campaigns.desc_scheduled'),
      trend: scheduledCampaigns > 0 ? 'up' : 'idle',
      change: scheduledCampaigns > 0 ? `${scheduledCampaigns}` : '0',
    },
    {
      title: t('campaigns.status_completed'),
      value: completedCampaigns ?? 0,
      icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
      bgColor: 'bg-blue-50',
      color: 'from-blue-500 to-indigo-600',
      description: t('campaigns.desc_finished'),
      trend: completedCampaigns > 0 ? 'up' : 'idle',
      change: completedCampaigns > 0 ? `${completedCampaigns}` : '0',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="premium-card p-6 overflow-hidden relative group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          {/* Dynamic Decorative Elements */}
          <div
            className={`absolute -inset-inline-end-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] blur-2xl group-hover:opacity-10 transition-opacity bg-linear-to-br ${stat.color}`}
          ></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div
              className={`w-12 h-12 rounded-2xl ${stat.bgColor} border border-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-500`}
            >
              {stat.icon}
            </div>
            <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-1.5 transition-colors group-hover:bg-white group-hover:border-blue-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
                {t('analytics.stats')}
              </span>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-[0.15em]">
              {stat.title}
            </p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter tabular-nums leading-none">
                {stat.value.toString()}
              </h3>
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold mb-0.5 ${stat.trend === 'up' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 bg-slate-50'}`}
              >
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>

            <p className="text-xs text-slate-500 font-bold mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
              {stat.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CampaignStats;
