import React, { useState, useMemo, useCallback } from "react";
import {
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Search,
  Download,
  Users,
  Shield,
  Zap,
  Filter,
} from "lucide-react";
import Button from "../components/ui/button";
import {
  formatDate,
  getPaginatedData,
} from "../routes/dashboard/audience/audience-service";
import Modal from "../components/shared/modal";
import { useExportVerificationResults } from "../hooks/useBatches";

const ShowBatchDetails = ({
  selectedBatch,
  closeBatchModal,
  batchStatus,
  isLoading,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");

  // Get all records from batchStatus
  const allRecords = useMemo(
    () => batchStatus?.allRecords || [],
    [batchStatus],
  );

  // Filter records based on search and filter
  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        verificationFilter === "all" ||
        record.verificationStatus === verificationFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allRecords, searchTerm, verificationFilter]);

  // Pagination
  const {
    totalPages,
    totalRecords,
    indexOfFirstRecord,
    indexOfLastRecord,
    currentRecords,
  } = useMemo(
    () => getPaginatedData(filteredRecords, currentPage, recordsPerPage),
    [filteredRecords, currentPage, recordsPerPage],
  );

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((e) => {
    setVerificationFilter(e.target.value);
    setCurrentPage(1);
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const getVerificationIcon = useCallback((status) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "invalid":
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case "risky":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  }, []);

  const getVerificationBadgeClass = useCallback((status) => {
    switch (status) {
      case "valid":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "invalid":
        return "bg-rose-50 text-rose-600 border border-rose-100";
      case "risky":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      default:
        return "bg-slate-50 text-slate-500 border border-slate-100";
    }
  }, []);

  const exportVerification = useExportVerificationResults();

  const handleExport = useCallback(() => {
    if (!selectedBatch?.id) return;
    exportVerification.mutate({ batchId: selectedBatch.id, format: "csv" });
  }, [exportVerification, selectedBatch]);

  return (
    <Modal
      isOpen={!!selectedBatch}
      onClose={closeBatchModal}
      maxWidth="max-w-6xl"
      closeOnBackdrop={true}
    >
      <div className="bg-linear-to-br from-indigo-600 to-blue-700 p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Users className="w-20 h-20 text-blue-400" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-tighter">
              Batch Details
            </h3>
            <p className="text-[10px] font-bold text-indigo-100/60 uppercase tracking-widest mt-0.5">
              Contact verification results
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full"></div>
            </div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-8">
              Loading batch data...
            </p>
          </div>
        ) : (
          <>
            {/* Batch Info Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                  <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-800 uppercase tracking-tighter">
                    {selectedBatch?.originalFilename}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                    <span>Batch ID: {selectedBatch?.id}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>
                      Uploaded: {formatDate(selectedBatch?.createdAt)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Stats Grid - Premium Style */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group hover:border-indigo-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Total
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800">
                    {batchStatus?.batch?.totalRecords || 0}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group hover:border-emerald-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Valid
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800">
                    {batchStatus?.verification?.valid || 0}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group hover:border-amber-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Risky
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800">
                    {batchStatus?.verification?.risky || 0}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group hover:border-rose-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Invalid
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800">
                    {batchStatus?.verification?.invalid || 0}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group hover:border-indigo-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Success Rate
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800">
                    {batchStatus?.batch?.totalRecords
                      ? `${(((batchStatus?.verification?.valid || 0) / batchStatus.batch.totalRecords) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>

            {/* Filters Section - Premium Style */}
            <div className="bg-slate-50/50 p-5 rounded-4xl border-2 border-slate-100 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search by email or name..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={verificationFilter}
                      onChange={handleFilterChange}
                      className="appearance-none pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="valid">Valid</option>
                      <option value="invalid">Invalid</option>
                      <option value="risky">Risky</option>
                    </select>
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <Button
                    onClick={handleExport}
                    variant="primary"
                    className="px-6 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Records Table - Premium Style */}
            <div className="border-2 border-slate-100 rounded-4xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-100">
                      <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        Verified On
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        Added On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="group hover:bg-indigo-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                              <Mail className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-800">
                              {record.email || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">
                          {record.name || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getVerificationIcon(record.verificationStatus)}
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-xl ${getVerificationBadgeClass(
                                record.verificationStatus,
                              )}`}
                            >
                              {record.verificationStatus || "unverified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-600">
                            {record.verificationReason?.raw?.score || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-600">
                            {record.verifiedAt
                              ? formatDate(record.verifiedAt)
                              : "Never"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-600">
                            {formatDate(record.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {currentRecords.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                              <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">
                              No records found
                            </p>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                              Try adjusting your filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 mt-6 border-t-2 border-slate-100">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Showing {indexOfFirstRecord + 1} to {indexOfLastRecord} of{" "}
                  {totalRecords} records
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:hover:border-slate-100 disabled:hover:text-slate-400"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-extrabold text-slate-800 px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:hover:border-slate-100 disabled:hover:text-slate-400"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {filteredRecords.length} records verified
                </span>
              </div>
              <Button
                onClick={handleExport}
                variant="primary"
                className="px-8 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
              >
                <Download className="w-4 h-4" />
                Export All Records
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ShowBatchDetails;
