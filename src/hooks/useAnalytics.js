import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const analyticsKeys = {
  all: ['analytics'],
  global: ['analytics', 'global'],
  overview: () => [...analyticsKeys.global, 'overview'],
  performance: () => [...analyticsKeys.global, 'performance'],
  timeline: () => [...analyticsKeys.global, 'timeline'],
  topCampaigns: () => [...analyticsKeys.global, 'top-campaigns'],
  recentReplies: () => [...analyticsKeys.global, 'recent-replies'],
  senderStats: () => [...analyticsKeys.global, 'sender-stats'],
  hourly: () => [...analyticsKeys.global, 'hourly'],

  // Keep per-campaign keys for detail view
  campaign: (campaignId) => [...analyticsKeys.all, 'campaign', campaignId],
  campaignOverview: (campaignId) => [...analyticsKeys.campaign(campaignId), 'overview'],
};

// =========================
// GLOBAL ANALYTICS ENDPOINTS
// =========================

/**
 * GET /api/v1/analytics/overview
 * Returns overall platform metrics
 */
const fetchGlobalOverview = async () => {
  const response = await fetch(`${API_URL}/analytics/overview`, {
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch global overview');
  return data.data;
};

export const useGlobalOverview = () => {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: fetchGlobalOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60000, // Refresh every minute
  });
};

/**
 * GET /api/v1/analytics/performance
 * Returns performance metrics (open rates, reply rates, etc.)
 */
const fetchPerformanceMetrics = async () => {
  const response = await fetch(`${API_URL}/analytics/performance`, {
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch performance metrics');
  return data.data;
};

export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: analyticsKeys.performance(),
    queryFn: fetchPerformanceMetrics,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * GET /api/v1/analytics/timeline?period=week|month|year
 * Returns campaign activity over time
 */
const fetchTimelineData = async (period = 'week') => {
  const response = await fetch(`${API_URL}/analytics/timeline?period=${period}`, {
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch timeline data');
  return data.data;
};

export const useTimelineData = (period = 'week') => {
  return useQuery({
    queryKey: [...analyticsKeys.timeline(), period],
    queryFn: () => fetchTimelineData(period),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * GET /api/v1/analytics/top-campaigns?limit=5
 * Returns top performing campaigns
 */
const fetchTopCampaigns = async (limit = 5) => {
  const response = await fetch(`${API_URL}/analytics/top-campaigns?limit=${limit}`, {
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch top campaigns');
  return data.data;
};

export const useTopCampaigns = (limit = 5) => {
  return useQuery({
    queryKey: [...analyticsKeys.topCampaigns(), limit],
    queryFn: () => fetchTopCampaigns(limit),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * GET /api/v1/analytics/recent-replies?limit=10
 * Returns most recent replies across all campaigns
 */
const fetchRecentReplies = async (limit = 10) => {
  const response = await fetch(`${API_URL}/analytics/recent-replies?limit=${limit}`, {
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch recent replies');
  return data.data;
};

export const useRecentReplies = (limit = 10) => {
  return useQuery({
    queryKey: [...analyticsKeys.recentReplies(), limit],
    queryFn: () => fetchRecentReplies(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30000, // 30 seconds
  });
};

/**
 * GET /api/v1/analytics/sender-stats
 * Returns performance breakdown by sender
 */
const fetchSenderStats = async () => {
  const response = await fetch(`${API_URL}/analytics/sender-stats`, {
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch sender stats');
  return data.data;
};

export const useSenderStats = () => {
  return useQuery({
    queryKey: analyticsKeys.senderStats(),
    queryFn: fetchSenderStats,
    staleTime: 15 * 60 * 1000,
  });
};

/**
 * GET /api/v1/analytics/hourly
 * Returns hourly sending patterns
 */
const fetchHourlyStats = async () => {
  const response = await fetch(`${API_URL}/analytics/hourly`, {
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch hourly stats');
  return data.data;
};

export const useHourlyStats = () => {
  return useQuery({
    queryKey: analyticsKeys.hourly(),
    queryFn: fetchHourlyStats,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
