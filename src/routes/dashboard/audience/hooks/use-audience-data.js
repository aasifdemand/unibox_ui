import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { calculateVerificationTotals, filterBatches, resetUploadState } from '../audience-service';
import {
  useBatches,
  useUploadBatch,
  useDeleteBatch,
  useBatchStatus,
} from '../../../../hooks/useBatches';

export const useAudienceData = () => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Contacts state
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    email: '',
    name: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    city: '',
    country: '',
  });

  const [batchPage, setBatchPage] = useState(1);
  const [recordsPage, setRecordsPage] = useState(1);
  const BATCHES_PER_PAGE = 12;

  // React Query hooks
  const { data: batchesData, pagination: batchesPagination, isLoading: isLoadingBatches, refetch: refetchBatches } = useBatches(batchPage, BATCHES_PER_PAGE);

  const uploadBatch = useUploadBatch();
  const deleteBatch = useDeleteBatch();

  // Get batch status when a batch is selected
  const {
    data: batchStatusData,
    isLoading: isLoadingBatchStatus,
    refetch: refetchBatchStatus,
  } = useBatchStatus(selectedBatch?.id, recordsPage);

  // Calculate verification totals using service function
  const { valid, invalid, risky, unverified } = calculateVerificationTotals(batchesData);

  const totalContacts = valid + invalid + risky + unverified;

  // Filter batches using service function
  const filteredBatches = batchesData; // Let the backend handle primary filtering or do it locally on the page

  // Open batch details
  const openBatchDetails = (batch) => {
    setSelectedBatch(batch);
    setShowBatchModal(true);
  };

  // Close batch modal
  const closeBatchModal = () => {
    setShowBatchModal(false);
    setSelectedBatch(null);
  };

  // Handle contacts upload
  const handleContactsUpload = async () => {
    if (!uploadedFile || !mapping.email) {
      toast.error('Please map the email column before uploading');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      await uploadBatch.mutateAsync(formData);

      setShowUploadModal(false);
      resetUploadState(setUploadStep, setUploadedFile, setFileHeaders, setMapping);
      refetchBatches();
      toast.success('Upload successful!');
    } catch (error) {
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle file upload wrapper
  const handleFileUploadWrapper = (file, headers) => {
    setUploadedFile(file);
    setFileHeaders(headers);
    setUploadStep(2);

    // Auto-map common headers
    const autoMapping = {};
    headers.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes('email')) autoMapping.email = header;
      if (
        lowerHeader.includes('name') &&
        !lowerHeader.includes('first') &&
        !lowerHeader.includes('last')
      )
        autoMapping.name = header;
      if (lowerHeader.includes('first')) autoMapping.firstName = header;
      if (lowerHeader.includes('last')) autoMapping.lastName = header;
      if (lowerHeader.includes('company')) autoMapping.company = header;
      if (lowerHeader.includes('phone')) autoMapping.phone = header;
      if (lowerHeader.includes('city')) autoMapping.city = header;
      if (lowerHeader.includes('country')) autoMapping.country = header;
    });
    setMapping((prev) => ({ ...prev, ...autoMapping }));
  };


  const handleDeleteBatch = async (batchId) => {
    try {
      await deleteBatch.mutateAsync(batchId);
      refetchBatches();
      toast.success('Batch deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete batch: ${error.message}`);
    }
  };


  return {
    // State
    activeTab,
    searchTerm,
    filterStatus,
    uploadStep,
    uploadedFile,
    fileHeaders,
    mapping,
    showUploadModal,
    showBatchModal,
    selectedBatch,
    batchPage,
    recordsPage,

    // Data
    batches: batchesData,
    filteredBatches,
    batchesPagination,
    batchStatus: batchStatusData,
    metrics: { valid, invalid, risky, unverified, totalContacts },

    // Loading
    isLoading: {
      batches: isLoadingBatches,
      batchStatus: isLoadingBatchStatus,
      uploading: uploadBatch.isPending,
      deletingBatch: deleteBatch.isPending,
    },

    // Setters
    setActiveTab,
    setSearchTerm,
    setFilterStatus,
    setUploadStep,
    setMapping,
    setShowUploadModal,
    setShowBatchModal,
    setSelectedBatch,
    setUploadedFile,
    setFileHeaders,
    setBatchPage,
    setRecordsPage,

    // Actions
    resetUploadState: () =>
      resetUploadState(setUploadStep, setUploadedFile, setFileHeaders, setMapping),
    handleFileUploadWrapper,
    handleContactsUpload,
    handleDeleteBatch,
    openBatchDetails,
    closeBatchModal,
    refetchBatchStatus,
  };
};
