import React from "react";
import { motion, AnimatePresence } from "motion/react";
import ShowDelete from "../../../modals/showdelete";

// Components
import CampaignsHeader from "./components/campaign/campaigns-header";
import CampaignStats from "./components/campaign/campaign-stats";
import CampaignFilters from "./components/campaign/campaign-filters";
import CampaignGridView from "./components/campaign/campaign-grid-view";
import CampaignListView from "./components/campaign/campaign-list-view";

// Hooks
import { useCampaignsData } from "./hooks/use-campaigns-data";

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
    },
    isLoading: {
      isAnyLoading,
      main: isLoading,
      action: isLoadingAction,
      bulkAction: isBulkActionLoading,
    },
    setters: {
      setViewMode,
      setSearchTerm,
      setStatusFilter,
      setShowDeleteModal,
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
      handleBulkDelete,
      handleBulkPause,
      handleBulkActivate,
    },
  } = useCampaignsData();

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
          Loading campaigns...
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-400 mx-auto p-4 sm:p-6 lg:p-10 space-y-2 animate-in fade-in duration-700">
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
      <CampaignsHeader />

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
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={statusOptions}
          selectedCampaigns={selectedCampaigns}
          handleBulkPause={handleBulkPause}
          handleBulkActivate={handleBulkActivate}
          handleBulkDelete={handleBulkDelete}
          isBulkActionLoading={isBulkActionLoading}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredCount={filteredCampaigns.length}
          totalCount={campaigns.length}
        />

        {/* Campaigns Grid/List View */}
        <div className="min-h-100 relative">
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <CampaignGridView
                  campaigns={filteredCampaigns}
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
                  campaigns={filteredCampaigns}
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
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
