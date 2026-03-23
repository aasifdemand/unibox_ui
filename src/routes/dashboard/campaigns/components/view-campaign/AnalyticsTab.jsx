import { calculateAvgResponseTime } from '../../hooks/use-campaign-analytics';
import {
  BarChart3,
  TrendingUp,
  MousePointer2,
  MessageSquare,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const AnalyticsTab = ({ campaign, stats }) => {
  const openRate = stats.uniqueContacted
    ? Math.round((stats.totalOpened / stats.uniqueContacted) * 100)
    : 0;
  const clickRate = stats.uniqueContacted
    ? Math.round((stats.totalClicked / stats.uniqueContacted) * 100)
    : 0;
  const replyRate = stats.uniqueContacted
    ? Math.round((stats.totalReplied / stats.uniqueContacted) * 100)
    : 0;
  const bounceRate = stats.totalSent
    ? Math.round(((stats.totalBounced || 0) / stats.totalSent) * 100)
    : 0;
  const unsubRate = stats.totalSent
    ? Math.round(((stats.totalUnsubscribed || 0) / stats.totalSent) * 100)
    : 0;

  return (
    <div className="space-y-10 pb-20 mt-4">
      {/* Performance Grid */}
      <div className="premium-card bg-white border-slate-200/60 p-10 shadow-sm shadow-slate-900/2">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              Performance Overview
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Key performance metrics
            </p>
          </div>
          <div className="px-4 py-2 bg-orange-50 rounded-md border border-orange-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">
              Live Data
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StatMini label="Total Sent" value={stats.totalSent.toLocaleString()} theme="slate" />
          <StatMini
            label="Open Rate"
            value={`${openRate}%`}
            theme="indigo"
            trend={openRate > 25 ? 'Good' : 'Stable'}
          />
          <StatMini
            label="Click Rate"
            value={`${clickRate}%`}
            theme="purple"
            trend={clickRate > 5 ? 'High' : 'Stable'}
          />
          <StatMini
            label="Reply Rate"
            value={`${replyRate}%`}
            theme="emerald"
            trend={replyRate > 2 ? 'Active' : 'Stable'}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Engagement */}
        <div className="premium-card bg-white border-slate-200/60 p-10 shadow-sm shadow-slate-900/2">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-10">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Engagement Rates
          </h3>

          <div className="space-y-10">
            <ProgressBar
              label="Open Rate"
              value={openRate}
              theme="indigo"
              icon={<TrendingUp className="w-3 h-3" />}
            />
            <ProgressBar
              label="Click Rate"
              value={clickRate}
              theme="purple"
              icon={<MousePointer2 className="w-3 h-3" />}
            />
            <ProgressBar
              label="Reply Rate"
              value={replyRate}
              theme="emerald"
              icon={<MessageSquare className="w-3 h-3" />}
            />
            <ProgressBar
              label="Bounce Rate"
              value={bounceRate}
              theme="rose"
              icon={<TrendingUp className="w-3 h-3" />}
            />
            <ProgressBar
              label="Unsubscribe Rate"
              value={unsubRate}
              theme="slate"
              icon={<TrendingUp className="w-3 h-3" />}
            />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="premium-card bg-white border-slate-200/60 p-10 shadow-sm shadow-slate-900/2">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-10">
            <Zap className="w-5 h-5 text-orange-600" />
            Response Statistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50/50 rounded-lg border border-slate-100 group hover:border-orange-200 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Avg Response Time
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">
                {calculateAvgResponseTime(campaign.CampaignRecipients)}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Time Analysis
              </p>
            </div>

            <div className="p-6 bg-slate-50/50 rounded-lg border border-slate-100 group hover:border-orange-200 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-md bg-orange-600 flex items-center justify-center text-white shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total Replies
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">
                {stats.totalReplied.toLocaleString()}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Verified Replies
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-orange-50/40 rounded-lg border border-orange-100 flex items-center gap-4">
            <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0" />
            <p className="text-[11px] font-medium text-orange-700 leading-tight">
              These metrics are calculated based on campaign data for accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatMini = ({ label, value, theme, trend }) => (
  <div className="p-6 rounded-4xl bg-slate-50/50 border border-slate-100 hover:shadow-sm hover:shadow-slate-900/3 transition-all duration-500 group">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-slate-600 transition-colors">
      {label}
    </p>
    <p
      className={`text-3xl font-black tracking-tighter tabular-nums ${theme === 'indigo' ? 'text-orange-600' : theme === 'purple' ? 'text-orange-600' : theme === 'emerald' ? 'text-orange-600' : 'text-slate-900'}`}
    >
      {value}
    </p>
    {trend && (
      <div className="flex items-center gap-1.5 mt-2">
        <div
          className={`w-1.5 h-1.5 rounded-full ${theme === 'indigo' || theme === 'emerald' ? 'bg-orange-500' : 'bg-slate-300'}`}
        ></div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {trend}
        </span>
      </div>
    )}
  </div>
);

const ProgressBar = ({ label, value, theme, icon }) => {
  const iconColors = {
    indigo: 'bg-orange-50 text-orange-600',
    purple: 'bg-orange-50 text-orange-600',
    emerald: 'bg-orange-50 text-orange-600',
    rose: 'bg-orange-50 text-orange-600',
    slate: 'bg-slate-50 text-slate-600',
  };

  const barColors = {
    indigo: 'bg-orange-600 shadow-orange-200',
    purple: 'bg-orange-600 shadow-orange-200',
    emerald: 'bg-orange-600 shadow-orange-200',
    rose: 'bg-orange-600 shadow-orange-200',
    slate: 'bg-slate-600 shadow-slate-200',
  };

  return (
    <div className="space-y-4 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconColors[theme] || iconColors.indigo}`}
          >
            {icon}
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
            {label}
          </span>
        </div>
        <span className="text-sm font-black text-slate-900 tabular-nums">{value}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${barColors[theme] || barColors.indigo}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
