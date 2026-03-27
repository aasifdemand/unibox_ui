import { useTranslation } from 'react-i18next';
import CampaignsHeader from './components/campaign/campaigns-header';
import CampaignListView from './components/campaign/campaign-list-view';
import EditCampaignModal from './components/campaign/edit-campaign-modal';
// Hooks
import { useCampaignsData } from './hooks/use-campaigns-data';
import ShowDelete from '../../../modals/showdelete';
import Pagination from '../mailboxes/components/pagination';
import { SkeletonLoader } from '../../../components/ui/loading-spinner';

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
        <div className="space-y-6">
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl w-full" />
          <SkeletonLoader type="list" count={5} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Campaigns Grid/List View */}
          <div className="w-full">
            <div className="min-h-[450px] relative">
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
