import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  MailOpen,
  Clock,
  BarChart3,
  PieChart,
  Eye,
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
} from "lucide-react";

// Import React Query hooks
import { useCampaigns } from "../../hooks/useCampaign";
import { useSenders } from "../../hooks/useSenders";
import { useTemplate } from "../../hooks/useTemplate";
import { useBatches, useVerificationTotals } from "../../hooks/useBatches";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("30");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // React Query hooks
  const {
    data: campaigns = [],
    isLoading: campaignsLoading,
    refetch: refetchCampaigns,
  } = useCampaigns();

  const {
    data: senders = [],
    isLoading: sendersLoading,
    refetch: refetchSenders,
  } = useSenders();

  const { isLoading: templatesLoading, refetch: refetchTemplates } =
    useTemplate();

  const {
    data: batches = [],
    isLoading: batchesLoading,
    refetch: refetchBatches,
  } = useBatches();

  // Get verification totals using the hook
  const verificationTotals = useVerificationTotals();

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchCampaigns(),
      refetchSenders(),
      refetchTemplates(),
      refetchBatches(),
    ]);
    setIsRefreshing(false);
  };

  // Calculate real stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "running" || c.status === "sending",
  ).length;
  const scheduledCampaigns = campaigns.filter(
    (c) => c.status === "scheduled",
  ).length;

  // Calculate email stats
  const totalSent = campaigns.reduce((sum, c) => sum + (c.totalSent || 0), 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + (c.totalOpens || 0), 0);
  const totalReplied = campaigns.reduce(
    (sum, c) => sum + (c.totalReplied || 0),
    0,
  );

  // Calculate rates
  const avgOpenRate =
    totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : "0.0";
  const avgClickRate =
    campaigns.length > 0
      ? (
        campaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) /
        campaigns.length
      ).toFixed(1)
      : "0.0";
  const avgReplyRate =
    totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : "0.0";

  // Contact stats
  const totalContacts =
    verificationTotals.verified +
    verificationTotals.invalid +
    verificationTotals.unverified;

  // Sender stats
  const totalSenders = senders.length;

  // Recent campaigns (last 5)
  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((campaign) => {
      const progress = campaign.totalRecipients
        ? Math.min(
          100,
          Math.round(
            ((campaign.totalSent || 0) / campaign.totalRecipients) * 100,
          ),
        )
        : 0;

      const openRate = campaign.totalSent
        ? `${Math.round(((campaign.totalOpens || 0) / campaign.totalSent) * 100)}%`
        : "-";
      const clickRate = campaign.totalSent
        ? `${Math.round(((campaign.totalClicks || 0) / campaign.totalSent) * 100)}%`
        : "-";

      let statusColor = "";
      let statusIcon = null;
      let statusLabel = campaign.status;

      switch (campaign.status) {
        case "draft":
          statusColor = "bg-gray-100 text-gray-800";
          statusIcon = <Edit className="w-4 h-4" />;
          break;
        case "scheduled":
          statusColor = "bg-amber-100 text-amber-800";
          statusIcon = <Clock className="w-4 h-4" />;
          break;
        case "running":
        case "sending":
          statusColor = "bg-green-100 text-green-800";
          statusIcon = <Send className="w-4 h-4" />;
          statusLabel = "active";
          break;
        case "completed":
          statusColor = "bg-blue-100 text-blue-800";
          statusIcon = <CheckCircle className="w-4 h-4" />;
          break;
        case "paused":
          statusColor = "bg-red-100 text-red-800";
          statusIcon = <Pause className="w-4 h-4" />;
          break;
        default:
          statusColor = "bg-gray-100 text-gray-800";
          statusIcon = <Edit className="w-4 h-4" />;
      }

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        statusLabel,
        statusColor,
        statusIcon,
        recipients: campaign.totalRecipients?.toLocaleString() || "0",
        openRate,
        clickRate,
        sentDate: campaign.scheduledAt
          ? new Date(campaign.scheduledAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          : campaign.status === "draft"
            ? "Draft"
            : new Date(campaign.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
        progress,
      };
    });

  // Calculate campaign goal progress
  const monthlyGoal = 30; // Target campaigns per month
  const campaignsThisMonth = campaigns.filter((c) => {
    const createdAt = new Date(c.createdAt);
    const now = new Date();
    return (
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    );
  }).length;
  const goalProgress = Math.min(
    100,
    Math.round((campaignsThisMonth / monthlyGoal) * 100),
  );

  // Get next scheduled campaign
  const nextCampaign = campaigns
    .filter((c) => c.status === "scheduled" && c.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  const daysUntilNext = nextCampaign
    ? Math.ceil(
      (new Date(nextCampaign.scheduledAt) - new Date()) /
      (1000 * 60 * 60 * 24),
    )
    : null;

  // Stats cards data
  const stats = [
    {
      title: "Total Campaigns",
      value: totalCampaigns.toString(),
      change: `+${campaignsThisMonth} this month`,
      icon: <Send className="w-6 h-6 text-blue-600" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      description: `${activeCampaigns} active, ${scheduledCampaigns} scheduled`,
      trend: "up",
    },
    {
      title: "Open Rate",
      value: `${avgOpenRate}%`,
      change: `${totalOpens.toLocaleString()} total opens`,
      icon: <MailOpen className="w-6 h-6 text-green-600" />,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      description: `${(totalSent || 0).toLocaleString()} emails sent`,
      trend: "up",
    },
    {
      title: "Reply Rate",
      value: `${avgReplyRate}%`,
      change: `${totalReplied.toLocaleString()} total replies`,
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      description: "Campaign engagement",
      trend: "up",
    },
    {
      title: "Contacts",
      value: totalContacts.toLocaleString(),
      change: `${verificationTotals.verified.toLocaleString()} verified`,
      icon: <Users className="w-6 h-6 text-amber-600" />,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      description: `${totalSenders} senders ready`,
      trend: "up",
    },
  ];

  // Quick Actions
  const quickActions = [
    {
      title: "Create Campaign",
      description: "Start a new email campaign",
      icon: <Sparkles className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-linear-to-br from-blue-50 to-indigo-50",
      link: "/dashboard/campaigns/create",
    },
    {
      title: "Import Contacts",
      description: "Add new subscribers",
      icon: <Users className="w-5 h-5" />,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-linear-to-br from-green-50 to-emerald-50",
      link: "/dashboard/audience",
    },
    {
      title: "Create Template",
      description: "Design email templates",
      icon: <Edit className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-linear-to-br from-purple-50 to-purple-50",
      link: "/dashboard/templates/create",
    },
    {
      title: "Add Sender",
      description: "Connect email account",
      icon: <Send className="w-5 h-5" />,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-linear-to-br from-amber-50 to-amber-50",
      link: "/dashboard/audience",
    },
  ];

  // Recent activity
  const recentActivity = [
    ...campaigns.slice(0, 3).map((c) => ({
      id: `campaign-${c.id}`,
      type: "campaign",
      title:
        c.status === "completed"
          ? `Campaign "${c.name}" completed`
          : `Campaign "${c.name}" ${c.status}`,
      time: new Date(c.updatedAt || c.createdAt).toLocaleString(),
      icon: c.status === "completed" ? "bg-green-500" : "bg-blue-500",
    })),
    ...batches.slice(0, 2).map((b) => ({
      id: `batch-${b.id}`,
      type: "batch",
      title: `List "${b.originalFilename || "Upload"}" ${b.status}`,
      time: new Date(b.createdAt).toLocaleString(),
      icon: "bg-purple-500",
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 3);

  const isLoading =
    campaignsLoading || sendersLoading || templatesLoading || batchesLoading;

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
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
            Dashboard <span className="text-gradient ml-3">Overview</span>
            {isRefreshing && (
              <Loader2 className="w-5 h-5 ml-4 animate-spin text-blue-500" />
            )}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Welcome back! Here's a summary of your workspace performance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-primary flex items-center"
          >
            {!isRefreshing && <RefreshCw className="w-4 h-4 mr-2" />}
            {isRefreshing ? "Syncing..." : "Sync Data"}
          </button>
        </div>
      </div>

      {/* Hero Stats Section - Ultra-Premium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="premium-card p-6 overflow-hidden relative group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            {/* Dynamic Decorative Elements */}
            <div
              className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] blur-2xl group-hover:opacity-10 transition-opacity bg-linear-to-br ${stat.color}`}
            ></div>
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
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
                  Real-time
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
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold mb-0.5 ${stat.trend === "up" ? "text-blue-600 bg-blue-50" : "text-slate-400 bg-slate-50"}`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {stat.change.split(" ")[0]}
                </div>
              </div>

              <p className="text-xs text-slate-500 font-bold mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
                {stat.description}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-50 relative z-10 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Success Rate
                </span>
                <span className="text-[9px] font-extrabold text-blue-600">84%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-px">
                <div
                  className={`h-full bg-linear-to-r ${stat.color} rounded-full group-hover:translate-x-0 transition-transform duration-1000 ease-out`}
                  style={{ width: "84%", transform: "translateX(-20%)" }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Performance Chart - Glassmorphism style inside premium card */}
        <div className="lg:col-span-2 premium-card p-6 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                Campaign Performance
              </h3>
              <p className="text-sm text-slate-500 font-medium tracking-wide">
                OVERVIEW FOR THE LAST {timeRange} DAYS
              </p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl self-start">
              {["7", "30", "90"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === range
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {range}D
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-75 flex items-center justify-center bg-linear-to-b from-slate-50/50 to-white rounded-3xl border border-slate-100 relative group overflow-hidden">
            {/* Decorative Background circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

            <div className="relative z-10 text-center px-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-800 mb-2">
                {totalSent > 0 ? totalSent.toLocaleString() : "Syncing..."}
              </h4>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                {campaigns.length > 0
                  ? `Total emails delivered across ${campaigns.length} campaigns with ${avgOpenRate}% average open rate.`
                  : "Connect a sender and start your first campaign to see analytics here."}
              </p>

              <div className="mt-8 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Sent
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Opened
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Replies
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            {[
              {
                label: "Avg Open Rate",
                value: `${avgOpenRate}%`,
                color: "text-blue-600",
              },
              {
                label: "Avg Click Rate",
                value: `${avgClickRate}%`,
                color: "text-green-600",
              },
              {
                label: "Avg Reply Rate",
                value: `${avgReplyRate}%`,
                color: "text-purple-600",
              },
              {
                label: "Deliverability",
                value: "98.2%",
                color: "text-emerald-600",
              },
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <div
                  className={`text-xl font-extrabold ${stat.color} tracking-tight`}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="flex flex-col space-y-8">
          <div className="premium-card p-6 shadow-blue-500/5">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              Quick Actions
              <Sparkles className="w-4 h-4 ml-2 text-blue-500" />
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="group flex items-center p-3 rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-transparent hover:border-slate-100"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${action.color} p-0.5 shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                      <div
                        className={`text-transparent bg-linear-to-br ${action.color} bg-clip-text`}
                      >
                        {action.icon}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 mb-0.5 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div className="premium-card p-6 flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-6">
              Activity Timeline
            </h3>
            <div className="space-y-6 relative before:absolute before:left-2.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="relative pl-8 group">
                    <div
                      className={`absolute left-0 top-1.5 w-6 h-6 rounded-full ${activity.icon} border-4 border-white shadow-sm transition-transform group-hover:scale-125`}
                    ></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight mb-1">
                        {activity.title}
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">
                    No recent activity
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Total Senders
                  </p>
                  <div className="text-xl font-extrabold text-slate-800">
                    {totalSenders}
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm"
                    >
                      {i === 3 ? "+" : "S"}
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
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              Recent Campaigns
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Manage and monitor your active outreach efforts.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/dashboard/campaigns" className="btn-secondary text-sm">
              <Eye className="w-4 h-4 mr-2 inline" /> View All
            </Link>
            <Link
              to="/dashboard/campaigns/create"
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4 mr-2 inline" /> New Campaign
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Campaign
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Status
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Reach
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Engagement
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Launch Date
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentCampaigns.length > 0 ? (
                recentCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="group hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <Send className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 mb-1">
                            {campaign.name}
                          </p>
                          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                              style={{ width: `${campaign.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${campaign.statusColor} border border-white/50 shadow-sm`}
                      >
                        <span className="mr-1.5">{campaign.statusIcon}</span>
                        {campaign.statusLabel}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">
                        {campaign.recipients}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Recipients
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            {campaign.openRate}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Open
                          </p>
                        </div>
                        <div className="w-px h-6 bg-slate-100"></div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            {campaign.clickRate}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Click
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500 italic">
                      {campaign.sentDate}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link
                        to={`/dashboard/campaigns/${campaign.id}`}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all inline-block"
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
                      No campaigns launched yet
                    </h3>
                    <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">
                      Start your outreach by creating your first personalized
                      campaign.
                    </p>
                    <Link
                      to="/dashboard/campaigns/create"
                      className="btn-primary"
                    >
                      Create First Campaign
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
            <div className="text-right">
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">
                Monthly Goal
              </p>
              <h4 className="text-2xl font-extrabold">{goalProgress}%</h4>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">Workspace Growth</h3>
          <p className="text-blue-100 text-sm font-medium mb-6">
            You've completed{" "}
            <span className="text-white font-bold">{campaignsThisMonth}</span>{" "}
            of your <span className="text-white font-bold">{monthlyGoal}</span>{" "}
            campaigns goal for this month.
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
            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Upcoming
              </span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Next Scheduled Launch
          </h3>

          {nextCampaign ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-4 italic">
                  "{nextCampaign.name}"
                </p>
                <div className="text-3xl font-extrabold text-slate-800">
                  {daysUntilNext === 0
                    ? "Launching Today"
                    : `In ${daysUntilNext} Days`}
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
              <p className="text-slate-500 font-medium italic">
                No campaigns scheduled yet.
              </p>
              <Link
                to="/dashboard/campaigns/create"
                className="text-blue-600 font-bold text-sm hover:underline"
              >
                Plan one now →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
