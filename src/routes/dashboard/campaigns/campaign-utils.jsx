import React from 'react';
import { Edit, Clock, Send, CheckCircle, Pause } from 'lucide-react';

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
        color: 'bg-blue-100 text-blue-800 border-blue-200',
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

// Calculate open rate
export const calculateOpenRate = (campaign) => {
  if (!campaign.totalSent || campaign.totalSent === 0) return '-';
  const opens = campaign.totalOpens || 0;
  return `${Math.round((opens / campaign.totalSent) * 100)}%`;
};

// Calculate click rate
export const calculateClickRate = (campaign) => {
  if (!campaign.totalSent || campaign.totalSent === 0) return '-';
  const clicks = campaign.totalClicks || 0;
  return `${Math.round((clicks / campaign.totalSent) * 100)}%`;
};
