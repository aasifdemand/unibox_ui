import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useCampaignStore } from "../../store/campaign.store";
import { useSenderStore } from "../../store/sender.store";
import { useTemplateStore } from "../../store/template.store";
import { useUploadStore } from "../../store/upload.store";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("30");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Store data
  const {
    campaigns,
    isLoading: campaignsLoading,
    fetchCampaigns,
  } = useCampaignStore();

  const { senders, isLoading: sendersLoading, fetchSenders } = useSenderStore();

  const {
    templates,
    isLoading: templatesLoading,
    fetchTemplates,
  } = useTemplateStore();

  const {
    batches,
    isLoading: batchesLoading,
    fetchBatches,
    getVerificationTotals,
  } = useUploadStore();

  // Fetch all data on mount
  useEffect(() => {
    fetchCampaigns();
    fetchSenders();
    fetchTemplates();
    fetchBatches();
  }, [fetchCampaigns, fetchSenders, fetchTemplates, fetchBatches]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchCampaigns(),
      fetchSenders(),
      fetchTemplates(),
      fetchBatches(),
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

  // const draftCampaigns = campaigns.filter((c) => c.status === "draft").length;
  const completedCampaigns = campaigns.filter(
    (c) => c.status === "completed",
  ).length;

  // Calculate email stats
  const totalSent = campaigns.reduce((sum, c) => sum + (c.totalSent || 0), 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + (c.totalOpens || 0), 0);
  const totalReplied = campaigns.reduce(
    (sum, c) => sum + (c.totalReplied || 0),
    0,
  );
  // const totalRecipients = campaigns.reduce(
  //   (sum, c) => sum + (c.totalRecipients || 0),
  //   0,
  // );

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

  // Get verification totals
  const verificationTotals = getVerificationTotals();
  const totalContacts =
    verificationTotals.verified +
    verificationTotals.invalid +
    verificationTotals.unverified;

  // Sender stats
  const totalSenders = senders.length;
  const verifiedSenders = senders.filter((s) => s.isVerified).length;
  const gmailSenders = senders.filter((s) => s.type === "gmail").length;
  const outlookSenders = senders.filter((s) => s.type === "outlook").length;
  const smtpSenders = senders.filter((s) => s.type === "smtp").length;

  // Template stats
  const totalTemplates = templates.length;

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

  // Get top performing campaign
  const topCampaign = [...campaigns]
    .filter((c) => c.totalSent > 0)
    .sort((a, b) => (b.totalOpens || 0) - (a.totalOpens || 0))[0];

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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your campaigns today.
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-white">{stat.icon}</div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-green-600">
                    {stat.change}
                  </span>
                </div>
                <div
                  className={`w-12 h-2 rounded-full bg-linear-to-r ${stat.color}`}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Campaign Performance
              </h3>
              <p className="text-sm text-gray-600">
                Last {timeRange} days overview
              </p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50/30 rounded-xl border border-gray-200/50">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {campaigns.length > 0
                  ? `${campaigns.length} campaigns, ${totalSent.toLocaleString()} emails sent`
                  : "No campaign data yet"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {activeCampaigns} active • {scheduledCampaigns} scheduled •{" "}
                {completedCampaigns} completed
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {avgOpenRate}%
              </div>
              <div className="text-sm text-gray-600">Open Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {avgClickRate}%
              </div>
              <div className="text-sm text-gray-600">Click Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {avgReplyRate}%
              </div>
              <div className="text-sm text-gray-600">Reply Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {((verifiedSenders / (totalSenders || 1)) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Senders Ready</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`w-full p-4 rounded-xl ${action.bgColor} border border-gray-200/50 hover:shadow-md transition-all text-left flex items-center justify-between`}
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-lg bg-linear-to-r ${action.color} bg-opacity-20`}
                  >
                    <div
                      className={`text-transparent bg-linear-to-r ${action.color} bg-clip-text`}
                    >
                      {action.icon}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div
                      className={`w-2 h-2 ${activity.icon} rounded-full mr-3`}
                    ></div>
                    <div>
                      <p className="text-sm text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Senders</p>
                <p className="text-xl font-semibold text-gray-900">
                  {totalSenders}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {gmailSenders} Gmail • {outlookSenders} Outlook •{" "}
                  {smtpSenders} SMTP
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Templates</p>
                <p className="text-xl font-semibold text-gray-900">
                  {totalTemplates}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ready to use</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/50">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Campaigns
              </h3>
              <p className="text-sm text-gray-600">
                {campaigns.length} total campaigns • {activeCampaigns} active
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard/campaigns"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Link>
              <Link
                to="/dashboard/campaigns/create"
                className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                New Campaign
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Campaign Name
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Click Rate
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Sent Date
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentCampaigns.length > 0 ? (
                recentCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="hover:bg-gray-50/50 transition"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center mr-3">
                          <Send className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {campaign.name}
                          </p>
                          <div className="w-48 h-2 bg-gray-200 rounded-full mt-2">
                            <div
                              className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full"
                              style={{ width: `${campaign.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${campaign.statusColor}`}
                      >
                        {campaign.statusIcon}
                        <span className="ml-1.5 capitalize">
                          {campaign.statusLabel}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-900">{campaign.recipients}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <p className="text-gray-900">{campaign.openRate}</p>
                        {campaign.openRate !== "-" &&
                          parseFloat(campaign.openRate) > 30 && (
                            <TrendingUp className="w-4 h-4 text-green-500 ml-2" />
                          )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <p className="text-gray-900">{campaign.clickRate}</p>
                        {campaign.clickRate !== "-" &&
                          parseFloat(campaign.clickRate) > 15 && (
                            <TrendingUp className="w-4 h-4 text-green-500 ml-2" />
                          )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-900">{campaign.sentDate}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/dashboard/campaigns/${campaign.id}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {(campaign.status === "draft" ||
                          campaign.status === "paused") && (
                          <Link
                            to={`/dashboard/campaigns/${campaign.id}/edit`}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No campaigns yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get started by creating your first email campaign
                    </p>
                    <Link
                      to="/dashboard/campaigns/create"
                      className="px-4 py-2 font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition inline-flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {campaigns.length > 5 && (
          <div className="px-6 py-4 border-t border-gray-200/50 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">5</span> of{" "}
              <span className="font-medium">{campaigns.length}</span> campaigns
            </p>
            <Link
              to="/dashboard/campaigns"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all campaigns →
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-linear-to-br from-blue-50 to-indigo-50/30 rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center">
            <Target className="w-6 h-6 text-blue-600" />
            <h4 className="ml-3 font-medium text-gray-900">Campaign Goal</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-4">
            {goalProgress}% Complete
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full"
              style={{ width: `${goalProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Target: {monthlyGoal} campaigns this month • {campaignsThisMonth}{" "}
            created
          </p>
        </div>

        <div className="bg-linear-to-br from-green-50 to-emerald-50/30 rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-green-600" />
            <h4 className="ml-3 font-medium text-gray-900">Next Campaign</h4>
          </div>
          {nextCampaign ? (
            <>
              <p className="text-2xl font-bold text-gray-900 mt-4">
                {daysUntilNext === 0
                  ? "Today"
                  : daysUntilNext === 1
                    ? "Tomorrow"
                    : `In ${daysUntilNext} days`}
              </p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                "{nextCampaign.name}" scheduled for{" "}
                {new Date(nextCampaign.scheduledAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  },
                )}
              </p>
              <Link
                to={`/dashboard/campaigns/${nextCampaign.id}`}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition inline-block"
              >
                View Details
              </Link>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900 mt-4">None</p>
              <p className="text-sm text-gray-600 mt-2">
                No scheduled campaigns
              </p>
              <Link
                to="/dashboard/campaigns/create"
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition inline-block"
              >
                Create Campaign
              </Link>
            </>
          )}
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-50/30 rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center">
            <PieChart className="w-6 h-6 text-purple-600" />
            <h4 className="ml-3 font-medium text-gray-900">Top Performing</h4>
          </div>
          {topCampaign ? (
            <>
              <p className="text-2xl font-bold text-gray-900 mt-4 line-clamp-1">
                {topCampaign.name}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {topCampaign.totalOpens?.toLocaleString() || 0} opens •{" "}
                {topCampaign.totalClicks?.toLocaleString() || 0} clicks
              </p>
              <div className="flex items-center mt-4">
                <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
                  {(
                    ((topCampaign.totalOpens || 0) /
                      (topCampaign.totalSent || 1)) *
                    100
                  ).toFixed(1)}
                  % open rate
                </div>
                {topCampaign.totalReplied > 0 && (
                  <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium ml-2">
                    {topCampaign.totalReplied} replies
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900 mt-4">No data</p>
              <p className="text-sm text-gray-600 mt-2">
                Send your first campaign to see performance
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
