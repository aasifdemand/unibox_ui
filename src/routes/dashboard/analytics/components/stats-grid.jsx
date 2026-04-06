import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

const StatsGrid = ({ stats }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="premium-card p-6 overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-sm hover:shadow-slate-200/50 transition-all duration-500 border-b-4 border-slate-200/60 hover:border-purple-500/50"
        >
          {/* Dynamic Gradient Background - Always visible but subtle */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
          ></div>

          <div className="flex items-start justify-between mb-8 relative z-10">
            <div
              className={`w-12 h-12 rounded-lg ${stat.bgColor} border border-white/50 flex items-center justify-center shadow-sm shadow-slate-200/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
            >
              {stat.icon}
            </div>
            <div className="flex flex-col items-end">
              <div className="px-2 py-1 bg-white border border-slate-100/50 rounded-lg flex items-center gap-1.5 transition-colors group-hover:border-purple-100 mb-2 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
                  {t('analytics.stats')}
                </span>
              </div>
              {/* Small Sparkline SVG */}
              <div className="w-16 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 100 40" className="w-full h-full">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={stat.iconColor}
                    points={
                      stat.sparkline
                        ?.map((val, i) => `${i * (100 / (stat.sparkline.length - 1))},${40 - val}`)
                        .join(' ') || '0,0'
                    }
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-slate-500 mb-1">
              {stat.title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-slate-800 tracking-tighter tabular-nums leading-none group-hover:scale-105 transition-transform origin-left">
                {stat.value}
              </h3>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${stat.trend === 'up' ? 'text-purple-600 bg-purple-50' : 'text-slate-400 bg-slate-50'} group-hover:bg-white transition-colors shadow-xs`}
              >
                {stat.trend === 'up' ? '↑' : '↓'} {stat.change.split(' ')[0]}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-[11px] text-slate-500 font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                {stat.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
