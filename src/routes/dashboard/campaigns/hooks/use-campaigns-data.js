import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useCampaigns,
  useActivateCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useDeleteCampaign,
} from '../../../../hooks/useCampaign';

export const useCampaignsData = () => {
  const navigate = useNavigate();
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  // React Query hooks
  const { data: campaigns = [], isLoading, refetch: refetchCampaigns } = useCampaigns();

  const activateCampaign = useActivateCampaign();
  const pauseCampaign = usePauseCampaign();
  const resumeCampaign = useResumeCampaign();
  const deleteCampaign = useDeleteCampaign();

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      searchTerm === '' ||
      campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c) => c.status === 'running' || c.status === 'sending',
  ).length;
  const scheduledCampaigns = campaigns.filter((c) => c.status === 'scheduled').length;
  const draftCampaigns = campaigns.filter((c) => c.status === 'draft').length;
  const completedCampaigns = campaigns.filter((c) => c.status === 'completed').length;

  // Status options
  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Running', value: 'running' },
    { label: 'Paused', value: 'paused' },
    { label: 'Completed', value: 'completed' },
  ];

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCampaigns(filteredCampaigns.map((c) => c.id));
    } else {
      setSelectedCampaigns([]);
    }
  };

  const handleSelectCampaign = (id) => {
    if (selectedCampaigns.includes(id)) {
      setSelectedCampaigns(selectedCampaigns.filter((c) => c !== id));
    } else {
      setSelectedCampaigns([...selectedCampaigns, id]);
    }
  };

  // Campaign action handlers
  const handleActivateCampaign = async (campaignId) => {
    try {
      await activateCampaign.mutateAsync(campaignId);
      toast.success('Campaign activated successfully!');
      refetchCampaigns();
    } catch (error) {
      toast.error(error.message || 'Failed to activate campaign');
    }
  };

  const handlePauseCampaign = async (campaignId) => {
    try {
      await pauseCampaign.mutateAsync(campaignId);
      toast.success('Campaign paused successfully');
      refetchCampaigns();
    } catch (error) {
      toast.error(error.message || 'Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async (campaignId) => {
    try {
      await resumeCampaign.mutateAsync(campaignId);
      toast.success('Campaign resumed successfully');
      refetchCampaigns();
    } catch (error) {
      toast.error(error.message || 'Failed to resume campaign');
    }
  };

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;

    try {
      await deleteCampaign.mutateAsync(campaignToDelete.id);
      toast.success('Campaign deleted successfully');
      setShowDeleteModal(false);
      setCampaignToDelete(null);
      refetchCampaigns();
    } catch (error) {
      toast.error(error.message || 'Failed to delete campaign');
    }
  };

  const handleEditCampaign = (campaignId) => {
    navigate(`/dashboard/campaigns/${campaignId}/edit`);
  };

  const handleViewCampaign = (campaignId) => {
    navigate(`/dashboard/campaigns/${campaignId}`);
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedCampaigns.length === 0) return;

    try {
      toast.loading(`Deleting ${selectedCampaigns.length} campaigns...`);
      let successCount = 0;
      let failCount = 0;

      for (const id of selectedCampaigns) {
        try {
          await deleteCampaign.mutateAsync(id);
          successCount++;
        } catch {
          failCount++;
        }
      }

      toast.dismiss();
      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} campaigns`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} campaigns`);
      }
      setSelectedCampaigns([]);
      refetchCampaigns();
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete selected campaigns');
    }
  };

  const handleBulkPause = async () => {
    if (selectedCampaigns.length === 0) return;

    try {
      toast.loading(`Pausing ${selectedCampaigns.length} campaigns...`);
      let successCount = 0;
      let failCount = 0;

      for (const id of selectedCampaigns) {
        const campaign = campaigns.find((c) => c.id === id);
        if (campaign?.status === 'running' || campaign?.status === 'sending') {
          try {
            await pauseCampaign.mutateAsync(id);
            successCount++;
          } catch {
            failCount++;
          }
        }
      }

      toast.dismiss();
      if (successCount > 0) {
        toast.success(`Paused ${successCount} campaigns`);
      }
      if (failCount > 0) {
        toast.error(`Failed to pause ${failCount} campaigns`);
      }
      setSelectedCampaigns([]);
      refetchCampaigns();
    } catch (error) {
      console.log(error);
      toast.error('Failed to pause selected campaigns');
    }
  };

  const handleBulkActivate = async () => {
    if (selectedCampaigns.length === 0) return;

    try {
      toast.loading(`Activating ${selectedCampaigns.length} campaigns...`);
      let successCount = 0;
      let failCount = 0;

      for (const id of selectedCampaigns) {
        const campaign = campaigns.find((c) => c.id === id);
        if (campaign?.status === 'draft') {
          try {
            await activateCampaign.mutateAsync(id);
            successCount++;
          } catch {
            failCount++;
          }
        }
      }

      toast.dismiss();
      if (successCount > 0) {
        toast.success(`Activated ${successCount} campaigns`);
      }
      if (failCount > 0) {
        toast.error(`Failed to activate ${failCount} campaigns`);
      }
      setSelectedCampaigns([]);
      refetchCampaigns();
    } catch (error) {
      console.log(error);
      toast.error('Failed to activate selected campaigns');
    }
  };

  // Loading state
  const isAnyLoading =
    isLoading ||
    activateCampaign.isPending ||
    pauseCampaign.isPending ||
    resumeCampaign.isPending ||
    deleteCampaign.isPending;

  return {
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
      action: {
        activate: activateCampaign.isPending,
        pause: pauseCampaign.isPending,
        resume: resumeCampaign.isPending,
        delete: deleteCampaign.isPending,
        variables:
          activateCampaign.variables ||
          pauseCampaign.variables ||
          resumeCampaign.variables ||
          deleteCampaign.variables,
      },
      bulkAction: {
        pause: pauseCampaign.isPending, // Can refine if needed
        activate: activateCampaign.isPending,
        delete: deleteCampaign.isPending,
      },
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
  };
};
