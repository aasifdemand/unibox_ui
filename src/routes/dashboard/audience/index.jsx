import ShowUpload from '../../../modals/showupload';
import AudienceHeader from './components/audience-header';
import AudienceToolbar from './components/audience-toolbar';
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
    metrics,
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
      // Error is handled in useAudienceData toast
    }
  };



  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 px-4 md:px-8 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AudienceHeader
          invalid={metrics.invalid}
          setShowUploadModal={setShowUploadModal}
          totalContacts={metrics.totalContacts}
          unverified={metrics.unverified}
          verified={metrics.valid}
          risky={metrics.risky}
        />
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl w-fit border border-slate-200/60">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-6 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all ${activeTab === 'contacts'
            ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
            : 'text-slate-400 hover:text-slate-600'
            }`}
        >
          {t('audience.all_status')}
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-6 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all ${activeTab === 'batches'
            ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
            : 'text-slate-400 hover:text-slate-600'
            }`}
        >
          {t('audience.import_batches')}
        </button>
      </div>

      {/* Contacts List with Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/60">
          <AudienceToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
          <div className="mt-4">
            {activeTab === 'contacts' ? (
              <ContactsTable
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                setShowUploadModal={setShowUploadModal}
              />
            ) : (
              <div className="pt-4">
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
              </div>
            )}
          </div>
        </div>
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
        description={t('audience.delete_batch_confirm', {
          label: batchToDelete?.label,
        }) || `Are you sure you want to delete "${batchToDelete?.label}"? All contacts in this batch will be removed.`}
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
