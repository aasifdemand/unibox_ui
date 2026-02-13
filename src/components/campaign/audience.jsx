import React, { useState, useRef } from "react";
import {
  Users,
  Upload,
  Mail,
  Plus,
  Check,
  Loader2,
  AtSign,
  Server,
  Shield,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  X,
  FileUp,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Mail as MailIcon,
  Building,
  Phone,
} from "lucide-react";
import Button from "../ui/button";
import * as XLSX from "xlsx";

// Import React Query hooks
import { useBatches, useUploadBatch } from "../../hooks/useBatches";
import { useSenders, useCreateSmtpSender } from "../../hooks/useSenders";
import {
  initiateGmailOAuth,
  initiateOutlookOAuth,
} from "../../hooks/useSenders";

const Step3Audience = ({ errors, watch, setValue, navigate }) => {
  const [senderType, setSenderType] = useState("gmail");
  const [showSmtpForm, setShowSmtpForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState(1); // 1: Upload, 2: Preview, 3: Mapping
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedData, setUploadedData] = useState([]);
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewRows, setPreviewRows] = useState(5);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  const watchListBatchId = watch("listBatchId");
  const watchSenderId = watch("senderId");

  // React Query hooks
  const {
    data: batches = [],
    isLoading: isLoadingBatches,
    refetch: refetchBatches,
  } = useBatches();

  const {
    data: senders = [],
    isLoading: isLoadingSenders,
    refetch: refetchSenders,
  } = useSenders();

  const uploadBatch = useUploadBatch();
  const createSmtpSender = useCreateSmtpSender();

  // Filter verified batches
  const verifiedBatches = batches.filter(
    (batch) => batch.status === "verified",
  );

  const handleBatchSelect = (batchId) => {
    setValue("listBatchId", batchId, { shouldValidate: true });
  };

  // Update the handleSenderSelect function in Step3Audience:
  const handleSenderSelect = (senderId, senderType) => {
    setValue("senderId", senderId, { shouldValidate: true });
    setValue("senderType", senderType, { shouldValidate: true });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      ".xlsx",
      ".xls",
    ];

    if (
      !validTypes.some(
        (type) => file.type.includes(type) || file.name.endsWith(type),
      )
    ) {
      alert("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setUploadedFile(file);
    parseExcelFile(file);
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length > 0) {
          const headers = jsonData[0];
          const rows = jsonData.slice(1).map((row, index) => {
            const rowObj = {};
            headers.forEach((header, colIndex) => {
              rowObj[header] = row[colIndex] || "";
            });
            return { id: index + 1, ...rowObj };
          });

          setFileHeaders(headers);
          setUploadedData(rows);
          setUploadStep(2);

          // Auto-map common headers
          const autoMapping = { ...mapping };
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
          setMapping(autoMapping);

          // Validate data
          validateData(rows, autoMapping);
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert(
          "Error reading Excel file. Please ensure it's a valid Excel file.",
        );
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validateData = (data, mapping) => {
    const errors = [];
    data.forEach((row, index) => {
      if (mapping.email && !row[mapping.email]) {
        errors.push(`Row ${index + 2}: Missing email`);
      }
      if (mapping.email && row[mapping.email]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row[mapping.email])) {
          errors.push(`Row ${index + 2}: Invalid email format`);
        }
      }
    });
    setValidationErrors(errors);
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      alert("Please select a file first");
      return;
    }

    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Create FormData with just the file
      const formData = new FormData();
      formData.append("file", uploadedFile);

      // You can optionally add metadata
      formData.append("mapping", JSON.stringify(mapping));
      formData.append("totalRows", uploadedData.length.toString());

      const result = await uploadBatch.mutateAsync(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setShowUploadModal(false);
        resetUploadState();
        refetchBatches();

        // If batchId is returned, auto-select it
        if (result.data?.batchId) {
          setValue("listBatchId", result.data.batchId, {
            shouldValidate: true,
          });
        }
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload error:", error);
      alert(error.message || "Upload failed. Please try again.");
    }
  };

  const resetUploadState = () => {
    setUploadStep(1);
    setUploadedFile(null);
    setUploadedData([]);
    setFileHeaders([]);
    setMapping({
      email: "",
      name: "",
      firstName: "",
      lastName: "",
      company: "",
      phone: "",
      city: "",
      country: "",
    });
    setUploadProgress(0);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGmailOAuth = () => {
    initiateGmailOAuth();
  };

  const handleOutlookOAuth = () => {
    initiateOutlookOAuth();
  };

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const smtpData = {
      email: formData.get("smtpEmail"),
      displayName: formData.get("displayName"),
      provider: "smtp",
      smtpHost: formData.get("smtpHost"),
      smtpPort: parseInt(formData.get("smtpPort")),
      smtpSecure: formData.get("smtpSecure") === "true",
      smtpUser: formData.get("smtpUser"),
      smtpPassword: formData.get("smtpPassword"),
    };

    try {
      await createSmtpSender.mutateAsync(smtpData);
      setShowSmtpForm(false);
      refetchSenders();
    } catch (error) {
      console.error("Failed to create SMTP sender:", error);
      alert(error.message || "Failed to create SMTP sender");
    }
  };

  const fieldIcons = {
    email: <MailIcon className="w-4 h-4 text-blue-600" />,
    name: <User className="w-4 h-4 text-green-600" />,
    firstName: <User className="w-4 h-4 text-green-600" />,
    lastName: <User className="w-4 h-4 text-green-600" />,
    company: <Building className="w-4 h-4 text-purple-600" />,
    phone: <Phone className="w-4 h-4 text-red-600" />,
    city: <MapPin className="w-4 h-4 text-orange-600" />,
    country: <Globe className="w-4 h-4 text-indigo-600" />,
  };

  const fieldNames = {
    email: "Email Address",
    name: "Full Name",
    firstName: "First Name",
    lastName: "Last Name",
    company: "Company",
    phone: "Phone Number",
    city: "City",
    country: "Country",
  };

  // Check if any mutation is pending
  const isUploading = uploadBatch.isPending;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/50">
        <div className="flex items-center mb-4">
          <Users className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Audience & Sender Configuration
          </h3>
        </div>
        <p className="text-gray-600">
          Select your recipient list and configure your sending mailbox
        </p>
      </div>

      {/* Recipient List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recipient List <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Choose who will receive this campaign
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="small"
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload New List
          </Button>
        </div>

        {isLoadingBatches ? (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading lists...</span>
          </div>
        ) : verifiedBatches.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-xl">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-2">
              No verified lists found
            </p>
            <p className="text-gray-600 mb-4">
              Upload and verify a contact list first
            </p>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="mx-auto"
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Contact List
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedBatches.map((batch) => (
              <div
                key={batch.id}
                onClick={() => handleBatchSelect(batch.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  watchListBatchId === batch.id
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileSpreadsheet className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-gray-900 truncate">
                          {batch.originalFilename}
                        </h4>
                      </div>
                      {watchListBatchId === batch.id && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {batch.validRecords || 0} contacts
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        Verified
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                      <span>
                        Uploaded{" "}
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/audience/${batch.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {errors.listBatchId && (
          <p className="text-sm text-red-600">{errors.listBatchId.message}</p>
        )}
      </div>

      {/* Sender Configuration Section */}
      <div className="pt-8 border-t border-gray-200">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sender Configuration
          </h3>
          <p className="text-gray-600">
            Choose how you want to send emails. We support OAuth for
            Gmail/Outlook or custom SMTP.
          </p>
        </div>

        {/* Sender Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div
            onClick={() => setSenderType("gmail")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              senderType === "gmail"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="font-medium text-gray-900">Gmail (OAuth)</h4>
            </div>
            <p className="text-sm text-gray-600">
              Secure OAuth authentication with Google
            </p>
          </div>

          <div
            onClick={() => setSenderType("outlook")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              senderType === "outlook"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <AtSign className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Outlook (OAuth)</h4>
            </div>
            <p className="text-sm text-gray-600">
              Microsoft 365 OAuth authentication
            </p>
          </div>

          <div
            onClick={() => setSenderType("smtp")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              senderType === "smtp"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                <Server className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Custom SMTP</h4>
            </div>
            <p className="text-sm text-gray-600">
              Connect any SMTP server with credentials
            </p>
          </div>
        </div>

        {/* Sender Configuration Form */}
        {senderType === "gmail" && (
          <div className="p-6 bg-linear-to-r from-red-50 to-orange-50/30 rounded-xl border border-red-100">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-red-600 mr-3" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  Gmail OAuth Setup
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Connect your Gmail account securely using OAuth 2.0
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <h5 className="font-medium text-gray-900 mb-2">Benefits:</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <Shield className="w-4 h-4 text-green-600 mr-2" />
                    No password storage - uses secure tokens
                  </li>
                  <li className="flex items-center">
                    <Lock className="w-4 h-4 text-green-600 mr-2" />
                    Better deliverability and reputation
                  </li>
                  <li className="flex items-center">
                    <Globe className="w-4 h-4 text-green-600 mr-2" />
                    Higher sending limits
                  </li>
                </ul>
              </div>

              <Button
                type="button"
                onClick={handleGmailOAuth}
                className="w-full bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Connect Gmail Account
              </Button>
            </div>
          </div>
        )}

        {senderType === "outlook" && (
          <div className="p-6 bg-linear-to-r from-blue-50 to-cyan-50/30 rounded-xl border border-blue-100">
            <div className="flex items-center mb-4">
              <AtSign className="w-6 h-6 text-blue-600 mr-3" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  Outlook OAuth Setup
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Connect your Microsoft 365/Outlook account securely
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <h5 className="font-medium text-gray-900 mb-2">Benefits:</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <Shield className="w-4 h-4 text-green-600 mr-2" />
                    Enterprise-grade security with Microsoft Azure AD
                  </li>
                  <li className="flex items-center">
                    <Lock className="w-4 h-4 text-green-600 mr-2" />
                    No app passwords required
                  </li>
                  <li className="flex items-center">
                    <Globe className="w-4 h-4 text-green-600 mr-2" />
                    Works with Office 365 and Outlook.com
                  </li>
                </ul>
              </div>

              <Button
                type="button"
                onClick={handleOutlookOAuth}
                className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <AtSign className="w-4 h-4 mr-2" />
                Connect Outlook Account
              </Button>
            </div>
          </div>
        )}

        {senderType === "smtp" && (
          <div className="space-y-4">
            <div className="p-6 bg-linear-to-r from-purple-50 to-indigo-50/30 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Server className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Custom SMTP Setup
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure your own SMTP server settings
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={() => setShowSmtpForm(!showSmtpForm)}
                >
                  {showSmtpForm ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Hide Form
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show Form
                    </>
                  )}
                </Button>
              </div>

              {showSmtpForm && (
                <form onSubmit={handleSmtpSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="displayName"
                        type="text"
                        required
                        disabled={createSmtpSender.isPending}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        placeholder="Your Company Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sender Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="smtpEmail"
                        type="email"
                        required
                        disabled={createSmtpSender.isPending}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                        placeholder="sender@yourdomain.com"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Server className="w-4 h-4 mr-2" />
                      SMTP Settings
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Host <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="smtpHost"
                          type="text"
                          required
                          disabled={createSmtpSender.isPending}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                          placeholder="smtp.yourdomain.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Port <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="smtpPort"
                          type="number"
                          required
                          disabled={createSmtpSender.isPending}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                          placeholder="587"
                          defaultValue="587"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="smtpUser"
                          type="text"
                          required
                          disabled={createSmtpSender.isPending}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                          placeholder="username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="smtpPassword"
                          type="password"
                          required
                          disabled={createSmtpSender.isPending}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center">
                      <input
                        name="smtpSecure"
                        type="checkbox"
                        id="smtpSecure"
                        className="h-4 w-4 text-blue-600 rounded"
                        defaultChecked={true}
                        disabled={createSmtpSender.isPending}
                      />
                      <label
                        htmlFor="smtpSecure"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Use TLS/SSL encryption
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSmtpForm(false)}
                      disabled={createSmtpSender.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={createSmtpSender.isPending}
                      disabled={createSmtpSender.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save SMTP Configuration
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Existing Senders List */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">Available Senders</h4>
              <p className="text-sm text-gray-500">
                Select a configured sender to use for this campaign
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={() => navigate("/dashboard/senders")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Manage Senders
            </Button>
          </div>

          {isLoadingSenders ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading senders...</span>
            </div>
          ) : senders.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-xl">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">
                No senders configured
              </p>
              <p className="text-gray-600 mb-4">
                Connect a sender using one of the methods above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {senders?.map((sender) => {
                // Determine sender type based on sender properties
                const senderType = sender.googleId
                  ? "gmail"
                  : sender.microsoftId
                    ? "outlook"
                    : sender.smtpHost
                      ? "smtp"
                      : "smtp";

                return (
                  <div
                    key={sender.id}
                    onClick={() => handleSenderSelect(sender.id, senderType)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      watchSenderId === sender.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        {senderType === "gmail"
                          ? "G"
                          : senderType === "outlook"
                            ? "O"
                            : "S"}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{sender.displayName}</h4>
                        <p className="text-sm text-gray-600">{sender.email}</p>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded mt-1 inline-block">
                          {senderType.toUpperCase()}
                        </span>
                      </div>
                      {watchSenderId === sender.id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {errors.senderId && (
            <p className="text-sm text-red-600">{errors.senderId.message}</p>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileSpreadsheet className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Upload Contact List
                    </h3>
                    <p className="text-sm text-gray-600">
                      Upload an Excel file (.xlsx) with your contacts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadState();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mt-6 mb-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        uploadStep === step
                          ? "bg-blue-600 text-white"
                          : uploadStep > step
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {uploadStep > step ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step < 3
                          ? uploadStep > step
                            ? "bg-green-100"
                            : "bg-gray-200"
                          : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm">
                <span
                  className={
                    uploadStep >= 1
                      ? "text-blue-600 font-medium"
                      : "text-gray-500"
                  }
                >
                  Upload File
                </span>
                <span
                  className={
                    uploadStep >= 2
                      ? "text-blue-600 font-medium"
                      : "text-gray-500"
                  }
                >
                  Preview Data
                </span>
                <span
                  className={
                    uploadStep >= 3
                      ? "text-blue-600 font-medium"
                      : "text-gray-500"
                  }
                >
                  Map Fields
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Step 1: Upload File */}
              {uploadStep === 1 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                    <FileUp className="w-10 h-10 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Excel File
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Upload an Excel (.xlsx or .xls) file containing your contact
                    list
                  </p>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      disabled={isUploading}
                    />
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Drag & drop your Excel file here or
                    </p>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      disabled={isUploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Browse Files
                    </Button>
                    <p className="text-xs text-gray-500 mt-4">
                      Supported formats: .xlsx, .xls
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Preview Data */}
              {uploadStep === 2 && uploadedData.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        Data Preview
                      </h4>
                      <p className="text-gray-600">
                        Previewing {previewRows} of {uploadedData.length} rows
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="small"
                        onClick={() =>
                          setPreviewRows(
                            Math.min(previewRows + 5, uploadedData.length),
                          )
                        }
                        disabled={isUploading}
                      >
                        Show More
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="small"
                        onClick={() => setUploadStep(3)}
                        disabled={isUploading}
                      >
                        Continue to Mapping
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            {fileHeaders.map((header, index) => (
                              <th
                                key={index}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {uploadedData
                            .slice(0, previewRows)
                            .map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50">
                                {fileHeaders.map((header, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className="px-4 py-3 text-sm text-gray-900"
                                  >
                                    {row[header] || "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Validation Summary */}
                  {validationErrors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                        <h5 className="font-medium text-yellow-800">
                          Validation Issues Found
                        </h5>
                      </div>
                      <p className="text-sm text-yellow-700">
                        {validationErrors.length} validation errors found in
                        your data. These rows may need attention before
                        uploading.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadStep(1)}
                      disabled={isUploading}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <div className="text-sm text-gray-600">
                      Total Rows: {uploadedData.length} | Columns:{" "}
                      {fileHeaders.length}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Field Mapping */}
              {uploadStep === 3 && uploadedData.length > 0 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Map Your Fields
                    </h4>
                    <p className="text-gray-600">
                      Match your spreadsheet columns to our contact fields
                    </p>
                  </div>

                  {/* Field Mapping Form */}
                  <div className="space-y-4">
                    {Object.keys(mapping).map((field) => (
                      <div
                        key={field}
                        className="flex items-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center mr-4">
                          {fieldIcons[field]}
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {fieldNames[field]}
                            {field === "email" && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          <select
                            value={mapping[field]}
                            onChange={(e) =>
                              setMapping({
                                ...mapping,
                                [field]: e.target.value,
                              })
                            }
                            disabled={isUploading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                          >
                            <option value="">Select column...</option>
                            {fileHeaders.map((header) => (
                              <option key={header} value={header}>
                                {header} (Sample:{" "}
                                {uploadedData[0]?.[header]
                                  ?.toString()
                                  .substring(0, 20) || "No data"}
                                )
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Required Field Warning */}
                  {!mapping.email && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <span className="text-red-800 font-medium">
                          Email field mapping is required
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadStep(2)}
                      disabled={isUploading}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Preview
                    </Button>
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetUploadState}
                        disabled={isUploading}
                      >
                        Start Over
                      </Button>
                      <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={!mapping.email || isUploading}
                        isLoading={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload List
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Uploading your contact list
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Processing {uploadedData.length} contacts...
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {uploadProgress}% complete
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3Audience;
