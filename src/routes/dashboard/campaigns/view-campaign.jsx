import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

import ShowDelete from '../../../modals/showdelete';
import ShowReply from '../../../modals/showreply';

// Import hooks and components
import { useCampaignAnalytics } from './hooks/use-campaign-analytics';
import CampaignHeader from './components/view-campaign/CampaignHeader';
import CampaignMetrics from './components/view-campaign/CampaignMetrics';
import OverviewTab from './components/view-campaign/OverviewTab';
import AnalyticsTab from './components/view-campaign/AnalyticsTab';
import RecipientsTab from './components/view-campaign/RecipientsTab';
import RepliesTab from './components/view-campaign/RepliesTab';
import ContentTab from './components/view-campaign/ContentTab';
import EmptyCampaign from './components/view-campaign/EmptyCampaign';
import CampaignLoader from './components/view-campaign/CampaignLoader';

const ViewCampaign = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
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
    steps,
    activeStepIndex,
    setActiveStepIndex,
    selectedRecipientForPreview,
    setSelectedRecipientForPreview,
    setSelectedRecipientId,
    formatDate,
    getStatusBadge,
    navigate,
    actions,
  } = useCampaignAnalytics(id);

  const viewReply = (replyOrId) => {
    if (typeof replyOrId === 'string') {
      // Find reply by matching recipient ID or email from the replies array
      const reply = (replies || []).find(
        (r) =>
          r.recipientId === replyOrId ||
          r.recipient?.id === replyOrId ||
          r.replyFrom === campaign.CampaignRecipients?.find((rcp) => rcp.id === replyOrId)?.email,
      );
      setSelectedReply(reply);
    } else {
      setSelectedReply(replyOrId);
    }
    setShowReplyModal(true);
  };

  if (isLoading && !campaign) {
    return (
      <CampaignLoader/>
    );
  }

  if (error || !campaign) {
    return (
      <EmptyCampaign/>
    );
  }
  return (
    <div className="w-full h-screen overflow-y-auto main-scroller animate-in fade-in duration-700 bg-[#FAFAFA]">
      <div className="max-w-full mx-auto p-6 space-y-8 flex flex-col">
      {showDeleteModal && (
        <ShowDelete
          handleDelete={async () => {
            const success = await actions.handleDelete();
            if (success) {
              setShowDeleteModal(false);
              navigate('/dashboard/campaigns');
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-10"
      >
        <CampaignHeader
          campaign={campaign}
          previews={previews}
          actions={actions}
          setShowDeleteModal={setShowDeleteModal}
          getStatusBadge={getStatusBadge}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <CampaignMetrics campaign={campaign} stats={stats} />
        </motion.div>

        <div className="space-y-8">
          <div className="flex items-center gap-1 p-1 bg-slate-100/50  rounded-lg w-fit border border-slate-200/50 shadow-sm">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'recipients', label: 'Recipients' },
              { id: 'replies', label: `Replies (${stats.totalReplied})` },
              { id: 'content', label: 'Content' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 text-xs font-bold transition-all duration-300 rounded-md ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <OverviewTab
                  campaign={campaign}
                  stats={stats}
                  previews={previews}
                  placeholders={placeholders}
                  formatDate={formatDate}
                  steps={steps}
                />
              )}
              {activeTab === 'analytics' && <AnalyticsTab campaign={campaign} stats={stats} />}
              {activeTab === 'recipients' && (
                <RecipientsTab
                  campaign={campaign}
                  stats={stats}
                  formatDate={formatDate}
                  viewReply={viewReply}
                  setSelectedRecipientForPreview={setSelectedRecipientForPreview}
                />
              )}
              {activeTab === 'replies' && (
                <RepliesTab
                  campaign={campaign}
                  replies={replies}
                  repliesLoading={repliesLoading}
                  formatDate={formatDate}
                  viewReply={viewReply}
                />
              )}
              {activeTab === 'content' && (
                <ContentTab
                  campaign={campaign}
                  previews={previews}
                  placeholders={placeholders}
                  sampleRecipient={sampleRecipient}
                  selectedRecipientForPreview={selectedRecipientForPreview}
                  steps={steps}
                  activeStepIndex={activeStepIndex}
                  setActiveStepIndex={setActiveStepIndex}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default ViewCampaign;
