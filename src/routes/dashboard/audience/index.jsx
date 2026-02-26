import ShowUpload from '../../../modals/showupload';
import ShowSender from '../../../modals/showsender';
import ShowBatchDetails from '../../../modals/showbatchdetails';
import AudienceHeader from './components/audience-header';
import AudienceTabs from './components/audience-tabs';
import ShowSenderDetails from '../../../modals/showsenderdetails';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import Dialog from '../../../components/ui/dialog';
import { useTranslation } from 'react-i18next';

// Hooks
import { useAudienceData } from './hooks/use-audience-data';

const Audience = () => {
  const { t } = useTranslation();
  const {
    // State
    activeTab,
    searchTerm,
    filterStatus,
    senderType,
    uploadStep,
    mapping,
    fileHeaders,
    smtpData,
    showUploadModal,
    showSenderModal,
    showBatchModal,
    showSenderDetailsModal,
    selectedBatch,
    selectedSender,

    // Data
    filteredBatches,
    senders,
    paginatedSenders,
    metrics,
    isLoading,
    batchStatus,

    // Setters
    setActiveTab,
    setSearchTerm,
    setFilterStatus,
    setSenderType,
    setSenderPage,
    setSenderViewMode,
    senderPage,
    senderViewMode,
    hasNextSenderPage,
    hasPrevSenderPage,
    totalSenders,
    SENDER_PAGE_SIZE,
    setUploadStep,
    setMapping,
    setSmtpData,
    setShowSenderModal,
    setShowUploadModal,

    // Actions
    resetUploadState,
    handleFileUploadWrapper,
    handleContactsUpload,
    handleGmailOAuth,
    handleOutlookOAuth,
    handleSmtpSubmit,
    handleDeleteSender: deleteSenderAction,
    handleTestSender,
    handleDeleteBatch: deleteBatchAction,
    openBatchDetails,
    closeBatchModal,
    openSenderDetails,
    closeSenderDetailsModal,
  } = useAudienceData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteContext, setDeleteContext] = useState(null);

  const handleDeleteSender = (sender) => {
    setDeleteContext({
      type: 'sender',
      sender,
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteBatch = (batchId) => {
    setDeleteContext({
      type: 'batch',
      batchId,
    });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteContext) return;
    if (deleteContext.type === 'sender' && deleteContext.sender) {
      await deleteSenderAction(deleteContext.sender);
    } else if (deleteContext.type === 'batch' && deleteContext.batchId) {
      await deleteBatchAction(deleteContext.batchId);
    }
    setDeleteDialogOpen(false);
    setDeleteContext(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AudienceHeader
          activeTab={activeTab}
          invalid={metrics.invalid}
          setShowSenderModal={setShowSenderModal}
          setShowUploadModal={setShowUploadModal}
          totalContacts={metrics.totalContacts}
          unverified={metrics.unverified}
          verified={metrics.valid}
          risky={metrics.risky}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <AudienceTabs
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          setSearchTerm={setSearchTerm}
          isLoadingBatches={isLoading.batches}
          filteredBatches={filteredBatches}
          setShowSenderModal={setShowSenderModal}
          setShowUploadModal={setShowUploadModal}
          handleDeleteBatch={handleDeleteBatch}
          isLoadingSenders={isLoading.senders}
          senders={senders}
          paginatedSenders={paginatedSenders}
          senderPage={senderPage}
          senderViewMode={senderViewMode}
          hasNextSenderPage={hasNextSenderPage}
          hasPrevSenderPage={hasPrevSenderPage}
          totalSenders={totalSenders}
          SENDER_PAGE_SIZE={SENDER_PAGE_SIZE}
          setSenderPage={setSenderPage}
          setSenderViewMode={setSenderViewMode}
          handleDeleteSender={handleDeleteSender}
          handleTestSender={handleTestSender}
          openBatchDetails={openBatchDetails}
          openSenderDetails={openSenderDetails}
          isDeletingBatch={isLoading.deletingBatch}
          isDeletingSender={isLoading.deletingSender}
          isTestingSender={isLoading.testingSender}
        />
      </motion.div>

      {/* Upload Modal */}
      {showUploadModal && (
        <ShowUpload
          setShowUploadModal={setShowUploadModal}
          uploadStep={uploadStep}
          resetUploadState={resetUploadState}
          handleFileUpload={handleFileUploadWrapper}
          mapping={mapping}
          setMapping={setMapping}
          fileHeaders={fileHeaders}
          setUploadStep={setUploadStep}
          handleContactsUpload={handleContactsUpload}
          uploading={isLoading.uploading}
        />
      )}

      {/* Add Sender Modal */}
      {showSenderModal && (
        <ShowSender
          setShowSenderModal={setShowSenderModal}
          setSenderType={setSenderType}
          senderType={senderType}
          handleGmailOAuth={handleGmailOAuth}
          handleOutlookOAuth={handleOutlookOAuth}
          handleSmtpSubmit={handleSmtpSubmit}
          smtpData={smtpData}
          setSmtpData={setSmtpData}
          isSubmitting={isLoading.creatingSender}
        />
      )}

      {showBatchModal && selectedBatch && (
        <ShowBatchDetails
          selectedBatch={selectedBatch}
          closeBatchModal={closeBatchModal}
          batchStatus={batchStatus}
          isLoading={isLoading.batchStatus}
        />
      )}

      {showSenderDetailsModal && selectedSender && (
        <ShowSenderDetails
          sender={selectedSender}
          onClose={closeSenderDetailsModal}
          handleTestSender={handleTestSender}
          handleDeleteSender={handleDeleteSender}
          isTestingSender={isLoading.testingSender}
          isDeletingSender={isLoading.deletingSender}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title={
          deleteContext?.type === 'sender'
            ? t('audience.delete_sender_title')
            : deleteContext?.type === 'batch'
              ? t('audience.delete_list_title')
              : t('audience.delete_item_title')
        }
        description={
          deleteContext?.type === 'sender' && deleteContext.sender
            ? t('audience.delete_sender_description', { email: deleteContext.sender.email, type: deleteContext.sender.type })
            : deleteContext?.type === 'batch'
              ? t('audience.delete_list_description')
              : ''
        }
        confirmText={t('common.delete')}
        confirmVariant="danger"
        isLoading={
          deleteContext?.type === 'sender'
            ? isLoading.deletingSender
            : deleteContext?.type === 'batch'
              ? isLoading.deletingBatch
              : false
        }
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteContext(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
};

export default Audience;
