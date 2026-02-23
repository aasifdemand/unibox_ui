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

  const { data: performance, refetch: refetchPerformance } = usePerformanceMetrics();
  const { data: timeline, isLoading: timelineLoading, refetch: refetchTimeline } = useTimelineData(
    timeRange === "7" ? "week" : timeRange === "30" ? "month" : "year",
  );
  const { data: topCampaigns, isLoading: topCampaignsLoading, refetch: refetchTopCampaigns } =
    useTopCampaigns(5);
  const { data: recentReplies, isLoading: repliesLoading, refetch: refetchReplies } =
    useRecentReplies(8);
  const { data: senderStats, refetch: refetchSenderStats } = useSenderStats();
  const { data: hourlyStats, refetch: refetchHourlyStats } = useHourlyStats();

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchOverview(),
      refetchPerformance(),
      refetchTimeline(),
      refetchTopCampaigns(),
      refetchReplies(),
      refetchSenderStats(),
      refetchHourlyStats(),
    ]);
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
  const timelineData = useMemo(() => {
    // Handle both direct array and nested data.timeline
    const items = Array.isArray(timeline)
      ? timeline
      : (timeline?.timeline || timeline?.data || []);

    if (!items || items.length === 0) return [];

    return items.map((item) => {
      // Robustly extract metrics with multiple possible field names
      // Backend might use snake_case or camelCase, or total prefix
      const sent = Number(item.sent ?? item.emails_sent ?? item.sent_count ?? item.count ?? item.total_sent ?? 0);
      const opens = Number(item.opens ?? item.total_opens ?? item.open_count ?? item.opened ?? item.opened_count ?? 0);
      const replies = Number(item.replies ?? item.total_replies ?? item.reply_count ?? item.replied ?? item.replied_count ?? 0);

      return {
        date: item.date ? new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }) : 'Unknown',
        sent,
        opens,
        replies,
      };
    });
  }, [timeline]);

  const hasValidData = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return false;
    return timelineData.some(
      (item) => item.sent > 0 || item.opens > 0 || item.replies > 0,
    );
  }, [timelineData]);

  // Fix sender data
  const senderPieData = useMemo(() => {
    const items = Array.isArray(senderStats) ? senderStats : (senderStats?.data || []);
    return items.map((stat) => ({
      name:
        stat.name ||
        (stat.type === "gmail"
          ? "Gmail"
          : stat.type === "outlook"
            ? "Outlook"
            : "Direct SMTP"),
      value: Number(stat.sent ?? stat.value ?? stat.count ?? 0),
      sent: Number(stat.sent ?? stat.value ?? stat.count ?? 0),
      type: stat.type || "smtp",
      count: Number(stat.active_count ?? stat.count ?? 0),
      percentage: Number(stat.percentage ?? 0),
    }));
  }, [senderStats]);

  const hourlyData = useMemo(() => {
    const items = Array.isArray(hourlyStats) ? hourlyStats : (hourlyStats?.data || []);
    return items.map((h) => ({
      hour: h.hour !== undefined ? (h.hour.toString().includes(':') ? h.hour : `${h.hour}:00`) : '00:00',
      count: Number(h.count ?? h.sent ?? h.value ?? 0),
    }));
  }, [hourlyStats]);

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
      timeline: timelineLoading,
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

