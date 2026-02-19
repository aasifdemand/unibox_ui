import React, { useState, useRef } from "react";
import { Users, Mail, Check, Loader2, FileSpreadsheet } from "lucide-react";
import Button from "../../../../../components/ui/button";
import * as XLSX from "xlsx";

// Import modal components
import ShowUpload from "../../../../../modals/showupload";
import ShowSender from "../../../../../modals/showsender";

// Import React Query hooks
import { useUploadBatch } from "../../../../../hooks/useBatches";
import {
  useCreateSmtpSender,
  initiateGmailOAuth,
  initiateOutlookOAuth,
} from "../../../../../hooks/useSenders";

const Step2Audience = ({
  setValue,
  senders = [],
  verifiedBatches = [],
  isLoadingSenders,
  isLoadingBatches,
  handleBatchSelect,
  handleSenderSelect,
  watchListBatchId,
  watchSenderId,
  refetchBatches,
  refetchSenders,
}) => {
  const [senderType, setSenderType] = useState("gmail");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSenderModal, setShowSenderModal] = useState(false);

  const [uploadStep, setUploadStep] = useState(1);
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
    role: "",
    industry: "",
  });
  const fileInputRef = useRef(null);

  // SMTP form state
  const [smtpData, setSmtpData] = useState({
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

  const uploadBatch = useUploadBatch();
  const createSmtpSender = useCreateSmtpSender();

  const handleFileUploadWrapper = (file, headers) => {
    setUploadedFile(file);
    setFileHeaders(headers);
    setUploadStep(2);

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
      if (
        lowerHeader.includes("role") ||
        lowerHeader.includes("title") ||
        lowerHeader.includes("job")
      )
        autoMapping.role = header;
      if (lowerHeader.includes("industry") || lowerHeader.includes("sector"))
        autoMapping.industry = header;
    });
    setMapping((prev) => ({ ...prev, ...autoMapping }));
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
          setUploadedData(rows);
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleContactsUpload = async () => {
    if (!uploadedFile || !mapping.email) {
      alert("Please map the email column before uploading");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("mapping", JSON.stringify(mapping));
      formData.append("totalRows", uploadedData.length.toString());
      const result = await uploadBatch.mutateAsync(formData);
      setShowUploadModal(false);
      resetUploadState();
      if (refetchBatches) refetchBatches();
      if (result.data?.batchId) {
        setValue("listBatchId", result.data.batchId, { shouldValidate: true });
      }
    } catch (error) {
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
      role: "",
      industry: "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();
    const formData = { ...smtpData };
    if (!formData.imapHost && formData.host)
      formData.imapHost = formData.host.replace("smtp", "imap");
    if (!formData.imapUser) formData.imapUser = formData.username;
    if (!formData.imapPassword) formData.imapPassword = formData.password;

    try {
      await createSmtpSender.mutateAsync(formData);
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
      if (refetchSenders) refetchSenders();
    } catch (error) {
      alert(`Failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tighter">
                Audience & Senders
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Manage your dispatch configuration
              </p>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
            >
              Add Contacts
            </button>
            <button
              onClick={() => setShowSenderModal(true)}
              className="px-6 py-2.5 bg-blue-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
            >
              Add Sender
            </button>
          </div>
        </div>
      </div>

      {/* Recipient List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
              Selected Audience
            </h4>
          </div>
          {verifiedBatches.length > 0 && (
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
              {verifiedBatches.length} Lists Available
            </span>
          )}
        </div>

        {isLoadingBatches ? (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-50/30 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-500/20 animate-spin" />
            <p className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest mt-4">
              Syncing...
            </p>
          </div>
        ) : verifiedBatches.length === 0 ? (
          <div className="py-20 text-center bg-slate-50/20 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest mb-2">
              Empty Library
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">
              Upload your first CSV or Excel list
            </p>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="rounded-2xl px-10"
            >
              Upload Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedBatches.map((batch) => (
              <div
                key={batch.id}
                onClick={() => handleBatchSelect(batch.id)}
                className={`group relative p-6 rounded-4xl border-2 transition-all duration-300 cursor-pointer ${
                  watchListBatchId === batch.id
                    ? "border-blue-500 bg-white shadow-xl ring-4 ring-blue-500/5 rotate-0"
                    : "border-slate-100 bg-white hover:border-blue-200 hover:-translate-y-1"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${watchListBatchId === batch.id ? "bg-blue-600" : "bg-slate-50"}`}
                  >
                    <FileSpreadsheet
                      className={`w-5 h-5 ${watchListBatchId === batch.id ? "text-white" : "text-emerald-500"}`}
                    />
                  </div>
                  {watchListBatchId === batch.id && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <h4
                  className={`font-extrabold truncate text-[11px] uppercase tracking-tight mb-1 ${watchListBatchId === batch.id ? "text-blue-900" : "text-slate-800"}`}
                >
                  {batch.originalFilename}
                </h4>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                      {batch.validRecords || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Senders Section */}
      <div className="pt-8 border-t border-slate-100 space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
              Dispatch Account
            </h4>
          </div>
        </div>

        {isLoadingSenders ? (
          <div className="py-12 bg-slate-50/20 rounded-4xl border border-slate-100 flex flex-col items-center">
            <Loader2 className="w-6 h-6 text-blue-500/20 animate-spin" />
            <p className="text-[10px] font-extrabold text-slate-300 uppercase mt-4">
              Syncing...
            </p>
          </div>
        ) : senders.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/30 rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <Button onClick={() => setShowSenderModal(true)} variant="outline">
              Connect First Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {senders.map((sender) => {
              const isSelected = watchSenderId === sender.id;
              const sType = sender.senderType || sender.type;

              return (
                <div
                  key={sender.id}
                  onClick={() => handleSenderSelect(sender.id, sType)}
                  className={`group relative p-5 rounded-4xl border-2 transition-all duration-300 cursor-pointer flex items-center gap-4 ${
                    isSelected
                      ? "border-blue-500 bg-white shadow-xl ring-4 ring-blue-500/5"
                      : "border-slate-100 bg-white hover:border-blue-200"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-extrabold transition-all ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"}`}
                  >
                    {sType.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[10px] font-extrabold uppercase tracking-tight truncate ${isSelected ? "text-blue-900" : "text-slate-800"}`}
                    >
                      {sender.displayName}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold truncate">
                      {sender.email}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
          uploading={uploadBatch.isPending}
        />
      )}
      {showSenderModal && (
        <ShowSender
          setShowSenderModal={setShowSenderModal}
          setSenderType={setSenderType}
          senderType={senderType}
          handleGmailOAuth={initiateGmailOAuth}
          handleOutlookOAuth={initiateOutlookOAuth}
          handleSmtpSubmit={handleSmtpSubmit}
          smtpData={smtpData}
          setSmtpData={setSmtpData}
          isSubmitting={createSmtpSender.isPending}
        />
      )}
    </div>
  );
};

export default Step2Audience;
