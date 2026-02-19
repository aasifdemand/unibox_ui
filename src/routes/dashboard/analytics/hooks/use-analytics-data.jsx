import { useMemo, useState } from "react";
import {
  useGlobalOverview,
  usePerformanceMetrics,
  useTimelineData,
  useTopCampaigns,
  useRecentReplies,
  useSenderStats,
  useHourlyStats,
} from "../../../../hooks/useAnalytics";

export const useAnalyticsData = () => {
  const [timeRange, setTimeRange] = useState("30");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all analytics data
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useGlobalOverview();

  const { data: performance } = usePerformanceMetrics();
  const { data: timeline } = useTimelineData(
    timeRange === "7" ? "week" : timeRange === "30" ? "month" : "year",
  );
  const { data: topCampaigns, isLoading: topCampaignsLoading } =
    useTopCampaigns(5);
  const { data: recentReplies, isLoading: repliesLoading } =
    useRecentReplies(8);
  const { data: senderStats } = useSenderStats();
  const { data: hourlyStats } = useHourlyStats();

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchOverview();
    setIsRefreshing(false);
  };

  // Calculations & Transformations
  const bounceRate =
    overview?.totalEmailsSent > 0
      ? Math.round((overview.totalBounces / overview.totalEmailsSent) * 100)
      : 0;

  const replyRate =
    overview?.totalEmailsSent > 0
      ? Math.round((overview.totalReplies / overview.totalEmailsSent) * 100)
      : 0;

  // Timeline data - format dates nicely (supports DD/MM/YYYY and ISO)
  // In useAnalyticsData.js, make sure timelineData is properly formatted
  const timelineData = useMemo(() => {
    if (!timeline) return [];

    return timeline.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      sent: Number(item.sent) || 0,
      opens: Number(item.opens) || 0,
      replies: Number(item.replies) || 0,
    }));
  }, [timeline]);

  const hasValidData = useMemo(() => {
    return timelineData.some(
      (item) => item.sent > 0 || item.opens > 0 || item.replies > 0,
    );
  }, [timelineData]);

  // Fix sender data
  const senderPieData =
    senderStats?.map((stat) => ({
      name:
        stat.name ||
        (stat.type === "gmail"
          ? "Gmail"
          : stat.type === "outlook"
            ? "Outlook"
            : "SMTP"),
      value: stat.sent || 0,
      type: stat.type || "smtp",
      count: stat.count || 0,
      sent: stat.sent || 0,
      percentage: stat.percentage || 0,
    })) || [];

  const hourlyData =
    hourlyStats?.map((h) => ({
      hour: h.hour || `${h.hour}:00`,
      count: h.count || 0,
    })) || [];

  return {
    // Data
    overview,
    performance,
    topCampaigns,
    recentReplies,
    senderPieData,
    hourlyData,
    timelineData,
    hasValidData,

    // Calculated Metrics
    metrics: {
      bounceRate,
      replyRate,
    },

    // Loading & Error States
    isLoading: {
      overview: overviewLoading,
      topCampaigns: topCampaignsLoading,
      replies: repliesLoading,
    },
    error: {
      overview: overviewError,
    },

    // Controls
    timeRange,
    setTimeRange,
    isRefreshing,
    handleRefresh,
  };
};
