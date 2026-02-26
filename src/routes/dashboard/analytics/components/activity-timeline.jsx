import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import CustomTooltip from './custom-tooltip';

const ActivityTimeline = ({ data, hasValidData }) => {
  const { t } = useTranslation();
  console.log(data);

  return (
    <div className="premium-card p-8 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            {t('analytics.campaign_activity_title')} <span className="text-blue-500">{t('analytics.activity_span')}</span>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {t('analytics.activity_subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-6 p-2 bg-slate-50 rounded-2xl border border-slate-100/50">
          <div className="flex items-center gap-2 px-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
              {t('analytics.sent')}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-2 px-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
              {t('analytics.replies')}
            </span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full relative">
        {hasValidData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 40,
                right: 30,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="8 8" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                dy={10}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
              />
              <Tooltip
                cursor={{
                  stroke: '#e2e8f0',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                  fill: 'transparent',
                }}
                content={<CustomTooltip />}
              />
              <Area
                type="linear"
                dataKey="sent"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSent)"
                name={t('analytics.sent')}
                activeDot={{ r: 6, strokeWidth: 0 }}
                dot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#3B82F6' }}
              />
              <Area
                type="linear"
                dataKey="replies"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorReplies)"
                name={t('analytics.replies')}
                activeDot={{ r: 6, strokeWidth: 0 }}
                dot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#10B981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <span className="w-8 h-8 opacity-20 block bg-slate-300 rounded-md"></span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
              {t('analytics.loading_activity')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
