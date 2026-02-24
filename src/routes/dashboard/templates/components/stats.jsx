import React from 'react';
import { Sparkles } from 'lucide-react';

const Stats = ({ templates }) => {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Never Updated';
    }
  };

  const activeTemplatesCount = templates.filter((t) => t.status === 'active').length;
  const totalTemplatesCount = templates.length;
  const activePercentage =
    totalTemplatesCount > 0 ? (activeTemplatesCount / totalTemplatesCount) * 100 : 0;

  const averageVariables =
    totalTemplatesCount > 0
      ? Math.round(
          templates.reduce((sum, t) => sum + (t.variables?.length || 0), 0) / totalTemplatesCount,
        )
      : 0;

  const lastUpdated = totalTemplatesCount > 0 ? formatDate(templates[0].updatedAt) : 'Never';

  return (
    <div className="premium-card bg-linear-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>

      <div className="relative">
        <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-slate-500 mb-10 flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          Template Statistics
        </h3>

        <div className="space-y-10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Active Templates
              </span>
              <span className="text-2xl font-extrabold text-white tabular-nums">
                {activeTemplatesCount}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all duration-1000"
                style={{ width: `${activePercentage}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Avg. Variables per Template
              </span>
              <span className="text-2xl font-extrabold text-white tabular-nums">
                {averageVariables}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full shadow-[0_0_12px_rgba(139,92,246,0.5)] transition-all duration-1000"
                style={{
                  width: `${Math.min((averageVariables / 10) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Last Updated
              </span>
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">
                {lastUpdated}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4 group/tip hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-white uppercase tracking-widest mb-1">
                Pro Tip
              </p>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">
                Use variables like {'{{first_name}}'} to personalize your emails and improve
                engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
