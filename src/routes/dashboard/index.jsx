import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  MailOpen,
  Clock,
  Edit,
  ChevronRight,
  Sparkles,
  Target,
  RefreshCw,
  Send,
  CheckCircle,
  Pause,
  Users,
  Loader2,
  Plus,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { useTranslation } from 'react-i18next';

// Import components & modals
import ShowTemplate from '../../modals/showtemplate';
import ShowUpload from '../../modals/showupload';
import ShowSender from '../../modals/showsender';
import { useTemplatesData } from './templates/hooks/use-templates-data';
import { useAudienceData } from './audience/hooks/use-audience-data';
import ShowCreateCampaign from '../../modals/showcreatecampaign';

// Import React Query hooks
import { useCampaigns } from '../../hooks/useCampaign';
import { useSenders } from '../../hooks/useSenders';
import { useTemplate } from '../../hooks/useTemplate';
import { useBatches, useVerificationTotals } from '../../hooks/useBatches';

const QuickActionContent = ({ action }) => (
  <>
    <div
      className={`w-12 h-12 rounded-2xl bg-linear-to-br ${action.color} p-0.5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
    >
      <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
        <div
          className={`text-transparent bg-linear-to-br ${action.color} bg-clip-text`}
        >
          {action.icon}
        </div>
      </div>
    </div>
    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mt-4 group-hover:text-blue-600 transition-colors">
      {action.title}
    </h4>
  </>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('30');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);

  // Template Modal Logic
  const { state: templateState, setters: templateSetters, handlers: templateHandlers } = useTemplatesData();

  // Audience Modal Logic
  const audienceData = useAudienceData();

  // React Query hooks
  const {
    data: campaigns = [],
    isLoading: campaignsLoading,
    refetch: refetchCampaigns,
  } = useCampaigns();

  const {
    data: senderResponse = { data: [] },
    isLoading: sendersLoading,
    refetch: refetchSenders,
  } = useSenders({ limit: 1000 });

  const senders = senderResponse.data || [];

  const { isLoading: templatesLoading, refetch: refetchTemplates } = useTemplate();

  const { data: batches = [], isLoading: batchesLoading, refetch: refetchBatches } = useBatches();

  // Get verification totals using the hook
  const verificationTotals = useVerificationTotals();

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchCampaigns(), refetchSenders(), refetchTemplates(), refetchBatches()]);
    setIsRefreshing(false);
  };

  // Calculate real stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c) => c.status === 'running' || c.status === 'sending',
  ).length;
  const scheduledCampaigns = campaigns.filter((c) => c.status === 'scheduled').length;

  // Calculate email stats
  const totalSent = campaigns.reduce((sum, c) => sum + (c.totalSent || 0), 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + (c.totalOpens || 0), 0);
  const totalReplied = campaigns.reduce((sum, c) => sum + (c.totalReplied || 0), 0);

  // Calculate rates
  const avgOpenRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0.0';
  const avgClickRate =
    campaigns.length > 0
      ? (campaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) / campaigns.length).toFixed(1)
      : '0.0';
  const avgReplyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : '0.0';

  // Contact stats
  const totalContacts =
    verificationTotals.verified + verificationTotals.invalid + verificationTotals.unverified;

  // Sender stats
  const totalSenders = senders.length;

  // Recent campaigns (last 5)
  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((campaign) => {
      const progress = campaign.totalRecipients
        ? Math.min(100, Math.round(((campaign.totalSent || 0) / campaign.totalRecipients) * 100))
        : 0;

      const openRate = campaign.totalSent
        ? `${Math.round(((campaign.totalOpens || 0) / campaign.totalSent) * 100)}%`
        : '-';
      const clickRate = campaign.totalSent
        ? `${Math.round(((campaign.totalClicks || 0) / campaign.totalSent) * 100)}%`
        : '-';

      let statusColor = '';
      let statusIcon = null;
      let statusLabel = campaign.status;

      switch (campaign.status) {
        case 'draft':
          statusColor = 'bg-gray-100 text-gray-800';
          statusIcon = <Edit className="w-4 h-4" />;
          statusLabel = t('dashboard.status.draft');
          break;
        case 'scheduled':
          statusColor = 'bg-amber-100 text-amber-800';
          statusIcon = <Clock className="w-4 h-4" />;
          statusLabel = t('dashboard.status.scheduled');
          break;
        case 'running':
        case 'sending':
          statusColor = 'bg-green-100 text-green-800';
          statusIcon = <Send className="w-4 h-4" />;
          statusLabel = t('dashboard.status.active');
          break;
        case 'completed':
          statusColor = 'bg-blue-100 text-blue-800';
          statusIcon = <CheckCircle className="w-4 h-4" />;
          statusLabel = t('dashboard.status.completed');
          break;
        case 'paused':
          statusColor = 'bg-red-100 text-red-800';
          statusIcon = <Pause className="w-4 h-4" />;
          statusLabel = t('dashboard.status.paused');
          break;
        default:
          statusColor = 'bg-gray-100 text-gray-800';
          statusIcon = <Edit className="w-4 h-4" />;
          statusLabel = campaign.status;
      }

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        statusLabel,
        statusColor,
        statusIcon,
        recipients: campaign.totalRecipients?.toLocaleString() || '0',
        openRate,
        clickRate,
        sentDate: campaign.scheduledAt
          ? new Date(campaign.scheduledAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
          : campaign.status === 'draft'
            ? t('dashboard.table.draft')
            : new Date(campaign.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
        progress,
      };
    });

  // Calculate campaign goal progress
  const monthlyGoal = 30; // Target campaigns per month
  const campaignsThisMonth = campaigns.filter((c) => {
    const createdAt = new Date(c.createdAt);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;
  const goalProgress = Math.min(100, Math.round((campaignsThisMonth / monthlyGoal) * 100));

  // Get next scheduled campaign
  const nextCampaign = campaigns
    .filter((c) => c.status === 'scheduled' && c.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  const daysUntilNext = nextCampaign
    ? Math.ceil((new Date(nextCampaign.scheduledAt) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Aggregate real performance data based on selected time range
  const performanceData = React.useMemo(() => {
    const now = new Date();
    const result = [];
    const range = parseInt(timeRange) || 30;

    for (let i = range - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const dailyStats = campaigns
        .filter((c) => {
          const cDate = new Date(c.createdAt || c.updatedAt).toISOString().split('T')[0];
          return cDate === dateString;
        })
        .reduce(
          (acc, c) => ({
            sent: acc.sent + (c.totalSent || 0),
            opens: acc.opens + (c.totalOpens || 0),
            replies: acc.replies + (c.totalReplied || 0),
          }),
          { sent: 0, opens: 0, replies: 0 },
        );

      let label = "";
      if (range <= 7) {
        label = date.toLocaleDateString(undefined, { weekday: 'short' });
      } else {
        label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }

      result.push({
        name: label,
        sent: dailyStats.sent,
        opens: dailyStats.opens,
        replies: dailyStats.replies,
      });
    }
    return result;
  }, [campaigns, timeRange]);

  // Stats cards data
  const stats = [
    {
      title: t("dashboard.stats.total_campaigns"),
      value: totalCampaigns.toString(),
      change: t("dashboard.stats.this_month", { count: campaignsThisMonth }),
      icon: <Send className="w-6 h-6 text-blue-600" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      description: t("dashboard.stats.campaigns_desc", { active: activeCampaigns, scheduled: scheduledCampaigns }),
      trend: 'up',
    },
    {
      title: t("dashboard.stats.open_rate"),
      value: `${avgOpenRate}%`,
      change: t("dashboard.stats.total_opens", { count: totalOpens }),
      icon: <MailOpen className="w-6 h-6 text-green-600" />,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      description: t("dashboard.stats.sent_desc", { count: totalSent || 0 }),
      trend: 'up',
    },
    {
      title: t("dashboard.stats.reply_rate"),
      value: `${avgReplyRate}%`,
      change: t("dashboard.stats.total_replies", { count: totalReplied }),
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      description: t("dashboard.stats.engagement_desc"),
      trend: 'up',
    },
    {
      title: t("dashboard.stats.contacts"),
      value: totalContacts.toLocaleString(),
      change: t("dashboard.stats.verified_count", { count: verificationTotals.verified }),
      icon: <Users className="w-6 h-6 text-amber-600" />,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      description: t("dashboard.stats.senders_ready", { count: totalSenders }),
      trend: 'up',
    },
  ];

  // Quick Actions
  const quickActions = [
    {
      title: t("dashboard.quick_actions.create_campaign"),
      description: t("dashboard.quick_actions.create_campaign_desc"),
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-linear-to-br from-blue-50 to-indigo-50',
      onClick: () => setShowCreateCampaignModal(true),
    },
    {
      title: t("dashboard.quick_actions.import_contacts"),
      description: t("dashboard.quick_actions.import_contacts_desc"),
      icon: <Users className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-linear-to-br from-green-50 to-emerald-50',
      onClick: () => audienceData.setShowUploadModal(true),
    },
    {
      title: t("dashboard.quick_actions.create_template"),
      description: t("dashboard.quick_actions.create_template_desc"),
      icon: <Edit className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-linear-to-br from-purple-50 to-purple-50',
      onClick: templateHandlers.handleCreateNew,
    },
    {
      title: t("dashboard.quick_actions.add_sender"),
      description: t("dashboard.quick_actions.add_sender_desc"),
      icon: <Send className="w-5 h-5" />,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-linear-to-br from-amber-50 to-amber-50',
      onClick: () => audienceData.setShowSenderModal(true),
    },
  ];

  // Recent activity
  const recentActivity = [
    ...campaigns.slice(0, 3).map((c) => ({
      id: `campaign-${c.id}`,
      type: 'campaign',
      title:
        c.status === 'completed'
          ? t("dashboard.activity.campaign_completed", { name: c.name })
          : t("dashboard.activity.campaign_status", { name: c.name, status: c.status.toLowerCase() }),
      time: new Date(c.updatedAt || c.createdAt).toLocaleString(),
      icon: c.status === 'completed' ? 'bg-green-500' : 'bg-blue-500',
    })),
    ...batches.slice(0, 2).map((b) => ({
      id: `batch-${b.id}`,
      type: 'batch',
      title: t("dashboard.activity.list_status", { name: b.originalFilename || 'Upload', status: b.status.toLowerCase() }),
      time: new Date(b.createdAt).toLocaleString(),
      icon: 'bg-purple-500',
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 3);

  const isLoading = campaignsLoading || sendersLoading || templatesLoading || batchesLoading;

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t("dashboard.loading_data")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full animate-in fade-in duration-500">
      {/* Header - Premium Alignment */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
            {t("dashboard.header_title")} <span className="text-gradient ms-3 me-3">{t("dashboard.header_subtitle")}</span>
            {isRefreshing && <Loader2 className="w-5 h-5 ms-4 me-4 animate-spin text-blue-500" />}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {t("dashboard.welcome_back")}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none ltr:pl-10 ltr:pr-10 rtl:pl-10 ltr:pr-10 rtl:pl-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
            >
              <option value="7">{t('analytics.last_7_days')}</option>
              <option value="30">{t('analytics.last_30_days')}</option>
              <option value="90">{t('analytics.last_90_days')}</option>
            </select>
            <Clock className="absolute ltr:left-3.5 ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <ChevronRight className="absolute ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-extrabold uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            {!isRefreshing && <RefreshCw className="w-4 h-4 me-2.5" />}
            {isRefreshing ? t("dashboard.syncing") : t("dashboard.refresh_data")}
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute -top-40 -inset-inline-start-40 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -inset-inline-end-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Hero Stats Section - Ultra-Premium Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="premium-card p-6 overflow-hidden relative group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
            >
              {/* Dynamic Decorative Elements */}
              <div
                className={`absolute inset-inline-end-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] blur-2xl group-hover:opacity-10 transition-opacity bg-linear-to-br ${stat.color}`}
              ></div>
              <div className="absolute top-0 inset-inline-end-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <TrendingUp className="w-12 h-12 text-blue-500/10 -rotate-12" />
              </div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl ${stat.bgColor} border border-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-500`}
                >
                  {stat.icon}
                </div>
                <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-1.5 transition-colors group-hover:bg-white group-hover:border-blue-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
                    {t('dashboard.performance.realtime')}
                  </span>
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-[0.15em]">
                  {stat.title}
                </p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter tabular-nums leading-none">
                    {stat.value}
                  </h3>
                  <div
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold mb-0.5 ${stat.trend === 'up' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 bg-slate-50'}`}
                  >
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {stat.change.split(' ')[0]}
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-bold mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
                  {stat.description}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-50 relative z-10 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {t('dashboard.performance.success_rate')}
                  </span>
                  <span className="text-[9px] font-extrabold text-blue-600">84%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-px">
                  <div
                    className={`h-full bg-linear-to-r ${stat.color} rounded-full transition-all duration-2000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)]`}
                    style={{ width: '84%' }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Performance Chart - Glassmorphism style inside premium card */}
          <div className="lg:col-span-2 premium-card p-6 flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  {t('dashboard.performance.title')}
                </h3>
                <p className="text-sm text-slate-500 font-medium tracking-wide">
                  {t('dashboard.performance.overview', { days: timeRange })}
                </p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl self-start">
                {['7', '30', '90'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === range
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {range}D
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-75 flex items-center justify-center rounded-3xl relative group overflow-hidden">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={performanceData}
                  margin={{
                    top: 40,
                    right: 20,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                    minTickGap={30}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '12px',
                    }}
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                  />
                  <Area
                    type="linear"
                    dataKey="sent"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSent)"
                    name={t('analytics.sent')}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#3b82f6' }}
                  />
                  <Area
                    type="linear"
                    dataKey="replies"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorReplies)"
                    name={t('analytics.replies')}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#8b5cf6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              {[
                {
                  label: t('dashboard.performance.avg_open'),
                  value: `${avgOpenRate}%`,
                  color: 'text-blue-600',
                },
                {
                  label: t('dashboard.performance.avg_click'),
                  value: `${avgClickRate}%`,
                  color: 'text-green-600',
                },
                {
                  label: t('dashboard.performance.avg_reply'),
                  value: `${avgReplyRate}%`,
                  color: 'text-purple-600',
                },
                {
                  label: t('dashboard.performance.deliverability'),
                  value: '98.2%',
                  color: 'text-emerald-600',
                },
              ].map((stat, i) => (
                <div key={i} className="text-center md:text-start">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>
                  <div className={`text-xl font-extrabold ${stat.color} tracking-tight`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="flex flex-col space-y-8">
            <div className="premium-card bg-white/40 backdrop-blur-3xl border-slate-200/50 p-8 shadow-2xl shadow-slate-900/5 relative overflow-hidden group">
              <div className="absolute -top-24 inset-inline-end-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center relative z-10">
                {t("dashboard.quick_actions.title")} <span className="text-blue-600 mx-2">{t("dashboard.quick_actions.span")}</span>
                <Sparkles className="w-4 h-4 ms-3 text-blue-500 animate-pulse" />
              </h3>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  >
                    {action.link ? (
                      <Link
                        to={action.link}
                        className="group bg-white/50 hover:bg-white border border-slate-100 hover:border-blue-100 p-5 rounded-3xl transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col items-center text-center w-full"
                      >
                        <QuickActionContent action={action} />
                      </Link>
                    ) : (
                      <button
                        onClick={action.onClick}
                        className="group bg-white/50 hover:bg-white border border-slate-100 hover:border-blue-100 p-5 rounded-3xl transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col items-center text-center w-full cursor-pointer"
                      >
                        <QuickActionContent action={action} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="premium-card p-6 flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-6">{t("dashboard.activity.title")}</h3>
              <div className="space-y-0 relative">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, idx) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="flex gap-6 group"
                    >
                      {/* Timeline Dot & Line Column */}
                      <div className="flex flex-col items-center flex-shrink-0 relative">
                        <div
                          className={`w-3.5 h-3.5 rounded-full ${activity.icon} border-2 border-white shadow-md relative z-10 group-hover:scale-125 transition-all duration-500`}
                        />
                        {idx !== recentActivity.length - 1 && (
                          <div className="w-px flex-1 bg-slate-100 my-2" />
                        )}
                      </div>

                      {/* Content Area */}
                      <div className={idx !== recentActivity.length - 1 ? "pb-8" : ""}>
                        <p className="text-xs font-black text-slate-700 leading-snug mb-2 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg w-max border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-all duration-300">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-medium">{t("dashboard.activity.no_activity")}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {t("dashboard.stats.total_senders")}
                    </p>
                    <div className="text-xl font-extrabold text-slate-800">{totalSenders}</div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm"
                      >
                        {i === 3 ? '+' : 'S'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Table - Premium List View */}
        <div className="premium-card overflow-hidden shadow-blue-500/5 mt-10">
          <div className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100/50 bg-white/40 backdrop-blur-xl">
            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                {t("dashboard.recent_campaigns.title")} <span className="text-blue-600">{t("dashboard.recent_campaigns.span")}</span>
              </h3>
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {t("dashboard.recent_campaigns.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard/campaigns"
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                {t("dashboard.recent_campaigns.view_all")}
              </Link>
              <Link
                to="/dashboard/campaigns/create"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("dashboard.recent_campaigns.new_campaign")}
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    {t("dashboard.table.campaign")}
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    {t("dashboard.table.status")}
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    {t("dashboard.table.reach")}
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    {t("dashboard.table.engagement")}
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    {t("dashboard.table.launch_date")}
                  </th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-end">
                    {t("dashboard.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentCampaigns.length > 0 ? (
                  recentCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center me-4 group-hover:scale-110 transition-transform">
                            <Send className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 mb-1">{campaign.name}</p>
                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: `${campaign.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${campaign.statusColor} border border-white/50 shadow-sm transition-transform group-hover:scale-105`}
                        >
                          <span className="me-2 opacity-70">{campaign.statusIcon}</span>
                          {campaign.statusLabel}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700 tracking-tight">
                            {campaign.recipients}
                          </span>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                            {t("dashboard.table.recipients")}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-blue-600 tracking-tight">
                              {campaign.openRate}
                            </span>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                              {t("dashboard.table.open")}
                            </span>
                          </div>
                          <div className="w-px h-6 bg-slate-100"></div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-indigo-600 tracking-tight">
                              {campaign.clickRate}
                            </span>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                              {t("dashboard.table.click")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                            {campaign.sentDate}
                          </span>
                          <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">
                            {t("dashboard.table.launched")}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-end">
                        <Link
                          to={`/dashboard/campaigns/${campaign.id}`}
                          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-2xl transition-all inline-flex items-center justify-center shadow-sm hover:shadow-xl hover:shadow-blue-500/10 border border-transparent hover:border-blue-100"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Send className="w-10 h-10 text-slate-200" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {t("dashboard.empty.no_campaigns")}
                      </h3>
                      <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">
                        {t("dashboard.empty.description")}
                      </p>
                      <Link to="/dashboard/campaigns/create" className="btn-primary">
                        {t("dashboard.empty.create_first")}
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Goal & Upcoming Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="premium-card p-8 bg-linear-to-br from-blue-600 to-indigo-700 text-white border-none shadow-blue-500/20 group">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-end">
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">
                  {t("dashboard.goal.title")}
                </p>
                <h4 className="text-2xl font-extrabold">{goalProgress}%</h4>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{t("dashboard.goal.growth")}</h3>
            <p className="text-blue-100 text-sm font-medium mb-6 whitespace-nowrap overflow-hidden text-ellipsis">
              {t("dashboard.goal.description", { completed: campaignsThisMonth, goal: monthlyGoal })}
            </p>

            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="premium-card p-8 group">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 bg-emerald-50 rounded-2xl transition-transform group-hover:rotate-12">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-end">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {t("dashboard.upcoming.title")}
                </span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">{t("dashboard.upcoming.next_launch")}</h3>

            {nextCampaign ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-4 italic">
                    &quot;{nextCampaign.name}&quot;
                  </p>
                  <div className="text-3xl font-extrabold text-slate-800">
                    {daysUntilNext === 0 ? t("dashboard.upcoming.launching_today") : t("dashboard.upcoming.in_days", { days: daysUntilNext })}
                  </div>
                </div>
                <Link
                  to={`/dashboard/campaigns/${nextCampaign.id}`}
                  className="btn-secondary rounded-2xl p-4 group-hover:bg-slate-800 group-hover:text-white transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-slate-500 font-medium italic">{t("dashboard.upcoming.no_scheduled")}</p>
                <Link
                  to="/dashboard/campaigns/create"
                  className="text-blue-600 font-bold text-sm hover:underline"
                >
                  {t("dashboard.upcoming.plan_now")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <ShowTemplate
        showTemplateModal={templateState.showTemplateModal}
        setShowTemplateModal={templateSetters.setShowTemplateModal}
        editingTemplate={templateState.editingTemplate}
        formData={templateState.formData}
        handleSaveTemplate={templateHandlers.handleSaveTemplate}
        setFormData={templateSetters.setFormData}
        editorMode={templateState.editorMode}
        setEditorMode={templateSetters.setEditorMode}
        defaultUserFields={templateState.defaultUserFields}
      />
      {audienceData.showUploadModal && (
        <ShowUpload
          setShowUploadModal={audienceData.setShowUploadModal}
          uploadStep={audienceData.uploadStep}
          resetUploadState={audienceData.resetUploadState}
          handleFileUpload={audienceData.handleFileUploadWrapper}
          mapping={audienceData.mapping}
          setMapping={audienceData.setMapping}
          fileHeaders={audienceData.fileHeaders}
          setUploadStep={audienceData.setUploadStep}
          handleContactsUpload={audienceData.handleContactsUpload}
          uploading={audienceData.isLoading.uploading}
        />
      )}
      {audienceData.showSenderModal && (
        <ShowSender
          setShowSenderModal={audienceData.setShowSenderModal}
          setSenderType={audienceData.setSenderType}
          senderType={audienceData.senderType}
          handleGmailOAuth={audienceData.handleGmailOAuth}
          handleOutlookOAuth={audienceData.handleOutlookOAuth}
          handleSmtpSubmit={audienceData.handleSmtpSubmit}
          smtpData={audienceData.smtpData}
          setSmtpData={audienceData.setSmtpData}
          isSubmitting={audienceData.isLoading.creatingSender}
        />
      )}
      <ShowCreateCampaign
        showModal={showCreateCampaignModal}
        setShowModal={setShowCreateCampaignModal}
      />
    </div>
  );
};

export default Dashboard;
