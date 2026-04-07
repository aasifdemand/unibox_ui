import React from 'react';
import { useTranslation } from 'react-i18next';

// Components
import StatsGrid from './components/stats-grid';
import ActivityTimeline from './components/activity-timeline';
import SenderDistribution from './components/sender-distribution';
import TopCampaigns from './components/top-campaigns';
import RecentReplies from './components/recent-replies';
import OverallPerformance from './components/overall-performance';
import MetricPulse from './components/metric-pulse';

// Hooks
import { useAnalyticsData } from './hooks/use-analytics-data';
import { COLORS, stats } from './utils';
import AnalyticsLoader from './components/analytics-loader';
import AnalyticsError from './components/analytics-error';
import AnalyticsHeader from './components/analytics-header';



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
  const { t } = useTranslation();

  // console.log("timeline Data: ", timelineData);

  if (isLoading.overview) {
    return (
      <AnalyticsLoader/>
    );
  }

  if (error.overview) {
    return (
      <AnalyticsError handleRefresh={handleRefresh} error={error}/>
    );
  }

  // Stats cards configuration
 const statsData = stats(t,overview,metrics)

  return (
    <div className="p-4 space-y-10 animate-in fade-in duration-700">
      {/* Analytics Header */}
      <AnalyticsHeader handleRefresh={handleRefresh} isRefreshing={isRefreshing} setTimeRange={setTimeRange} timeRange={timeRange}/>

      <StatsGrid stats={statsData} />

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
        <MetricPulse metrics={metrics} overview={overview} />
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
