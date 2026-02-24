import React from 'react';
import {
  Loader2,
  Mail,
  MessageCircle,
  Send,
  RefreshCw,
  Inbox,
  Sparkles,
  Clock,
  ChevronRight,
} from 'lucide-react';

// Components
import StatsGrid from './components/stats-grid';
import ActivityTimeline from './components/activity-timeline';
import SenderDistribution from './components/sender-distribution';
import TopCampaigns from './components/top-campaigns';
import RecentReplies from './components/recent-replies';
import OverallPerformance from './components/overall-performance';
import SmartInsights from './components/smart-insights';

// Hooks
import { useAnalyticsData } from './hooks/use-analytics-data';

const COLORS = {
  gmail: '#EA4335',
  outlook: '#0078D4',
  smtp: '#34A853',
  opens: '#3B82F6',
  replies: '#10B981',
  bounce: '#EF4444',
  pending: '#94A3B8',
  sent: '#3B82F6',
};

const Analytics = () => {
  const {
    overview,
    performance,
    topCampaigns,
    recentReplies,
    senderPieData,
    timelineData,
    hasValidData,
    metrics,
    isLoading,
    error,
    timeRange,
    setTimeRange,
    isRefreshing,
    handleRefresh,
  } = useAnalyticsData();

  // console.log("timeline Data: ", timelineData);

  if (isLoading.overview) {
    return (
      <div className="p-8 flex items-center justify-center h-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-blue-500/20"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error.overview) {
    return (
      <div className="p-8">
        <div className="premium-card p-12 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 flex items-center justify-center mb-6 border border-red-100 shadow-inner">
            <Inbox className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
            Failed to Load Data
          </h3>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            {error.overview.message}
          </p>
          <button onClick={handleRefresh} className="btn-primary flex items-center mx-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Stats cards configuration
  const stats = [
    {
      title: 'Total Campaigns',
      value: overview?.totalCampaigns?.toString() || '0',
      change: `${overview?.activeCampaigns || 0} active`,
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      description: `${overview?.completedCampaigns || 0} completed`,
      trend: 'up',
    },
    {
      title: 'Emails Sent',
      value: overview?.totalEmailsSent?.toLocaleString() || '0',
      change: `${overview?.avgOpenRate || 0}% open rate`,
      icon: <Send className="w-6 h-6 text-emerald-600" />,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      description: `${overview?.totalOpens?.toLocaleString() || 0} opens`,
      trend: 'up',
    },
    {
      title: 'Total Replies',
      value: overview?.totalReplies?.toString() || '0',
      change: `${metrics.replyRate}% reply rate`,
      icon: <MessageCircle className="w-6 h-6 text-violet-600" />,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      description: `${overview?.totalReplied || 0} unique replies`,
      trend: 'up',
    },
    {
      title: 'Bounce Rate',
      value: `${metrics.bounceRate}%`,
      change: `${overview?.totalBounces || 0} bounces`,
      icon: <Inbox className="w-6 h-6 text-rose-600" />,
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-50',
      description: metrics.bounceRate > 5 ? 'Needs attention' : 'Good',
      trend: 'down',
    },
  ];

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      {/* Analytics Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tighter flex items-center">
            Campaign <span className="text-gradient ml-3">Analytics</span>
            {isRefreshing && <Loader2 className="w-6 h-6 ml-4 animate-spin text-blue-500" />}
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Track your campaign performance and engagement metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-primary flex items-center px-6"
          >
            {!isRefreshing && <RefreshCw className="w-4 h-4 mr-2" />}
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <StatsGrid stats={stats} />

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ActivityTimeline
            data={timelineData}
            hasValidData={hasValidData}
            isLoading={isLoading.timeline}
          />
        </div>
        <div className="lg:col-span-1">
          <SenderDistribution data={senderPieData} COLORS={COLORS} />
        </div>
      </div>

      {/* Secondary Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SmartInsights metrics={metrics} overview={overview} />
        <TopCampaigns campaigns={topCampaigns} isLoading={isLoading.topCampaigns} />
      </div>

      {/* Recent Replies */}
      <RecentReplies replies={recentReplies} isLoading={isLoading.replies} />

      {performance?.aggregates && (
        <div className="mt-10">
          <OverallPerformance aggregates={performance.aggregates} />
        </div>
      )}
    </div>
  );
};

export default Analytics;
