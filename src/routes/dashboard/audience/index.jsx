import ShowUpload from '../../../modals/showupload';
import AudienceHeader from './components/audience-header';
import ContactsTable from './components/contacts-table';
import AudienceTabs from './components/audience-tabs';
import BatchDetailsModal from './components/batch-details-modal';
import Dialog from '../../../components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

// Hooks
import { useAudienceData } from './hooks/use-audience-data';
import { useState } from 'react';

const Audience = () => {
  const { t } = useTranslation();
  const {
    // State
    activeTab,
    searchTerm,
    filterStatus,
    uploadStep,
    mapping,
    fileHeaders,
    showUploadModal,

    // Data
    isLoading,
    filteredBatches,

    // Setters
    setActiveTab,
    setSearchTerm,
    setFilterStatus,
    setUploadStep,
    setMapping,
    setShowUploadModal,

    // Actions
    resetUploadState,
    handleFileUploadWrapper,
    handleContactsUpload,
    handleDeleteBatch,
    openBatchDetails,
    closeBatchModal,

    // Pagination
    batchPage,
    setBatchPage,
    batchesPagination,
    recordsPage,
    setRecordsPage,
    showBatchModal,
    batchStatus,
  } = useAudienceData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [visibleCols, setVisibleCols] = useState(
    new Set(['job_title', 'company', 'city', 'phone'])
  );

  const toggleCol = (ids) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    setVisibleCols((prev) => {
      const n = new Set(prev);
      idArray.forEach((id) => {
        if (n.has(id)) n.delete(id);
        else n.add(id);
      });
      return n;
    });
  };

  const setAllCols = (allIds) => {
    setVisibleCols(new Set(allIds));
  };

  const setNoCols = () => {
    setVisibleCols(new Set());
  };

  const triggerDeleteBatch = (batchId) => {
    const batch = filteredBatches.find((b) => b.id === batchId);
    setBatchToDelete({
      id: batchId,
      label: batch?.originalFilename || 'this batch',
    });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!batchToDelete) return;
    try {
      await handleDeleteBatch(batchToDelete.id);
      setDeleteDialogOpen(false);
      setBatchToDelete(null);
    } catch (err) {
      console.error('Delete batch error:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AudienceHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowUploadModal={setShowUploadModal}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          visibleCols={visibleCols}
          toggleCol={toggleCol}
          setAllCols={setAllCols}
          setNoCols={setNoCols}
        />
      </motion.div>

      {/* Contacts & Batches Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {activeTab === 'contacts' ? (
          <ContactsTable
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            setShowUploadModal={setShowUploadModal}
            visibleCols={visibleCols}
            toggleCol={toggleCol}
          />
        ) : (
          <AudienceTabs
            isLoadingBatches={isLoading.batches}
            filteredBatches={filteredBatches}
            setShowUploadModal={setShowUploadModal}
            handleDeleteBatch={triggerDeleteBatch}
            openBatchDetails={openBatchDetails}
            pagination={batchesPagination}
            currentPage={batchPage}
            onPageChange={setBatchPage}
          />
        )}
      </motion.div>

      {/* Batch Details Modal */}
      <BatchDetailsModal
        show={showBatchModal}
        onClose={closeBatchModal}
        batchStatus={batchStatus}
        isLoading={isLoading.batchStatus}
        recordsPage={recordsPage}
        setRecordsPage={setRecordsPage}
      />

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

      <Dialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title={t('audience.delete_batch_title', 'Delete Batch')}
        description={
          t('audience.delete_batch_confirm', {
            label: batchToDelete?.label,
          }) ||
          `Are you sure you want to delete "${batchToDelete?.label}"? All contacts in this batch will be removed.`
        }
        confirmText={t('common.delete', 'Delete')}
        confirmVariant="danger"
        isLoading={isLoading.deletingBatch}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setBatchToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
};

export default Audience;
