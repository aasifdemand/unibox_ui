import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Edit,
  Trash2,
  Users,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Download,
  Loader2,
  Target,
  Activity,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import ShowDelete from "../../../modals/showdelete";

// Import React Query hooks
import {
  useCampaign,
  useDeleteCampaign,
  useActivateCampaign,
  usePauseCampaign,
  useResumeCampaign,
} from "../../../hooks/useCampaign";

const ViewCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // React Query hooks
  const {
    data: campaign,
    isLoading,
    error,
    refetch: refetchCampaign,
  } = useCampaign(id);

  const deleteCampaign = useDeleteCampaign();
  const activateCampaign = useActivateCampaign();
  const pauseCampaign = usePauseCampaign();
  const resumeCampaign = useResumeCampaign();

  const handleDelete = async () => {
    try {
      await deleteCampaign.mutateAsync(id);
      toast.success("Campaign deleted successfully");
      navigate("/dashboard/campaigns");
    } catch (error) {
      toast.error(error.message || "Failed to delete campaign");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleActivate = async () => {
    try {
      await activateCampaign.mutateAsync(id);
      toast.success("Campaign activated successfully");
      refetchCampaign();
    } catch (error) {
      toast.error(error.message || "Failed to activate campaign");
    }
  };

  const handlePause = async () => {
    try {
      await pauseCampaign.mutateAsync(id);
      toast.success("Campaign paused successfully");
      refetchCampaign();
    } catch (error) {
      toast.error(error.message || "Failed to pause campaign");
    }
  };

  const handleResume = async () => {
    try {
      await resumeCampaign.mutateAsync(id);
      toast.success("Campaign resumed successfully");
      refetchCampaign();
    } catch (error) {
      toast.error(error.message || "Failed to resume campaign");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <Edit className="w-4 h-4 mr-1.5" />
            Draft
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-4 h-4 mr-1.5" />
            Scheduled
          </span>
        );
      case "running":
      case "sending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <Send className="w-4 h-4 mr-1.5" />
            Running
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Completed
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <Pause className="w-4 h-4 mr-1.5" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (isLoading && !campaign) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-gray-200/50 p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Campaign Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The campaign you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/dashboard/campaigns"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total recipients from CampaignRecipients array
  const totalRecipients = campaign.CampaignRecipients?.length || 0;
  const totalSent =
    campaign.CampaignRecipients?.filter(
      (r) => r.status === "sent" || r.status === "replied",
    ).length || 0;
  const totalReplied =
    campaign.CampaignRecipients?.filter((r) => r.status === "replied").length ||
    0;
  const totalOpened =
    campaign.CampaignRecipients?.filter((r) => r.openedAt).length || 0;
  const totalClicked =
    campaign.CampaignRecipients?.filter((r) => r.clickedAt).length || 0;

  const progress = totalRecipients
    ? Math.min(100, Math.round((totalSent / totalRecipients) * 100))
    : 0;

  return (
    <div className="p-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ShowDelete
          handleDelete={handleDelete}
          setShowDeleteModal={setShowDeleteModal}
          campaign={campaign}
          isDeleting={deleteCampaign.isPending}
        />
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/campaigns"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {campaign.name}
              </h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-gray-600">{campaign.subject || "No subject"}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          {/* Action buttons based on status */}
          {campaign.status === "draft" && (
            <button
              onClick={handleActivate}
              disabled={activateCampaign.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center disabled:opacity-50"
            >
              {activateCampaign.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Activate Campaign
            </button>
          )}

          {campaign.status === "running" && (
            <button
              onClick={handlePause}
              disabled={pauseCampaign.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-amber-600 to-amber-700 rounded-lg hover:from-amber-700 hover:to-amber-800 transition flex items-center disabled:opacity-50"
            >
              {pauseCampaign.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Pause className="w-4 h-4 mr-2" />
              )}
              Pause Campaign
            </button>
          )}

          {campaign.status === "paused" && (
            <button
              onClick={handleResume}
              disabled={resumeCampaign.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center disabled:opacity-50"
            >
              {resumeCampaign.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Resume Campaign
            </button>
          )}

          {(campaign.status === "draft" || campaign.status === "paused") && (
            <Link
              to={`/dashboard/campaigns/${campaign.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteCampaign.isPending}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition flex items-center disabled:opacity-50"
          >
            {deleteCampaign.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete
          </button>

          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition ${
              activeTab === "analytics"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("recipients")}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition ${
              activeTab === "recipients"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Recipients
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition ${
              activeTab === "content"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Content
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">
                  Total Recipients
                </p>
                <div className="p-2 rounded-lg bg-blue-50">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {totalRecipients.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">
                  Batch:{" "}
                  {campaign.ListUploadBatch?.originalFilename || "Unknown"}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <div className="p-2 rounded-lg bg-green-50">
                  <Send className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {totalSent.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">
                  {progress}% of total
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Opens</p>
                <div className="p-2 rounded-lg bg-purple-50">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {totalOpened.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">
                  {totalSent
                    ? `${Math.round((totalOpened / totalSent) * 100)}% open rate`
                    : "0% open rate"}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Replies</p>
                <div className="p-2 rounded-lg bg-amber-50">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {totalReplied.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">
                  {totalSent
                    ? `${Math.round((totalReplied / totalSent) * 100)}% reply rate`
                    : "0% reply rate"}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Overall Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {(totalRecipients - totalSent).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {totalSent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Campaign Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Campaign Name</p>
                  <p className="font-medium text-gray-900">{campaign.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject Line</p>
                  <p className="font-medium text-gray-900">
                    {campaign.subject || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Preview Text</p>
                  <p className="font-medium text-gray-900">
                    {campaign.previewText || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sender</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {campaign.senderType || "smtp"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(campaign.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scheduled For</p>
                  <p className="font-medium text-gray-900">
                    {campaign.scheduledAt
                      ? formatDate(campaign.scheduledAt)
                      : "Immediately"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(campaign.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Throttle Rate</p>
                  <p className="font-medium text-gray-900">
                    {campaign.throttlePerMinute || 10} emails/minute
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Campaign Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    campaign.trackOpens
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Track Opens
                  </p>
                  <p className="text-xs text-gray-500">
                    {campaign.trackOpens ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    campaign.trackClicks
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Track Clicks
                  </p>
                  <p className="text-xs text-gray-500">
                    {campaign.trackClicks ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    campaign.unsubscribeLink
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Unsubscribe Link
                  </p>
                  <p className="text-xs text-gray-500">
                    {campaign.unsubscribeLink ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Email Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSent.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Opens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOpened.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {totalSent
                    ? `${Math.round((totalOpened / totalSent) * 100)}%`
                    : "0%"}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalClicked.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {totalSent
                    ? `${Math.round((totalClicked / totalSent) * 100)}%`
                    : "0%"}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Replies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalReplied.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {totalSent
                    ? `${Math.round((totalReplied / totalSent) * 100)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Engagement Metrics
              </h3>
              <span className="text-xs text-gray-500">
                Updated in real-time
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Open Rate</span>
                  <span className="font-medium text-gray-900">
                    {totalSent
                      ? `${Math.round((totalOpened / totalSent) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${totalSent ? Math.round((totalOpened / totalSent) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Click Rate</span>
                  <span className="font-medium text-gray-900">
                    {totalSent
                      ? `${Math.round((totalClicked / totalSent) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{
                      width: `${totalSent ? Math.round((totalClicked / totalSent) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Reply Rate</span>
                  <span className="font-medium text-gray-900">
                    {totalSent
                      ? `${Math.round((totalReplied / totalSent) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{
                      width: `${totalSent ? Math.round((totalReplied / totalSent) * 100) : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "recipients" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recipient List
            </h3>
            <div className="flex items-center space-x-3">
              <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center">
                <Download className="w-4 h-4 mr-1.5" />
                Export CSV
              </button>
              <span className="text-sm text-gray-500">
                {totalRecipients} total
              </span>
            </div>
          </div>

          {/* Recipients Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Replied At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaign.CampaignRecipients?.map((recipient) => (
                  <tr key={recipient.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {recipient.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {recipient.name || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          recipient.status === "replied"
                            ? "bg-green-100 text-green-800"
                            : recipient.status === "sent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {recipient.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {recipient.lastSentAt
                        ? formatDate(recipient.lastSentAt)
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {recipient.repliedAt
                        ? formatDate(recipient.repliedAt)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!campaign.CampaignRecipients ||
            campaign.CampaignRecipients.length === 0) && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No recipients yet
              </h4>
              <p className="text-gray-600">
                Recipients will appear here once the campaign starts sending.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "content" && (
        <div className="space-y-8">
          {/* Email Content */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Email Content
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Subject</p>
                <p className="font-medium text-gray-900">
                  {campaign.subject || "N/A"}
                </p>
              </div>
              {campaign.previewText && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Preview Text</p>
                  <p className="text-gray-700">{campaign.previewText}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-2">HTML Content</p>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div
                    dangerouslySetInnerHTML={{ __html: campaign.htmlBody }}
                    className="prose max-w-none"
                  />
                </div>
              </div>
              {campaign.textBody && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Plain Text Version
                  </p>
                  <pre className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm font-mono whitespace-pre-wrap">
                    {campaign.textBody}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Template Variables */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Template Variables
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                The following variables are available in your email template:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <code className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">
                    {"{{name}}"}
                  </code>
                  <span className="text-xs text-gray-600">
                    Recipient's name
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">
                    {"{{email}}"}
                  </code>
                  <span className="text-xs text-gray-600">
                    Recipient's email
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">
                    {"{{unsubscribe}}"}
                  </code>
                  <span className="text-xs text-gray-600">
                    Unsubscribe link
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCampaign;
