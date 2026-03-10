import { useTranslation } from 'react-i18next';
import CampaignsHeader from './components/campaign/campaigns-header';
import CampaignStats from './components/campaign/campaign-stats';
import CampaignFilters from './components/campaign/campaign-filters';
import CampaignToolbar from './components/campaign/campaign-toolbar';
import CampaignGridView from './components/campaign/campaign-grid-view';
import CampaignListView from './components/campaign/campaign-list-view';
import { motion, AnimatePresence } from 'motion/react';
// Hooks
import { useCampaignsData } from './hooks/use-campaigns-data';
import ShowDelete from '../../../modals/showdelete';
import Pagination from '../mailboxes/components/pagination';

const Campaigns = () => {
  const {
    state: {
      selectedCampaigns,
      viewMode,
      searchTerm,
      statusFilter,
      showDeleteModal,
      campaignToDelete,
    },
    data: {
      campaigns,
      filteredCampaigns,
      totalCampaigns,
      activeCampaigns,
      scheduledCampaigns,
      draftCampaigns,
      completedCampaigns,
      statusOptions,
      paginatedCampaigns,
      currentPage,
      totalProcessed,
      ITEMS_PER_PAGE,
    },
    isLoading: {
      isAnyLoading,
      main: isLoading,
      action: isLoadingAction,
      bulkAction: isBulkActionLoading,
    },
    setters: { setViewMode, setSearchTerm, setStatusFilter, setShowDeleteModal, setCurrentPage },
    handlers: {
      handleSelectAll,
      handleSelectCampaign,
      handleActivateCampaign,
      handlePauseCampaign,
      handleResumeCampaign,
      handleDeleteClick,
      handleDeleteConfirm,
      handleEditCampaign,
      handleViewCampaign,
      handleBulkDelete,
      handleBulkPause,
      handleBulkActivate,
    },
  } = useCampaignsData();
  const { t } = useTranslation();

  if (isLoading && campaigns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center"
      >
        <div className="relative">
          <div className="w-20 h-20 border-[6px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
          </div>
        </div>
        <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
          {t('campaigns.loading_campaigns')}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 md:px-8 pb-8 space-y-2 animate-in fade-in duration-700">
      {showDeleteModal && (
        <ShowDelete
          campaign={campaignToDelete}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          handleDelete={handleDeleteConfirm}
          isDeleting={isLoadingAction.delete}
        />
      )}

      {/* Header */}
      <CampaignsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={statusOptions}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className="space-y-8">
        {/* Stats Cards */}
        <CampaignStats
          totalCampaigns={totalCampaigns}
          activeCampaigns={activeCampaigns}
          scheduledCampaigns={scheduledCampaigns}
          draftCampaigns={draftCampaigns}
          completedCampaigns={completedCampaigns}
        />

        {/* Filters & Actions */}
        <CampaignFilters
          selectedCampaigns={selectedCampaigns}
          handleBulkPause={handleBulkPause}
          handleBulkActivate={handleBulkActivate}
          handleBulkDelete={handleBulkDelete}
          isBulkActionLoading={isBulkActionLoading}
        />

        {/* Campaigns Grid/List View */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/60">
          <CampaignToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusOptions={statusOptions}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
          <div className="min-h-100 relative mt-6">

            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <CampaignGridView
                    campaigns={paginatedCampaigns}
                    selectedCampaigns={selectedCampaigns}
                    handleSelectCampaign={handleSelectCampaign}
                    isAnyLoading={isAnyLoading}
                    handleActivateCampaign={handleActivateCampaign}
                    handlePauseCampaign={handlePauseCampaign}
                    handleResumeCampaign={handleResumeCampaign}
                    handleEditCampaign={handleEditCampaign}
                    handleViewCampaign={handleViewCampaign}
                    handleDeleteClick={handleDeleteClick}
                    isLoadingAction={isLoadingAction}
                    searchTerm={searchTerm}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <CampaignListView
                    campaigns={paginatedCampaigns}
                    selectedCampaigns={selectedCampaigns}
                    handleSelectAll={handleSelectAll}
                    handleSelectCampaign={handleSelectCampaign}
                    isAnyLoading={isAnyLoading}
                    handleActivateCampaign={handleActivateCampaign}
                    handlePauseCampaign={handlePauseCampaign}
                    handleResumeCampaign={handleResumeCampaign}
                    handleEditCampaign={handleEditCampaign}
                    handleViewCampaign={handleViewCampaign}
                    handleDeleteClick={handleDeleteClick}
                    isLoadingAction={isLoadingAction}
                    searchTerm={searchTerm}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* New Numeric Pagination */}
            {totalProcessed > ITEMS_PER_PAGE && (
              <div className="mt-8 mb-8">
                <Pagination
                  currentPage={currentPage}
                  totalMessages={totalProcessed}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                  onNextPage={() => setCurrentPage((p) => p + 1)}
                  onPrevPage={() => setCurrentPage((p) => p - 1)}
                  hasNextPage={currentPage * ITEMS_PER_PAGE < totalProcessed}
                  hasPreviousPage={currentPage > 1}
                  startMessageCount={(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  endMessageCount={Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    totalProcessed,
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
