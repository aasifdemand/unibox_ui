import React, { useState, useEffect } from "react";
import { useUploadStore } from "../../../store/upload.store";
import { useSenderStore } from "../../../store/sender.store";

import ShowUpload from "../../../modals/showupload";
import ShowSender from "../../../modals/showsender";
import ShowBatchDetails from "./showbatchdetails";
import AudienceHeader from "./audience-header";
import AudienceTabs from "./audience-tabs";
import {
  calculateVerificationTotals,
  filterBatches,
  resetUploadState,
} from "./audience-service";

const Audience = () => {
  const [activeTab, setActiveTab] = useState("contacts");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSenderModal, setShowSenderModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [senderType, setSenderType] = useState("gmail");

  // Contacts state
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    email: "",
    name: "",
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
    city: "",
    country: "",
  });
  const [uploading, setUploading] = useState(false);

  // Senders state - Enhanced with IMAP support
  const [smtpData, setSmtpData] = useState({
    displayName: "",
    email: "",
    host: "",
    port: "587",
    username: "",
    password: "",
    secure: true,
    // IMAP fields
    imapHost: "",
    imapPort: "993",
    imapSecure: true,
    imapUser: "",
    imapPassword: "",
    // Provider info
    provider: "custom",
  });

  // Fetch data from stores
  const {
    batches,
    isLoading: isLoadingBatches,
    fetchBatches,
    uploadBatch,
    deleteBatch,
    getBatchStatus,
  } = useUploadStore();

  const {
    senders,
    isLoading: isLoadingSenders,
    fetchSenders,
    initiateGmailOAuth,
    initiateOutlookOAuth,
    createSmtpSender,
    deleteSender,
    testSender,
  } = useSenderStore();

  useEffect(() => {
    fetchBatches();
    fetchSenders();
  }, [fetchBatches, fetchSenders]);

  // Calculate verification totals using service function
  const { valid, invalid, risky, unverified } =
    calculateVerificationTotals(batches);

  const totalContacts = valid + invalid + risky + unverified;

  // Filter batches using service function
  const filteredBatches = filterBatches(batches, searchTerm, filterStatus);

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
      alert("Please map the email column before uploading");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const result = await uploadBatch(formData);

      if (result.success) {
        setUploading(false);
        setShowUploadModal(false);
        resetUploadState(
          setUploadStep,
          setUploadedFile,
          setFileHeaders,
          setMapping,
        );
        fetchBatches();
      } else {
        setUploading(false);
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      setUploading(false);
      alert("Upload failed. Please try again.");
      console.log(error);
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
      if (lowerHeader.includes("email")) autoMapping.email = header;
      if (
        lowerHeader.includes("name") &&
        !lowerHeader.includes("first") &&
        !lowerHeader.includes("last")
      )
        autoMapping.name = header;
      if (lowerHeader.includes("first")) autoMapping.firstName = header;
      if (lowerHeader.includes("last")) autoMapping.lastName = header;
      if (lowerHeader.includes("company")) autoMapping.company = header;
      if (lowerHeader.includes("phone")) autoMapping.phone = header;
      if (lowerHeader.includes("city")) autoMapping.city = header;
      if (lowerHeader.includes("country")) autoMapping.country = header;
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
      formData.imapHost = formData.host.replace("smtp", "imap");
    }
    if (!formData.imapUser) {
      formData.imapUser = formData.username;
    }
    if (!formData.imapPassword) {
      formData.imapPassword = formData.password;
    }

    const success = await createSmtpSender(formData);
    if (success) {
      setShowSenderModal(false);
      setSmtpData({
        displayName: "",
        email: "",
        host: "",
        port: "587",
        username: "",
        password: "",
        secure: true,
        imapHost: "",
        imapPort: "993",
        imapSecure: true,
        imapUser: "",
        imapPassword: "",
        provider: "custom",
      });
      fetchSenders();
    }
  };

  // ✅ UPDATED: Delete sender with type
  const handleDeleteSender = async (sender) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${sender.email} (${sender.type})?`,
      )
    ) {
      const result = await deleteSender(sender.id, sender.type);
      if (result.success) {
        alert(result.message || `${sender.type} sender deleted successfully`);
        fetchSenders();
      } else {
        alert(result.error || "Failed to delete sender");
      }
    }
  };

  const handleTestSender = async (senderId) => {
    const success = await testSender(senderId);
    if (success) {
      alert("Sender test successful!");
    } else {
      alert("Sender test failed. Please check your configuration.");
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this contact list? This action cannot be undone.",
      )
    ) {
      await deleteBatch(batchId);
      fetchBatches();
    }
  };

  // Handle URL parameters for OAuth success/error
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");
    const senderId = urlParams.get("senderId");

    if (success && senderId) {
      alert(
        `${success === "gmail_connected" ? "Gmail" : "Outlook"} connected successfully!`,
      );
      fetchSenders();

      // Clean URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    if (error) {
      alert(`Connection failed: ${error}`);

      // Clean URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [fetchSenders]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <AudienceHeader
        activeTab={activeTab}
        invalid={invalid}
        setShowSenderModal={setShowSenderModal}
        setShowUploadModal={setShowUploadModal}
        totalContacts={totalContacts}
        unverified={unverified}
        verified={valid}
        risky={risky}
      />

      {/* Tabs */}
      <AudienceTabs
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        setSearchTerm={setSearchTerm}
        isLoadingBatches={isLoadingBatches}
        filteredBatches={filteredBatches}
        setShowSenderModal={setShowSenderModal}
        setShowUploadModal={setShowUploadModal}
        handleDeleteBatch={handleDeleteBatch}
        isLoadingSenders={isLoadingSenders}
        senders={senders}
        handleDeleteSender={handleDeleteSender} // ✅ Pass the updated handler
        handleTestSender={handleTestSender}
        openBatchDetails={openBatchDetails}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <ShowUpload
          setShowUploadModal={setShowUploadModal}
          uploadStep={uploadStep}
          resetUploadState={() =>
            resetUploadState(
              setUploadStep,
              setUploadedFile,
              setFileHeaders,
              setMapping,
            )
          }
          handleFileUpload={handleFileUploadWrapper}
          mapping={mapping}
          setMapping={setMapping}
          fileHeaders={fileHeaders}
          setUploadStep={setUploadStep}
          handleContactsUpload={handleContactsUpload}
          uploading={uploading}
        />
      )}

      {/* Add Sender Modal */}
      {showSenderModal && (
        <ShowSender
          setShowSenderModal={setShowSenderModal}
          setSenderType={setSenderType}
          senderType={senderType}
          handleGmailOAuth={handleGmailOAuth}
          handleOutlookOAuth={handleOutlookOAuth}
          handleSmtpSubmit={handleSmtpSubmit}
          smtpData={smtpData}
          setSmtpData={setSmtpData}
        />
      )}

      {/* Batch Details Modal */}
      {showBatchModal && selectedBatch && (
        <ShowBatchDetails
          selectedBatch={selectedBatch}
          closeBatchModal={closeBatchModal}
          getBatchStatus={getBatchStatus}
        />
      )}
    </div>
  );
};

export default Audience;
