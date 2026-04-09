import React from 'react';
import { useTranslation } from 'react-i18next';

const CustomTooltip = ({ active, payload, label }) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    // Find specific data points for calculations
    const sentItem = payload.find(
      (p) =>
        p.name?.includes('Sent') ||
        p.name?.includes('Enviados') ||
        p.name?.includes('Envoyés') ||
        p.dataKey === 'sent',
    );
    const repliedItem = payload.find(
      (p) =>
        p.name?.includes('Replied') ||
        p.name?.includes('Replies') ||
        p.name?.includes('Respuestas') ||
        p.name?.includes('Réponses') ||
        p.dataKey === 'replies',
    );

    const sentValue = sentItem?.value || 0;
    const repliedValue = repliedItem?.value || 0;

    const replyRate = sentValue > 0 ? ((repliedValue / sentValue) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white/95  p-5 rounded-lg shadow-sm border border-white ring-1 ring-slate-900/5 min-w-50 animate-in fade-in zoom-in duration-200">
        <p className="text-xs font-bold text-slate-400 mb-4 border-b border-slate-100/80 pb-3">
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
                <span className="text-xs font-bold text-slate-700">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {sentValue > 0 && repliedValue > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100/80 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-400">
                {t('analytics.reply_rate')}
              </span>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100/50">
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
