import React from 'react';
import { Calendar, CheckCircle, FileEdit, Layers, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const CampaignStats = ({
  totalCampaigns,
  activeCampaigns,
  scheduledCampaigns,
  draftCampaigns,
  completedCampaigns,
}) => {
  const stats = [
    {
      label: 'Total Campaigns',
      value: totalCampaigns,
      icon: <Layers className="w-5 h-5" />,
      theme: 'indigo',
      description: 'ALL CAMPAIGNS',
    },
    {
      label: 'Active',
      value: activeCampaigns,
      icon: <Zap className="w-5 h-5" />,
      theme: 'emerald',
      description: 'CURRENTLY RUNNING',
    },
    {
      label: 'Scheduled',
      value: scheduledCampaigns,
      icon: <Calendar className="w-5 h-5" />,
      theme: 'amber',
      description: 'SCHEDULED',
    },
    {
      label: 'Drafts',
      value: draftCampaigns,
      icon: <FileEdit className="w-5 h-5" />,
      theme: 'slate',
      description: 'IN PROGRESS',
    },
    {
      label: 'Completed',
      value: completedCampaigns,
      icon: <CheckCircle className="w-5 h-5" />,
      theme: 'blue',
      description: 'FINISHED',
    },
  ];

  const themes = {
    indigo: 'bg-indigo-50/50 border-indigo-100 text-indigo-600 shadow-indigo-500/5',
    emerald: 'bg-emerald-50/50 border-emerald-100 text-emerald-600 shadow-emerald-500/5',
    amber: 'bg-amber-50/50 border-amber-100 text-amber-600 shadow-amber-500/5',
    slate: 'bg-slate-50/50 border-slate-100 text-slate-600 shadow-slate-500/5',
    blue: 'bg-blue-50/50 border-blue-100 text-blue-600 shadow-blue-500/5',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] }}
          className={`premium-card p-6 border transition-all duration-300 hover:shadow-xl hover:translate-y-1 ${themes[stat.theme]}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl bg-white/80 shadow-sm`}>{stat.icon}</div>
            <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] opacity-40">
              {stat.description}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-60 mb-1">
              {stat.label}
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter tabular-nums">
              {stat.value}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CampaignStats;
