import React from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Find specific data points for calculations
    const sentItem = payload.find((p) => p.name.includes('Sent') || p.dataKey === 'sent');
    const repliedItem = payload.find(
      (p) => p.name.includes('Replied') || p.name.includes('Replies') || p.dataKey === 'replies',
    );

    const sentValue = sentItem?.value || 0;
    const repliedValue = repliedItem?.value || 0;

    const replyRate = sentValue > 0 ? ((repliedValue / sentValue) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white/95 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl border border-white ring-1 ring-slate-900/5 min-w-50 animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100/80 pb-3">
          {label}
        </p>
        <div className="space-y-4">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color || entry.fill || '#000' }}
                />
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-black text-slate-900 tabular-nums">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {sentValue > 0 && repliedValue > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100/80 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Reply Rate
              </span>
              <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50">
                {replyRate}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
