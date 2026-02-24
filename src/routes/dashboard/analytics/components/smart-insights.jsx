import React from 'react';
import { Sparkles, ShieldCheck, Zap, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';

/**
 * SmartInsights Component
 * Provides actionable AI-driven recommendations based on campaign performance metrics.
 */
const SmartInsights = ({ metrics, overview }) => {
  const openRate = overview?.avgOpenRate || 0;
  const replyRate = metrics?.replyRate || 0;
  const bounceRate = metrics?.bounceRate || 0;

  const insights = [
    {
      id: 'deliverability',
      title: 'Deliverability Health',
      value: bounceRate <= 3 ? 'Excellent' : bounceRate <= 5 ? 'Good' : 'At Risk',
      status: bounceRate <= 3 ? 'success' : bounceRate <= 5 ? 'warning' : 'danger',
      icon: <ShieldCheck className="w-5 h-5" />,
      recommendation:
        bounceRate > 3
          ? 'Your bounce rate is slightly high. We recommend verifying your list using a tool like NeverBounce before your next send.'
          : 'Your technical setup (SPF/DKIM/DMARC) is working perfectly. Keep your daily volume consistent.',
    },
    {
      id: 'engagement',
      title: 'Content Impact',
      value: openRate >= 25 ? 'High' : openRate >= 15 ? 'Average' : 'Low',
      status: openRate >= 25 ? 'success' : openRate >= 15 ? 'warning' : 'danger',
      icon: <Zap className="w-5 h-5" />,
      recommendation:
        openRate < 20
          ? "Your open rate is below the industry average. Try A/B testing shorter subject lines or using more personalized 'spintax'."
          : "Your subject lines are resonating well! Consider doubling down on the 'curiosity-gap' style you're currently using.",
    },
    {
      id: 'conversion',
      title: 'Lead Quality',
      value: replyRate >= 3 ? 'Elite' : replyRate >= 1 ? 'Solid' : 'Needs Work',
      status: replyRate >= 3 ? 'success' : replyRate >= 1 ? 'warning' : 'danger',
      icon: <TrendingUp className="w-5 h-5" />,
      recommendation:
        replyRate < 1.5
          ? "Replies are low. Try adding a clearer 'Call to Action' (CTA) or a soft ask like 'Was this helpful?' to lower the friction."
          : 'Great conversion! Your value proposition is clear. Make sure your sales team is following up within 4 hours for best results.',
    },
  ];

  const getStatusStyles = (status) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20';
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/20';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 ring-slate-500/20';
    }
  };

  return (
    <div className="premium-card p-8 h-full flex flex-col relative overflow-hidden group">
      {/* Decorative background blur */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] group-hover:bg-indigo-500/10 transition-colors duration-700"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
            Smart <span className="text-indigo-600">Insights</span>
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            AI-POWERED GROWTH RECOMMENDATIONS
          </p>
        </div>
        <div className="px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 shadow-xs">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
            Active analysis
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 relative z-10">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-5 rounded-3xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${getStatusStyles(insight.status)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-transparent`}
                >
                  {insight.icon}
                </div>
                <div>
                  <h4 className="text-[12px] font-black uppercase tracking-tight opacity-80">
                    {insight.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-black tracking-tight">{insight.value}</span>
                    {insight.status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                    {insight.status === 'danger' && <AlertCircle className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] font-bold leading-relaxed opacity-90 border-t border-current/10 pt-3">
              {insight.recommendation}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center relative z-10">
        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] px-6 py-2 rounded-xl hover:bg-slate-50 transition-colors border border-dashed border-indigo-200">
          Unlock advanced strategy report
        </button>
      </div>
    </div>
  );
};

export default SmartInsights;
