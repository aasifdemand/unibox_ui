import React from 'react';
import { Target } from 'lucide-react';

const OverallPerformance = ({ aggregates }) => {
  return (
    <div className="relative overflow-hidden premium-card bg-white p-8 md:p-10">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-blue-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="max-w-xs shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              Overview
            </span>
          </div>
          <h3 className="text-3xl font-black tracking-tighter mb-2 text-slate-800">
            Overall <span className="text-blue-500">Performance</span>
          </h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Key metrics across all your campaigns.
          </p>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                Total Sent
              </p>
              <p className="text-3xl font-black tracking-tight tabular-nums text-slate-800">
                {aggregates.totalSent.toLocaleString()}
              </p>
              <div className="w-10 h-0.5 bg-blue-500"></div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                Total Opens
              </p>
              <p className="text-3xl font-black tracking-tight tabular-nums text-slate-800">
                {aggregates.totalOpens.toLocaleString()}
              </p>
              <div className="w-10 h-0.5 bg-emerald-500"></div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                Total Clicks
              </p>
              <p className="text-3xl font-black tracking-tight tabular-nums text-slate-800">
                {aggregates.totalClicks.toLocaleString()}
              </p>
              <div className="w-10 h-0.5 bg-amber-500"></div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                Total Replies
              </p>
              <p className="text-3xl font-black tracking-tight tabular-nums text-slate-800">
                {aggregates.totalReplied.toLocaleString()}
              </p>
              <div className="w-10 h-0.5 bg-violet-500"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Open Rate
                </p>
                <p className="text-xl font-black text-blue-600 tabular-nums">
                  {aggregates.avgOpenRate}%
                </p>
              </div>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${aggregates.avgOpenRate}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Click Rate
                </p>
                <p className="text-xl font-black text-amber-500 tabular-nums">
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Reply Rate
                </p>
                <p className="text-xl font-black text-emerald-500 tabular-nums">
                  {aggregates.avgReplyRate}%
                </p>
              </div>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
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
