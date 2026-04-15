import React from 'react';
import { Edit, Clock, Send, CheckCircle, Pause } from 'lucide-react';
import { DateTime } from 'luxon';

// Intelligently extracts a valid IANA timezone name from strings that might
// be descriptive labels like "(UTC+05:30) Asia/Kolkata" or "(UTC+05:30) Mumbai, Kolkata, New Delhi"
export const getIanaTimezone = (tz) => {
  if (!tz) return 'UTC';
  
  // Directly valid IANA name?
  if (DateTime.now().setZone(tz).isValid) return tz;

  // Pattern to extract name like Asia/Kolkata or Mumbai, Kolkata from the end of a label
  // (UTC+05:30) Asia/Kolkata → Asia/Kolkata
  const match = tz.match(/\)\s*(.+)$/);
  if (match && match[1]) {
    const candidate = match[1].trim();
    if (DateTime.now().setZone(candidate).isValid) return candidate;
    
    // Hard-coded known mapping for the "(UTC+05:30) Mumbai..." case
    if (candidate.toLowerCase().includes('mumbai') || candidate.toLowerCase().includes('kolkata')) {
      return 'Asia/Kolkata';
    }
  }

  return 'UTC'; // Fallback
};

// Generates a comprehensive but curated list of popular world timezones
export const getAllTimezones = () => {
  const popularTzs = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Phoenix',
    'America/Los_Angeles',
    'America/Vancouver',
    'America/Halifax',
    'America/Anchorage',
    'America/Honolulu',
    'America/St_Johns',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  const friendlyNames = {
    'America/New_York': 'Eastern Time (US & Canada)',
    'America/Chicago': 'Central Time (US & Canada)',
    'America/Denver': 'Mountain Time (US & Canada)',
    'America/Phoenix': 'Arizona (No DST)',
    'America/Los_Angeles': 'Pacific Time (US & Canada)',
    'America/Vancouver': 'Pacific Time (Canada)',
    'America/Halifax': 'Atlantic Time (Canada)',
    'America/Anchorage': 'Alaska Time',
    'America/Honolulu': 'Hawaii Time',
    'America/St_Johns': 'Newfoundland Time',
  };

  const now = DateTime.now();

  return popularTzs
    .map((tz) => {
      const dt = now.setZone(tz);
      if (!dt.isValid) return null;
      const offset = dt.toFormat('ZZ');
      const descriptiveName = friendlyNames[tz] || tz.replace(/_/g, ' ');
      return {
        value: tz,
        label: `(UTC${offset}) ${descriptiveName}`,
        offset: dt.offset,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.offset - b.offset || a.value.localeCompare(b.value));
};

// Robust date parser for both ISO and SQL-style strings
const parseDate = (dateString) => {
  if (!dateString) return null;
  // Try ISO first (2026-04-01T16:54:00Z)
  let dt = DateTime.fromISO(dateString, { zone: 'utc' });
  // Fallback to SQL (2026-04-01 16:54:00)
  if (!dt.isValid) {
    dt = DateTime.fromSQL(dateString, { zone: 'utc' });
  }
  return dt.isValid ? dt : null;
};

// Format date (date only) — always display in target timezone
export const formatDate = (dateString, timezone) => {
  const dt = parseDate(dateString);
  if (!dt) return '-';
  
  const iana = getIanaTimezone(timezone);
  return dt.setZone(iana).toFormat('LLLL d, yyyy');
};

// Format date + time — pass user.timezone to show time correctly in their profile timezone
export const formatDateTime = (dateString, timezone) => {
  const dt = parseDate(dateString);
  if (!dt) return '-';

  const iana = getIanaTimezone(timezone);
  // Full descriptive format for overview tabs
  return dt.setZone(iana).toFormat('LLLL d, yyyy \'at\' hh:mm a');
};

// Get status color and icon
export const getStatusInfo = (status) => {
  switch (status) {
    case 'draft':
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <Edit className="w-4 h-4" />,
        label: 'Draft',
      };
    case 'scheduled':
      return {
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <Clock className="w-4 h-4" />,
        label: 'Scheduled',
      };
    case 'running':
    case 'sending':
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <Send className="w-4 h-4" />,
        label: 'Running',
      };
    case 'completed':
      return {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Completed',
      };
    case 'paused':
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <Pause className="w-4 h-4" />,
        label: 'Paused',
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <Edit className="w-4 h-4" />,
        label: status,
      };
  }
};

// Calculate progress
export const calculateProgress = (campaign) => {
  if (!campaign.totalRecipients || campaign.totalRecipients === 0) return 0;
  if (campaign.status === 'completed') return 100;
  const sent = campaign.totalSent || 0;
  const total = campaign.totalRecipients || 1;
  return Math.min(100, Math.round((sent / total) * 100));
};

// Helper for unique contacts
export const getUniqueContacted = (campaign) => {
  if (!campaign.totalSent || campaign.totalSent === 0) return 0;
  return Math.min(campaign.totalSent, campaign.totalRecipients || campaign.totalSent);
};

// Calculate open rate
export const calculateOpenRate = (campaign) => {
  const uniqueContacted = getUniqueContacted(campaign);
  if (uniqueContacted === 0) return '-';
  const opens = campaign.totalOpens || 0;
  return `${Math.round((opens / uniqueContacted) * 100)}%`;
};

// Calculate click rate
export const calculateClickRate = (campaign) => {
  const uniqueContacted = getUniqueContacted(campaign);
  if (uniqueContacted === 0) return '-';
  const clicks = campaign.totalClicks || 0;
  return `${Math.round((clicks / uniqueContacted) * 100)}%`;
};

// Calculate reply rate
export const calculateReplyRate = (campaign) => {
  const uniqueContacted = getUniqueContacted(campaign);
  if (uniqueContacted === 0) return '-';
  const replies = campaign.totalReplied || 0;
  return `${Math.round((replies / uniqueContacted) * 100)}%`;
};

// Calculate bounce rate
export const calculateBounceRate = (campaign) => {
  const sent = campaign.totalSent;
  if (!sent) return '-';
  const bounced = campaign.totalBounced || 0;
  return `${Math.round((bounced / sent) * 100)}%`;
};

// Calculate unsubscribe rate
export const calculateUnsubscribeRate = (campaign) => {
  const sent = campaign.totalSent;
  if (!sent) return '-';
  const unsubscribed = campaign.totalUnsubscribed || 0;
  return `${Math.round((unsubscribed / sent) * 100)}%`;
};
