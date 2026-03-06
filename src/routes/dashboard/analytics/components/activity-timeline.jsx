import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import CustomTooltip from './custom-tooltip';

const ActivityTimeline = ({ data, hasValidData }) => {
  const { t } = useTranslation();
  const [timelineFilter, setTimelineFilter] = useState('7');

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // The data is assumed to be ordered chronologically.
    // We just take the last N items based on the filter.
    const daysToKeep = parseInt(timelineFilter, 10);
    return data.slice(-daysToKeep);
  }, [data, timelineFilter]);

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
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
                {t('analytics.emails_sent', 'EMAILS SENT')}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
                {t('analytics.total_replies', 'TOTAL REPLIES')}
              </span>
            </div>
          </div>

          <div className="relative inline-block text-left">
            <select
              value={timelineFilter}
              onChange={(e) => setTimelineFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 ltr:pl-4 ltr:pr-10 rtl:pr-4 rtl:pl-10 rounded-full text-[10px] uppercase tracking-widest font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hover:bg-white transition-colors"
            >
              <option value="7">LAST 7 DAYS</option>
              <option value="30">LAST 30 DAYS</option>
              <option value="90">LAST 90 DAYS</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center px-3 text-slate-400">
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      <div className="h-80 w-full relative">
        {hasValidData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{
                top: 40,
                right: 30,
                left: -20,
                bottom: 0,
              }}
              barGap={4}
              barSize={8}
            >
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={1} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="8 8" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  try {
                    // Try parsing the date assuming it's ISO or a standard string
                    const dateObj = new Date(value);
                    if (isNaN(dateObj.getTime())) return value;
                    return format(dateObj, 'MMM d');
                  } catch (e) {
                    return value;
                  }
                }}
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
              <Bar
                dataKey="sent"
                fill="url(#colorSent)"
                name={t('analytics.sent')}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="replies"
                fill="url(#colorReplies)"
                name={t('analytics.replies')}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
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
