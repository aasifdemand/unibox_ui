import ShowUpload from '../../../modals/showupload';
import AudienceHeader from './components/audience-header';
import AudienceToolbar from './components/audience-toolbar';
import ContactsTable from './components/contacts-table';
import { motion } from 'motion/react';

// Hooks
import { useAudienceData } from './hooks/use-audience-data';

const Audience = () => {
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
            <ContactsTable
              searchTerm={searchTerm}
              filterStatus={filterStatus}
              setShowUploadModal={setShowUploadModal}
            />
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
