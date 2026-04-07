import { Inbox, Mail, MessageCircle, Send } from "lucide-react";

export const COLORS = {
    gmail: '#EA4335',
    outlook: '#0078D4',
    smtp: '#34A853',
    opens: '#e11d48',
    replies: '#10B981',
    bounce: '#EF4444',
    pending: '#94A3B8',
    sent: '#e11d48',
};

export const stats = (t, overview, metrics) => [
    {
        title: t('analytics.total_campaigns'),
        value: overview?.totalCampaigns?.toString() || '0',
        change: t('analytics.active_count', { count: overview?.activeCampaigns || 0 }),
        icon: <Mail className="w-5 h-5 text-purple-600" />,
        color: 'from-purple-500/30 to-purple-500/30',
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        description: t('analytics.completed_count', { count: overview?.completedCampaigns || 0 }),
        trend: 'up',
        sparkline: [20, 35, 25, 45, 30, 55, 40],
    },
    {
        title: t('analytics.emails_sent'),
        value: overview?.totalEmailsSent?.toLocaleString() || '0',
        change: t('analytics.open_rate_value', { percentage: overview?.avgOpenRate || 0 }),
        icon: <Send className="w-5 h-5 text-purple-600" />,
        color: 'from-purple-500/30 to-purple-500/30',
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        description: t('analytics.opens_count', {
            count: overview?.totalOpens?.toLocaleString() || 0,
        }),
        trend: 'up',
        sparkline: [10, 25, 45, 30, 60, 50, 80],
    },
    {
        title: t('analytics.total_replies'),
        value: overview?.totalReplies?.toString() || '0',
        change: t('analytics.reply_rate_value', { percentage: metrics.replyRate }),
        icon: <MessageCircle className="w-5 h-5 text-purple-600" />,
        color: 'from-purple-500/30 to-purple-500/30',
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        description: t('analytics.unique_replies_count', { count: overview?.totalReplied || 0 }),
        trend: 'up',
        sparkline: [15, 20, 18, 25, 22, 30, 28],
    },
    {
        title: t('analytics.bounce_rate'),
        value: `${metrics.bounceRate}%`,
        change: t('analytics.bounces_count', { count: overview?.totalBounces || 0 }),
        icon: <Inbox className="w-5 h-5 text-purple-600" />,
        color: 'from-purple-500/30 to-purple-500/30',
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        description:
            metrics.bounceRate > 5 ? t('analytics.needs_attention') : t('analytics.good_status'),
        trend: 'down',
        sparkline: [20, 15, 25, 20, 30, 25, 20],
    },
];