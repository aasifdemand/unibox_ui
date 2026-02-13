import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Send,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Pause,
  Play,
  Download,
  ChevronDown,
  Mail,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ShowDelete from "../../../modals/showdelete";

// Import React Query hooks
import {
  useCampaigns,
  useActivateCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useDeleteCampaign,
} from "../../../hooks/useCampaign";

const Campaigns = () => {
  const navigate = useNavigate();
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  // React Query hooks
  const {
    data: campaigns = [],
    isLoading,
    refetch: refetchCampaigns,
  } = useCampaigns();

  const activateCampaign = useActivateCampaign();
  const pauseCampaign = usePauseCampaign();
  const resumeCampaign = useResumeCampaign();
  const deleteCampaign = useDeleteCampaign();

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      searchTerm === "" ||
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "running" || c.status === "sending",
  ).length;
  const scheduledCampaigns = campaigns.filter(
    (c) => c.status === "scheduled",
  ).length;
  const draftCampaigns = campaigns.filter((c) => c.status === "draft").length;
  const completedCampaigns = campaigns.filter(
    (c) => c.status === "completed",
  ).length;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "draft":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <Edit className="w-4 h-4" />,
          label: "Draft",
        };
      case "scheduled":
        return {
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: <Clock className="w-4 h-4" />,
          label: "Scheduled",
        };
      case "running":
      case "sending":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <Send className="w-4 h-4" />,
          label: "Running",
        };
      case "completed":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Completed",
        };
      case "paused":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <Pause className="w-4 h-4" />,
          label: "Paused",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <Edit className="w-4 h-4" />,
          label: status,
        };
    }
  };

  // Calculate progress
  const calculateProgress = (campaign) => {
    if (!campaign.totalRecipients || campaign.totalRecipients === 0) return 0;
    if (campaign.status === "completed") return 100;
    const sent = campaign.totalSent || 0;
    const total = campaign.totalRecipients || 1;
    return Math.min(100, Math.round((sent / total) * 100));
  };

  // Calculate open rate
  const calculateOpenRate = (campaign) => {
    if (!campaign.totalSent || campaign.totalSent === 0) return "-";
    const opens = campaign.totalOpens || 0;
    return `${Math.round((opens / campaign.totalSent) * 100)}%`;
  };

  // Calculate click rate
  const calculateClickRate = (campaign) => {
    if (!campaign.totalSent || campaign.totalSent === 0) return "-";
    const clicks = campaign.totalClicks || 0;
    return `${Math.round((clicks / campaign.totalSent) * 100)}%`;
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCampaigns(filteredCampaigns.map((c) => c.id));
    } else {
      setSelectedCampaigns([]);
    }
  };

  const handleSelectCampaign = (id) => {
    if (selectedCampaigns.includes(id)) {
      setSelectedCampaigns(selectedCampaigns.filter((c) => c !== id));
    } else {
      setSelectedCampaigns([...selectedCampaigns, id]);
    }
  };

  // Campaign action handlers
  const handleActivateCampaign = async (campaignId) => {
    try {
      await activateCampaign.mutateAsync(campaignId);
      toast.success("Campaign activated successfully!");
      refetchCampaigns();
    } catch (error) {
      toast.error(error.message || "Failed to activate campaign");
    }
  };

  const handlePauseCampaign = async (campaignId) => {
    try {
      await pauseCampaign.mutateAsync(campaignId);
      toast.success("Campaign paused successfully");
      refetchCampaigns();
    } catch (error) {
      toast.error(error.message || "Failed to pause campaign");
    }
  };

  const handleResumeCampaign = async (campaignId) => {
    try {
      await resumeCampaign.mutateAsync(campaignId);
      toast.success("Campaign resumed successfully");
      refetchCampaigns();
    } catch (error) {
      toast.error(error.message || "Failed to resume campaign");
    }
  };

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;

    try {
      await deleteCampaign.mutateAsync(campaignToDelete.id);
      toast.success("Campaign deleted successfully");
      setShowDeleteModal(false);
      setCampaignToDelete(null);
      refetchCampaigns();
    } catch (error) {
      toast.error(error.message || "Failed to delete campaign");
    }
  };

  const handleEditCampaign = (campaignId) => {
    navigate(`/dashboard/campaigns/${campaignId}/edit`);
  };

  const handleViewCampaign = (campaignId) => {
    navigate(`/dashboard/campaigns/${campaignId}`);
  };

  const handleBulkDelete = async () => {
    if (selectedCampaigns.length === 0) return;

    try {
      toast.loading(`Deleting ${selectedCampaigns.length} campaigns...`);
      let successCount = 0;
      let failCount = 0;

      for (const id of selectedCampaigns) {
        try {
          await deleteCampaign.mutateAsync(id);
          successCount++;
        } catch {
          failCount++;
        }
      }

      toast.dismiss();
      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} campaigns`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} campaigns`);
      }
      setSelectedCampaigns([]);
      refetchCampaigns();
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete selected campaigns");
    }
  };

  const handleBulkPause = async () => {
    if (selectedCampaigns.length === 0) return;

    try {
      toast.loading(`Pausing ${selectedCampaigns.length} campaigns...`);
      let successCount = 0;
      let failCount = 0;

      for (const id of selectedCampaigns) {
        const campaign = campaigns.find((c) => c.id === id);
        if (campaign?.status === "running" || campaign?.status === "sending") {
          try {
            await pauseCampaign.mutateAsync(id);
            successCount++;
          } catch {
            failCount++;
          }
        }
      }

      toast.dismiss();
      if (successCount > 0) {
        toast.success(`Paused ${successCount} campaigns`);
      }
      if (failCount > 0) {
        toast.error(`Failed to pause ${failCount} campaigns`);
      }
      setSelectedCampaigns([]);
      refetchCampaigns();
    } catch (error) {
      console.log(error);

      toast.error("Failed to pause selected campaigns");
    }
  };

  const handleBulkActivate = async () => {
    if (selectedCampaigns.length === 0) return;

    try {
      toast.loading(`Activating ${selectedCampaigns.length} campaigns...`);
      let successCount = 0;
      let failCount = 0;

      for (const id of selectedCampaigns) {
        const campaign = campaigns.find((c) => c.id === id);
        if (campaign?.status === "draft") {
          try {
            await activateCampaign.mutateAsync(id);
            successCount++;
          } catch {
            failCount++;
          }
        }
      }

      toast.dismiss();
      if (successCount > 0) {
        toast.success(`Activated ${successCount} campaigns`);
      }
      if (failCount > 0) {
        toast.error(`Failed to activate ${failCount} campaigns`);
      }
      setSelectedCampaigns([]);
      refetchCampaigns();
    } catch (error) {
      console.log(error);

      toast.error("Failed to activate selected campaigns");
    }
  };

  // Status options
  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Running", value: "running" },
    { label: "Paused", value: "paused" },
    { label: "Completed", value: "completed" },
  ];

  // Loading state
  const isAnyLoading =
    isLoading ||
    activateCampaign.isPending ||
    pauseCampaign.isPending ||
    resumeCampaign.isPending ||
    deleteCampaign.isPending;

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showDeleteModal && (
        <ShowDelete
          campaign={campaignToDelete}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          handleDelete={handleDeleteConfirm}
          isDeleting={deleteCampaign.isPending}
        />
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your email campaigns in one place
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <Link
            to={"/dashboard/campaigns/create"}
            className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-linear-to-br from-blue-50 to-indigo-50/30 rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Campaigns
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {totalCampaigns}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-white">
              <Layers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-green-50 to-emerald-50/30 rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {activeCampaigns}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-white">
              <Send className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-amber-50 to-amber-50/30 rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {scheduledCampaigns}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-white">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-gray-50 to-gray-50/30 rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {draftCampaigns}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-white">
              <Edit className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {completedCampaigns}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-white">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/50 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns by name, subject..."
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCampaigns.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Send className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium text-blue-900">
                {selectedCampaigns.length} campaign
                {selectedCampaigns.length > 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkPause}
                disabled={pauseCampaign.isPending}
                className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
              >
                Pause Selected
              </button>
              <button
                onClick={handleBulkActivate}
                disabled={activateCampaign.isPending}
                className="px-3 py-1.5 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
              >
                Activate Selected
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleteCampaign.isPending}
                className="px-3 py-1.5 text-sm font-medium text-white bg-linear-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition disabled:opacity-50"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === "grid"
                ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === "list"
                ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            List View
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
        </div>
      </div>

      {/* Campaigns Grid/List View */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200/50">
          <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No campaigns found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Try a different search term"
              : "Get started by creating your first email campaign"}
          </p>
          <Link
            to={"/dashboard/campaigns/create"}
            className="px-4 py-2 font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center mx-auto w-fit"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const statusInfo = getStatusInfo(campaign.status);
            const progress = calculateProgress(campaign);
            const openRate = calculateOpenRate(campaign);
            const clickRate = calculateClickRate(campaign);

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-2xl border border-gray-200/50 hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.includes(campaign.id)}
                          onChange={() => handleSelectCampaign(campaign.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          disabled={isAnyLoading}
                        />
                        <span
                          className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                          <span className="ml-1.5">{statusInfo.label}</span>
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {campaign.subject || "No subject"}
                      </p>
                    </div>
                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Recipients</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {campaign.totalRecipients?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sent</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {campaign.totalSent?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Replied</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {campaign.totalReplied?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Open Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {openRate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Click Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {clickRate}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      {campaign.status === "scheduled" ? (
                        <>
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatDateTime(campaign.scheduledAt)}
                        </>
                      ) : campaign.status === "draft" ? (
                        `Created ${formatDate(campaign.createdAt)}`
                      ) : campaign.status === "completed" ? (
                        `Completed ${formatDate(campaign.completedAt)}`
                      ) : (
                        `Started ${formatDate(
                          campaign.scheduledAt || campaign.createdAt,
                        )}`
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {/* Activate button - only for draft */}
                      {campaign.status === "draft" && (
                        <button
                          onClick={() => handleActivateCampaign(campaign.id)}
                          disabled={activateCampaign.isPending}
                          className={`p-2 transition rounded-lg ${
                            activateCampaign.isPending
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                          }`}
                          title="Activate Campaign"
                        >
                          {activateCampaign.isPending &&
                          activateCampaign.variables === campaign.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {/* Pause/Resume buttons */}
                      {campaign.status === "running" && (
                        <button
                          onClick={() => handlePauseCampaign(campaign.id)}
                          disabled={pauseCampaign.isPending}
                          className={`p-2 transition rounded-lg ${
                            pauseCampaign.isPending
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                          }`}
                          title="Pause Campaign"
                        >
                          {pauseCampaign.isPending &&
                          pauseCampaign.variables === campaign.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Pause className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {campaign.status === "paused" && (
                        <button
                          onClick={() => handleResumeCampaign(campaign.id)}
                          disabled={resumeCampaign.isPending}
                          className={`p-2 transition rounded-lg ${
                            resumeCampaign.isPending
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                          }`}
                          title="Resume Campaign"
                        >
                          {resumeCampaign.isPending &&
                          resumeCampaign.variables === campaign.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {/* View button */}
                      <button
                        onClick={() => handleViewCampaign(campaign.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Campaign"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit button - only for draft/paused */}
                      {(campaign.status === "draft" ||
                        campaign.status === "paused") && (
                        <button
                          onClick={() => handleEditCampaign(campaign.id)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit Campaign"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteClick(campaign)}
                        disabled={deleteCampaign.isPending}
                        className={`p-2 transition rounded-lg ${
                          deleteCampaign.isPending &&
                          deleteCampaign.variables === campaign.id
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                        }`}
                        title="Delete Campaign"
                      >
                        {deleteCampaign.isPending &&
                        deleteCampaign.variables === campaign.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={
                        selectedCampaigns.length === filteredCampaigns.length &&
                        filteredCampaigns.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      disabled={isAnyLoading}
                    />
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Open Rate
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => {
                  const statusInfo = getStatusInfo(campaign.status);
                  const openRate = calculateOpenRate(campaign);

                  return (
                    <tr
                      key={campaign.id}
                      className="hover:bg-gray-50/50 transition"
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.includes(campaign.id)}
                          onChange={() => handleSelectCampaign(campaign.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          disabled={isAnyLoading}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center mr-3">
                            <Send className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {campaign.name}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {campaign.subject || "No subject"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                          <span className="ml-1.5">{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium">
                            {campaign.totalRecipients?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium">
                          {campaign.totalSent?.toLocaleString() || "0"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <span className="font-medium">{openRate}</span>
                          {openRate !== "-" && parseFloat(openRate) > 30 && (
                            <TrendingUp className="w-4 h-4 text-green-500 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {formatDate(campaign.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1">
                          {/* Activate button - only for draft */}
                          {campaign.status === "draft" && (
                            <button
                              onClick={() =>
                                handleActivateCampaign(campaign.id)
                              }
                              disabled={activateCampaign.isPending}
                              className={`p-2 transition rounded-lg ${
                                activateCampaign.isPending
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                              }`}
                              title="Activate Campaign"
                            >
                              {activateCampaign.isPending &&
                              activateCampaign.variables === campaign.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Pause/Resume buttons */}
                          {campaign.status === "running" && (
                            <button
                              onClick={() => handlePauseCampaign(campaign.id)}
                              disabled={pauseCampaign.isPending}
                              className={`p-2 transition rounded-lg ${
                                pauseCampaign.isPending
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                              }`}
                              title="Pause Campaign"
                            >
                              {pauseCampaign.isPending &&
                              pauseCampaign.variables === campaign.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Pause className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {campaign.status === "paused" && (
                            <button
                              onClick={() => handleResumeCampaign(campaign.id)}
                              disabled={resumeCampaign.isPending}
                              className={`p-2 transition rounded-lg ${
                                resumeCampaign.isPending
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                              }`}
                              title="Resume Campaign"
                            >
                              {resumeCampaign.isPending &&
                              resumeCampaign.variables === campaign.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* View button */}
                          <button
                            onClick={() => handleViewCampaign(campaign.id)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Campaign"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit button - only for draft/paused */}
                          {(campaign.status === "draft" ||
                            campaign.status === "paused") && (
                            <button
                              onClick={() => handleEditCampaign(campaign.id)}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Edit Campaign"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteClick(campaign)}
                            disabled={deleteCampaign.isPending}
                            className={`p-2 transition rounded-lg ${
                              deleteCampaign.isPending &&
                              deleteCampaign.variables === campaign.id
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                            }`}
                            title="Delete Campaign"
                          >
                            {deleteCampaign.isPending &&
                            deleteCampaign.variables === campaign.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
