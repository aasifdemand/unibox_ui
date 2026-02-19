import { useNavigate } from "react-router-dom";
import {
  useCampaign,
  useDeleteCampaign,
  useActivateCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useCampaignReplies,
  useRecipientReply,
} from "../../../../hooks/useCampaign";
import { Edit, Clock, Send, CheckCircle, Pause } from "lucide-react";
import { unescapeHtml } from "../../../../utils/html-utils";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

// Helper function to extract all placeholders from text
export const extractPlaceholders = (text) => {
  if (!text) return [];
  const matches = text.match(/{{\s*[\w_]+\s*}}/g) || [];
  return [...new Set(matches)];
};

// Helper function to replace placeholders with actual recipient data
export const replaceWithRecipientData = (text, recipient) => {
  if (!text || !recipient) return text;

  const data = {
    name: recipient.name || "",
    email: recipient.email || "",
    first_name: recipient.name?.split(" ")[0] || "",
    last_name: recipient.name?.split(" ").slice(1).join(" ") || "",
    ...(recipient.metadata || {}),
  };

  return text.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    const value = data[key];
    return value !== undefined && value !== null ? value : match;
  });
};

// Helper function to get sample recipient for preview
const getSampleRecipient = (campaign) => {
  const recipients = campaign?.CampaignRecipients || [];
  if (recipients.length > 0) return recipients[0];

  return {
    name: "John Doe",
    email: "john@example.com",
    metadata: {
      first_name: "John",
      last_name: "Doe",
      company: "Acme Inc",
      city: "New York",
      country: "USA",
      phone: "+1 234 567 8900",
    },
  };
};

// Calculate average response time
export const calculateAvgResponseTime = (recipients) => {
  const replied = recipients?.filter(
    (r) => r.status === "replied" && r.lastSentAt && r.repliedAt,
  );

  if (!replied?.length) return "N/A";

  const totalTime = replied.reduce((acc, r) => {
    const sentTime = new Date(r.lastSentAt).getTime();
    const replyTime = new Date(r.repliedAt).getTime();
    return acc + (replyTime - sentTime);
  }, 0);

  const avgHours = Math.round(totalTime / replied.length / (1000 * 60 * 60));
  return `${avgHours} hours`;
};

export const useCampaignAnalytics = (id) => {
  const navigate = useNavigate();
  const [selectedRecipientForPreview, setSelectedRecipientForPreview] =
    useState(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);

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

  // Queries
  const {
    data: campaign,
    isLoading,
    error,
    refetch: refetchCampaign,
  } = useCampaign(id);
  const { data: replies = [], isLoading: repliesLoading } =
    useCampaignReplies(id);
  const { data: recipientReply, isLoading: replyLoading } = useRecipientReply(
    id,
    selectedRecipientId,
  );

  // Mutations
  const deleteCampaign = useDeleteCampaign();
  const activateCampaign = useActivateCampaign();
  const pauseCampaign = usePauseCampaign();
  const resumeCampaign = useResumeCampaign();

  // Metrics calculation
  const stats = useMemo(() => {
    if (!campaign) return null;
    const recipients = campaign.CampaignRecipients || [];
    const totalSent = recipients.filter(
      (r) => r.status === "sent" || r.status === "replied",
    ).length;
    const totalReplied = recipients.filter(
      (r) => r.status === "replied",
    ).length;
    const totalOpened = recipients.filter((r) => r.openedAt).length;
    const totalClicked = recipients.filter((r) => r.clickedAt).length;
    const progress = recipients.length
      ? Math.min(100, Math.round((totalSent / recipients.length) * 100))
      : 0;

    return {
      totalRecipients: recipients.length,
      totalSent,
      totalReplied,
      totalOpened,
      totalClicked,
      progress,
    };
  }, [campaign]);

  // Preview Logic
  const sampleRecipient = useMemo(
    () => selectedRecipientForPreview || getSampleRecipient(campaign),
    [campaign, selectedRecipientForPreview],
  );

  const previews = useMemo(() => {
    if (!campaign) return {};
    return {
      subject: replaceWithRecipientData(campaign.subject, sampleRecipient),
      html: replaceWithRecipientData(
        unescapeHtml(campaign.htmlBody),
        sampleRecipient,
      ),
      text: replaceWithRecipientData(campaign.textBody, sampleRecipient),
      previewText: replaceWithRecipientData(
        campaign.previewText,
        sampleRecipient,
      ),
      campaignName: replaceWithRecipientData(campaign.name, sampleRecipient),
    };
  }, [campaign, sampleRecipient]);

  const placeholders = useMemo(() => {
    if (!campaign) return [];
    const all = [
      ...extractPlaceholders(campaign.subject),
      ...extractPlaceholders(campaign.htmlBody),
      ...extractPlaceholders(campaign.textBody),
      ...extractPlaceholders(campaign.previewText),
    ];
    return [...new Set(all)];
  }, [campaign]);

  // Actions
  const handleAction = async (actionFn, successMsg, errorMsg) => {
    try {
      await actionFn.mutateAsync(id);
      toast.success(successMsg);
      refetchCampaign();
      return true;
    } catch (err) {
      toast.error(err.message || errorMsg);
      return false;
    }
  };

  return {
    campaign,
    isLoading,
    error,
    replies,
    repliesLoading,
    recipientReply,
    replyLoading,
    stats,
    previews,
    placeholders,
    sampleRecipient,
    selectedRecipientForPreview,
    setSelectedRecipientForPreview,
    selectedRecipientId,
    setSelectedRecipientId,
    formatDate,
    getStatusBadge,
    navigate,
    actions: {
      delete: deleteCampaign,
      activate: activateCampaign,
      pause: pauseCampaign,
      handleDelete: () =>
        handleAction(
          deleteCampaign,
          "Campaign deleted successfully",
          "Failed to delete campaign",
        ),
      handleActivate: () =>
        handleAction(
          activateCampaign,
          "Campaign activated",
          "Failed to activate campaign",
        ),
      handlePause: () =>
        handleAction(
          pauseCampaign,
          "Campaign paused",
          "Failed to pause campaign",
        ),
      handleResume: () =>
        handleAction(
          resumeCampaign,
          "Campaign resumed",
          "Failed to resume campaign",
        ),
    },
  };
};
