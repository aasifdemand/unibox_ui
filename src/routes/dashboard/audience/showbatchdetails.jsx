import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  User,
  Search,
  Download,
} from "lucide-react";
import Button from "../../../components/ui/button";
import { formatDate, getPaginatedData } from "./audience-service";
import Modal from "../../../components/shared/modal";

const ShowBatchDetails = ({
  selectedBatch,
  closeBatchModal,
  getBatchStatus,
}) => {
  const [batchDetails, setBatchDetails] = useState(null);
  const [verificationResults, setVerificationResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");

  useEffect(() => {
    const loadBatchDetails = async () => {
      setIsLoading(true);
      try {
        const result = await getBatchStatus(selectedBatch.id);
        if (result.success) {
          setBatchDetails(result.data);
          setVerificationResults(result.data.allRecords || []);
        }
      } catch (error) {
        console.error("Error loading batch details:", error);
        setBatchDetails(null);
        setVerificationResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedBatch) {
      loadBatchDetails();
    }
  }, [selectedBatch, getBatchStatus]);

  // Filter results
  const filteredResults = verificationResults.filter((record) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter (removed - we only need verification filter)
    const matchesVerification =
      verificationFilter === "all" ||
      record.verificationStatus === verificationFilter;

    return matchesSearch && matchesVerification;
  });

  const {
    totalPages,
    totalRecords,
    indexOfFirstRecord,
    indexOfLastRecord,
    currentRecords,
  } = getPaginatedData(filteredResults, currentPage, recordsPerPage);

  const getVerificationIcon = (status) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "invalid":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "risky":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getVerificationBadgeClass = (status) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "invalid":
        return "bg-red-100 text-red-800";
      case "risky":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting verification results");
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl">
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-3" />
            <span className="text-gray-600">Loading batch details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={!!selectedBatch}
      onClose={closeBatchModal}
      title={selectedBatch?.originalFilename}
      maxWidth="max-w-6xl"
      closeOnBackdrop={true}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileSpreadsheet className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedBatch?.originalFilename}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Batch ID: {selectedBatch?.id} | Uploaded:{" "}
                    {formatDate(selectedBatch?.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={closeBatchModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Total</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {batchDetails?.batch?.totalRecords || 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Valid</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {batchDetails?.verification?.verified || 0}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-gray-600">Risky</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {batchDetails?.verification?.unverified || 0}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-sm text-gray-600">Invalid</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {batchDetails?.verification?.invalid || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-600">Success Rate</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {batchDetails?.batch?.totalRecords
                    ? `${(((batchDetails?.verification?.verified || 0) / batchDetails.batch.totalRecords) * 100).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search emails or names..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={verificationFilter}
                      onChange={(e) => setVerificationFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Verification</option>
                      <option value="valid">Verified</option>
                      <option value="invalid">Invalid</option>
                      <option value="risky">Risky</option>
                      {/* Remove "unverified" option since it doesn't exist in your data */}
                    </select>

                    <Button variant="primary" onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Records Table with Verification */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Verification Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Verification Score
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Verified At
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Added
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentRecords.map((record, index) => (
                          <tr
                            key={record.id || index}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {record.email || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {record.name || "-"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {getVerificationIcon(record.verificationStatus)}
                                <span
                                  className={`ml-2 text-xs px-2 py-1 rounded font-medium ${getVerificationBadgeClass(
                                    record.verificationStatus || "",
                                  )}`}
                                >
                                  {record.verificationStatus || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                              {record?.verificationReason?.raw?.score}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {record.verifiedAt
                                ? formatDate(record.verifiedAt)
                                : "Never"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(record.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-700">
                      Showing {indexOfFirstRecord + 1} to {indexOfLastRecord} of{" "}
                      {totalRecords} records
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredResults.length} records with verification
                status
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={closeBatchModal}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export All Records
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShowBatchDetails;
