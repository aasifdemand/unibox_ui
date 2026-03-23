import { useTranslation } from 'react-i18next';
import CampaignsHeader from './components/campaign/campaigns-header';
import CampaignListView from './components/campaign/campaign-list-view';
import EditCampaignModal from './components/campaign/edit-campaign-modal';
import { motion } from 'motion/react';
// Hooks
import { useCampaignsData } from './hooks/use-campaigns-data';
import ShowDelete from '../../../modals/showdelete';
import Pagination from '../mailboxes/components/pagination';

const Campaigns = () => {
  const {
    state: {
      selectedCampaigns,
      searchTerm,
      statusFilter,
      showDeleteModal,
      campaignToDelete,
      isEditModalOpen,
      campaignToEdit,
    },
    data: {
      campaigns,

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
    setters: {
      setSearchTerm,
      setStatusFilter,
      setShowDeleteModal,
      setCurrentPage,
      setIsEditModalOpen,
      setCampaignToEdit,
    },
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
    },
  } = useCampaignsData();
  const { t } = useTranslation();

  return (
    <div className="w-full mx-auto px-4 md:px-8 pb-8 space-y-2 animate-in fade-in duration-700">
      {showDeleteModal && (
        <ShowDelete
          campaign={campaignToDelete}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          handleDelete={handleDeleteConfirm}
          isDeleting={isLoadingAction.delete}
        />
      )}

      {isEditModalOpen && (
        <EditCampaignModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          campaign={campaignToEdit}
        />
      )}

      {/* Header */}
      <CampaignsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={statusOptions}
      />

      {isLoading && campaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[60vh] flex flex-col items-center justify-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-[6px] border-slate-100 border-t-orange-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
            {t('campaigns.loading_campaigns')}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Campaigns Grid/List View */}
          <div className="w-full">
            <div className="min-h-100 relative">
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
                    endMessageCount={Math.min(currentPage * ITEMS_PER_PAGE, totalProcessed)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
