import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { calculateVerificationTotals, filterBatches, resetUploadState } from '../audience-service';
import {
  useBatches,
  useUploadBatch,
  useDeleteBatch,
  useBatchStatus,
} from '../../../../hooks/useBatches';
import {
  useSenders,
  useDeleteSender,
  useTestSender,
  useCreateSmtpSender,
  initiateGmailOAuth,
  initiateOutlookOAuth,
} from '../../../../hooks/useSenders';

export const useAudienceData = () => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSenderModal, setShowSenderModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSenderDetailsModal, setShowSenderDetailsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSender, setSelectedSender] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [senderType, setSenderType] = useState('gmail');

  // Senders pagination and view state
  const [senderPage, setSenderPage] = useState(1);
  const [senderViewMode, setSenderViewMode] = useState('grid');
  const SENDER_PAGE_SIZE = 10;

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

  // Senders state - Enhanced with IMAP support
  const [smtpData, setSmtpData] = useState({
    displayName: '',
    email: '',
    host: '',
    port: '587',
    username: '',
    password: '',
    secure: true,
    // IMAP fields
    imapHost: '',
    imapPort: '993',
    imapSecure: true,
    imapUser: '',
    imapPassword: '',
    // Provider info
    provider: 'custom',
  });

  // React Query hooks
  const { data: batches = [], isLoading: isLoadingBatches, refetch: refetchBatches } = useBatches();

  const {
    data: senderResponse = { data: [], pagination: {} },
    isLoading: isLoadingSenders,
    refetch: refetchSenders,
  } = useSenders({ page: senderPage, limit: SENDER_PAGE_SIZE });

  const senders = senderResponse.data || [];
  const senderMeta = senderResponse.pagination || {};

  const uploadBatch = useUploadBatch();
  const deleteBatch = useDeleteBatch();
  const deleteSender = useDeleteSender();
  const testSender = useTestSender();
  const createSmtpSender = useCreateSmtpSender();

  // Get batch status when a batch is selected
  const {
    data: batchStatus,
    isLoading: isLoadingBatchStatus,
    refetch: refetchBatchStatus,
  } = useBatchStatus(selectedBatch?.id);

  // Calculate verification totals using service function
  const { valid, invalid, risky, unverified } = calculateVerificationTotals(batches);

  const totalContacts = valid + invalid + risky + unverified;

  // Filter batches using service function
  const filteredBatches = filterBatches(batches, searchTerm, filterStatus);

  // Paginate senders (Server-side metadata)
  const totalSenders = senderMeta.total || 0;
  const totalSenderPages = senderMeta.pages || 0;
  const hasNextSenderPage = senderPage < totalSenderPages;
  const hasPrevSenderPage = senderPage > 1;

  const paginatedSenders = senders;

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

  // Sender details modal handlers
  const openSenderDetails = (sender) => {
    setSelectedSender(sender);
    setShowSenderDetailsModal(true);
  };

  const closeSenderDetailsModal = () => {
    setShowSenderDetailsModal(false);
    setSelectedSender(null);
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
      toast.error(`Upload failed: ${error.message}`);
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

  // Sender handlers
  const handleGmailOAuth = () => {
    initiateGmailOAuth();
  };

  const handleOutlookOAuth = () => {
    initiateOutlookOAuth();
  };

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();

    // Auto-fill IMAP fields if not provided
    const formData = { ...smtpData };
    if (!formData.imapHost && formData.host) {
      formData.imapHost = formData.host.replace('smtp', 'imap');
    }
    if (!formData.imapUser) {
      formData.imapUser = formData.username;
    }
    if (!formData.imapPassword) {
      formData.imapPassword = formData.password;
    }

    try {
      await createSmtpSender.mutateAsync(formData);
      setShowSenderModal(false);
      setSmtpData({
        displayName: '',
        email: '',
        host: '',
        port: '587',
        username: '',
        password: '',
        secure: true,
        imapHost: '',
        imapPort: '993',
        imapSecure: true,
        imapUser: '',
        imapPassword: '',
        provider: 'custom',
      });
      refetchSenders();
      toast.success('SMTP sender created successfully!');
    } catch (error) {
      toast.error(`Failed to create SMTP sender: ${error.message}`);
    }
  };

  // Delete sender with type (without UI confirmation)
  const handleDeleteSender = async (sender) => {
    try {
      await deleteSender.mutateAsync({
        senderId: sender.id,
        senderType: sender.type,
      });
      toast.success(`${sender.type} sender deleted successfully`);
      refetchSenders();
    } catch (error) {
      toast.error(error.message || 'Failed to delete sender');
    }
  };

  const handleTestSender = async (senderId) => {
    try {
      await testSender.mutateAsync(senderId);
      toast.success('Sender test successful!');
    } catch (error) {
      toast.error(`Sender test failed: ${error.message}`);
    }
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

  // Handle URL parameters for OAuth success/error
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const senderId = urlParams.get('senderId');

    if (success && senderId) {
      toast.success(`${success === 'gmail_connected' ? 'Gmail' : 'Outlook'} connected successfully!`);
      refetchSenders();

      // Clean URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    if (error) {
      toast.error(`Connection failed: ${error}`);

      // Clean URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [refetchSenders]);

  return {
    // State
    activeTab,
    searchTerm,
    filterStatus,
    senderType,
    senderPage,
    senderViewMode,
    hasNextSenderPage,
    hasPrevSenderPage,
    totalSenders,
    SENDER_PAGE_SIZE,
    uploadStep,
    uploadedFile,
    fileHeaders,
    mapping,
    smtpData,
    showUploadModal,
    showSenderModal,
    showBatchModal,
    showSenderDetailsModal,
    selectedBatch,
    selectedSender,

    // Data
    batches,
    filteredBatches,
    senders,
    paginatedSenders,
    batchStatus, // Add this
    metrics: { valid, invalid, risky, unverified, totalContacts },

    // Loading
    isLoading: {
      batches: isLoadingBatches,
      senders: isLoadingSenders,
      batchStatus: isLoadingBatchStatus, // Add this
      uploading: uploadBatch.isPending,
      deletingBatch: deleteBatch.isPending,
      deletingSender: deleteSender.isPending,
      testingSender: testSender.isPending,
      creatingSender: createSmtpSender.isPending,
    },

    // Setters
    setActiveTab,
    setSearchTerm,
    setFilterStatus,
    setSenderType,
    setSenderPage,
    setSenderViewMode,
    setUploadStep,
    setMapping,
    setSmtpData,
    setShowUploadModal,
    setShowSenderModal,
    setShowBatchModal,
    setShowSenderDetailsModal,
    setSelectedBatch,
    setSelectedSender,
    setUploadedFile,
    setFileHeaders,

    // Actions
    resetUploadState: () =>
      resetUploadState(setUploadStep, setUploadedFile, setFileHeaders, setMapping),
    handleFileUploadWrapper,
    handleContactsUpload,
    handleGmailOAuth,
    handleOutlookOAuth,
    handleSmtpSubmit,
    handleDeleteSender,
    handleTestSender,
    handleDeleteBatch,
    openBatchDetails,
    closeBatchModal,
    openSenderDetails,
    closeSenderDetailsModal,
    refetchBatchStatus, // Add this
  };
};
