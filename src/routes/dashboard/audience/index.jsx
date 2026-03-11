import ShowUpload from '../../../modals/showupload';
import AudienceHeader from './components/audience-header';
import AudienceToolbar from './components/audience-toolbar';
import ContactsTable from './components/contacts-table';
import AudienceTabs from './components/audience-tabs';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

// Hooks
import { useAudienceData } from './hooks/use-audience-data';

const Audience = () => {
  const { t } = useTranslation();
  const {
    // State
    searchTerm,
    filterStatus,
    uploadStep,
    mapping,
    fileHeaders,
    showUploadModal,

    // Data
    metrics,
    isLoading,

    // Setters
    setSearchTerm,
    setFilterStatus,
    setUploadStep,
    setMapping,
    setShowUploadModal,

    // Actions
    resetUploadState,
    handleFileUploadWrapper,
    handleContactsUpload,
  } = useAudienceData();



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
          {t('audience.import_batches') || 'Import Batches'}
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
                  handleDeleteBatch={handleDeleteBatch}
                  openBatchDetails={openBatchDetails}
                />
              </div>
            )}
          </div>
        </div>
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


    </motion.div>
  );
};

export default Audience;
