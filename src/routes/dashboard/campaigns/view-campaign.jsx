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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-100 rounded-lg p-12 text-center">
          <h3 className="text-xl font-semibold text-red-800 mb-2">Campaign Not Found</h3>
          <p className="text-sm text-red-600 mb-6">
            We couldn&apos;t find the campaign you&apos;re looking for.
          </p>

          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Campaigns
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
          <div className="flex items-center gap-1 p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl w-fit border border-slate-200/50 shadow-sm">
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
                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-xl ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white'
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
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewCampaign;
