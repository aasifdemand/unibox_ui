import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { XCircle } from "lucide-react";

import ShowDelete from "../../../modals/showdelete";
import ShowReply from "../../../modals/showreply";

// Import hooks and components
import { useCampaignAnalytics } from "./hooks/use-campaign-analytics";
import CampaignHeader from "./components/view-campaign/CampaignHeader";
import CampaignMetrics from "./components/view-campaign/CampaignMetrics";
import OverviewTab from "./components/view-campaign/OverviewTab";
import AnalyticsTab from "./components/view-campaign/AnalyticsTab";
import RecipientsTab from "./components/view-campaign/RecipientsTab";
import RepliesTab from "./components/view-campaign/RepliesTab";
import ContentTab from "./components/view-campaign/ContentTab";

const ViewCampaign = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);

  const {
    campaign,
    isLoading,
    error,
    replies,
    repliesLoading,
    stats,
    previews,
    placeholders,
    sampleRecipient,
    selectedRecipientForPreview,
    setSelectedRecipientForPreview,
    setSelectedRecipientId,
    formatDate,
    getStatusBadge,
    navigate,
    actions,
  } = useCampaignAnalytics(id);

  const viewReply = (reply) => {
    setSelectedReply(reply);
    setShowReplyModal(true);
  };

  if (isLoading && !campaign) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-20 h-20 border-[6px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
          </div>
        </div>
        <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
          Syncing Mission Intelligence...
        </p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-400 mx-auto p-4 sm:p-6 lg:p-20">
        <div className="premium-card bg-rose-50 border-rose-100 p-20 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-75 bg-rose-500/5 rounded-full blur-[100px] -mt-40"></div>

          <div className="relative mb-10">
            <div className="w-24 h-24 bg-rose-600 rounded-4xl flex items-center justify-center rotate-3 shadow-2xl shadow-rose-900/20">
              <XCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          <h3 className="text-3xl font-black text-rose-900 tracking-tighter mb-4">
            Signal Lost
          </h3>
          <p className="text-sm font-medium text-rose-700/60 max-w-sm mb-10 leading-relaxed uppercase tracking-widest text-[10px]">
            The requested mission protocol could not be located in the current
            operational matrix.
          </p>

          <button
            onClick={() => navigate("/dashboard/campaigns")}
            className="btn-primary py-4 px-10 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-rose-500/20 active:scale-95 transition-all"
          >
            Return to Command Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-400 mx-auto p-4 sm:p-6 lg:p-10 space-y-2 animate-in fade-in duration-700">
      {showDeleteModal && (
        <ShowDelete
          handleDelete={async () => {
            const success = await actions.handleDelete();
            if (success) {
              setShowDeleteModal(false);
              navigate("/dashboard/campaigns");
            }
          }}
          setShowDeleteModal={setShowDeleteModal}
          campaign={campaign}
          isDeleting={actions.delete.isPending}
        />
      )}

      {showReplyModal && selectedReply && (
        <ShowReply
          formatDate={formatDate}
          isOpen={showReplyModal}
          setIsOpen={setShowReplyModal}
          loading={false}
          reply={selectedReply} // Pass the selected reply directly
          setSelectedRecipientId={setSelectedRecipientId}
        />
      )}

      <div className="space-y-10">
        <CampaignHeader
          campaign={campaign}
          previews={previews}
          actions={actions}
          setShowDeleteModal={setShowDeleteModal}
          getStatusBadge={getStatusBadge}
        />

        <CampaignMetrics campaign={campaign} stats={stats} />

        <div className="space-y-8">
          <div className="flex items-center gap-1 p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl w-fit border border-slate-200/50 shadow-sm">
            {[
              { id: "overview", label: "Overview" },
              { id: "analytics", label: "Analytics" },
              { id: "recipients", label: "Recipients" },
              { id: "replies", label: `Replies (${stats.totalReplied})` },
              { id: "content", label: "Content" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-xl ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="animate-in fade-in slide-in-from-top-2 duration-500">
            {activeTab === "overview" && (
              <OverviewTab
                campaign={campaign}
                stats={stats}
                previews={previews}
                placeholders={placeholders}
                formatDate={formatDate}
              />
            )}
            {activeTab === "analytics" && (
              <AnalyticsTab campaign={campaign} stats={stats} />
            )}
            {activeTab === "recipients" && (
              <RecipientsTab
                campaign={campaign}
                stats={stats}
                formatDate={formatDate}
                viewReply={viewReply}
                setSelectedRecipientForPreview={setSelectedRecipientForPreview}
              />
            )}
            {activeTab === "replies" && (
              <RepliesTab
                campaign={campaign}
                replies={replies}
                repliesLoading={repliesLoading}
                formatDate={formatDate}
                viewReply={viewReply}
              />
            )}
            {activeTab === "content" && (
              <ContentTab
                campaign={campaign}
                previews={previews}
                placeholders={placeholders}
                sampleRecipient={sampleRecipient}
                selectedRecipientForPreview={selectedRecipientForPreview}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCampaign;
