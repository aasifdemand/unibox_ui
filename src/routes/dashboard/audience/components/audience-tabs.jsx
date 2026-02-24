import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye, // Edit2 removed, Eye is already present
  FileSpreadsheet,
  Filter,
  LayoutGrid,
  List,
  Mail,
  Plus,
  Search,
  Server,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { Gmail } from "../../../../icons/gmail";
import { MicrosoftOutlook } from "../../../../icons/outlook";
import { useExportBatch } from "../../../../hooks/useBatches";
import Pagination from "../../mailboxes/components/pagination";
import { motion, AnimatePresence } from "motion/react";

const AudienceTabs = ({
  setActiveTab,
  activeTab,
  searchTerm,
  filterStatus,
  setFilterStatus,
  setSearchTerm,
  isLoadingBatches,
  filteredBatches,
  setShowSenderModal,
  setShowUploadModal,
  handleDeleteBatch,
  isLoadingSenders,
  senders,
  handleDeleteSender,
  handleTestSender,
  openBatchDetails,
  paginatedSenders,
  senderPage,
  senderViewMode,
  hasNextSenderPage,
  hasPrevSenderPage,
  totalSenders,
  SENDER_PAGE_SIZE,
  setSenderPage,
  setSenderViewMode,
}) => {
  const exportBatch = useExportBatch();
  return (
    <div className="premium-card border-none bg-slate-50/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-slate-900/3">
      <div className="bg-white/80 border-b border-slate-200/50 px-8">
        <nav className="flex items-center gap-10">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`relative py-6 font-extrabold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === "contacts"
              ? "text-blue-600"
              : "text-slate-400 hover:text-slate-800"
              }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contact Lists
            </div>
            {activeTab === "contacts" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-4px_12px_rgba(37,99,235,0.4)]"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("senders")}
            className={`relative py-6 font-extrabold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === "senders"
              ? "text-blue-600"
              : "text-slate-400 hover:text-slate-800"
              }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Senders
            </div>
            {activeTab === "senders" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-4px_12px_rgba(37,99,235,0.4)]"></div>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === "contacts" ? (
          <div className="space-y-8">
            {/* Command Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 max-w-xl group">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search contact lists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-[10px] font-extrabold uppercase tracking-widest focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="uploaded">Uploaded</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Lists Grid */}
            {isLoadingBatches ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Loading contacts...
                </p>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="premium-card bg-white border-dashed border-2 border-slate-200 p-20 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
                  <FileSpreadsheet className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">
                  No Contacts
                </h3>
                <p className="text-sm font-medium text-slate-400 max-w-xs mb-8">
                  No contact lists found. Upload your first list to get started.
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary py-3 px-8 flex items-center gap-3"
                >
                  <Upload className="w-4 h-4 text-white" />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">
                    Upload Contacts
                  </span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="premium-card bg-white border-slate-200/60 p-6 hover:shadow-2xl hover:shadow-blue-500/8 group transition-all duration-500"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                          <FileSpreadsheet className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-500" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-800 truncate tracking-tight text-sm">
                            {batch.originalFilename}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${batch.status === "completed"
                                ? "bg-emerald-500"
                                : batch.status === "processing"
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-rose-500"
                                }`}
                            ></div>
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                              {batch.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openBatchDetails(batch)}
                          className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-8 mt-2">
                      <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Valid
                        </p>
                        <p className="text-lg font-extrabold text-emerald-600 tabular-nums leading-none">
                          {batch.verification?.valid ?? 0}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Risky
                        </p>
                        <p className="text-lg font-extrabold text-amber-600 tabular-nums leading-none">
                          {batch.verification?.risky ?? 0}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Invalid
                        </p>
                        <p className="text-lg font-extrabold text-rose-600 tabular-nums leading-none">
                          {batch.verification?.invalid ?? 0}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Unverified
                        </p>
                        <p className="text-lg font-extrabold text-slate-600 tabular-nums leading-none">
                          {batch.verification?.unverified ?? 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-widest">
                          Uploaded On
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {new Date(batch.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openBatchDetails(batch)}
                          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 transition-all"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() =>
                            exportBatch.mutate({ batchId: batch.id })
                          }
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-blue-600 transition-all flex items-center gap-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Senders Header */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 max-w-xl">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                  Email Senders
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Manage your email sending accounts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100/80 p-1 rounded-xl">
                <button
                  onClick={() => setSenderViewMode("grid")}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all duration-300 ${senderViewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSenderViewMode("list")}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all duration-300 ${senderViewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setShowSenderModal(true)}
                className="btn-primary py-2.5 px-6 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">
                  Add Sender
                </span>
              </button>
            </div>

            {/* Senders List Grid */}
            <AnimatePresence mode="wait">
              {isLoadingSenders ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center p-20 gap-4"
                >
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Loading senders...
                  </p>
                </motion.div>
              ) : senders.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="premium-card bg-white border-dashed border-2 border-slate-200 p-20 text-center flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
                    <Mail className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">
                    No Senders
                  </h3>
                  <p className="text-sm font-medium text-slate-400 max-w-xs mb-8">
                    No email senders found. Add a sender to start sending
                    campaigns.
                  </p>
                  <button
                    onClick={() => setShowSenderModal(true)}
                    className="btn-primary py-3 px-8 flex items-center gap-3"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">
                      Add Sender
                    </span>
                  </button>
                </motion.div>
              ) : senderViewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-4"
                >
                  {paginatedSenders.map((sender) => (
                    <div
                      key={sender.id}
                      className="premium-card bg-white border-slate-200/60 p-6 group hover:shadow-2xl hover:shadow-blue-500/8 transition-all duration-500"
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500 ${sender.type === "gmail"
                              ? "bg-rose-50 text-rose-600 shadow-rose-200/40"
                              : sender.provider === "outlook"
                                ? "bg-blue-50 text-blue-600 shadow-blue-200/40"
                                : "bg-violet-50 text-violet-600 shadow-violet-200/40"
                              }`}
                          >
                            {sender.type === "gmail" ? (
                              <Gmail className="w-7 h-7" />
                            ) : sender.type === "outlook" ? (
                              <MicrosoftOutlook className="w-7 h-7" />
                            ) : (
                              <Server className="w-7 h-7" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-extrabold text-slate-800 tracking-tighter text-base">
                                {sender.displayName}
                              </h4>
                              {sender.isVerified ? (
                                <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                                  <CheckCircle className="w-2.5 h-2.5" />
                                  Verified
                                </div>
                              ) : (
                                <div className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                                  <AlertCircle className="w-2.5 h-2.5 shadow-amber-500" />
                                  Unverified
                                </div>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-0.5 bg-slate-50 px-2 py-0.5 rounded-md inline-block">
                              {sender.email}
                            </p>
                          </div>
                        </div>


                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                            Type
                          </span>
                          <span className="text-xs font-extrabold text-slate-700 uppercase">
                            {sender.type === "smtp" ? "Direct SMTP" : sender.type}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                            Created
                          </span>
                          <span className="text-xs font-extrabold text-slate-700 tabular-nums">
                            {new Date(sender.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                            Status
                          </span>
                          <span
                            className={`text-xs font-extrabold ${sender.isVerified ? "text-emerald-600" : "text-amber-600"}`}
                          >
                            {sender.isVerified ? "Active" : "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-6 border-t border-slate-100/60">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              /* Edit */
                            }}
                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-90"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSender(sender)}
                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                              Health
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{
                                    width: sender.isVerified ? "100%" : "20%",
                                  }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-extrabold text-slate-800">
                                {sender.isVerified ? "100%" : "20%"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="premium-card bg-white border-slate-200/60 overflow-hidden mb-4"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="py-4 px-6 bg-slate-50 border-b border-slate-100">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Sender
                            </span>
                          </th>
                          <th className="py-4 px-6 bg-slate-50 border-b border-slate-100">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Type
                            </span>
                          </th>
                          <th className="py-4 px-6 bg-slate-50 border-b border-slate-100">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Status
                            </span>
                          </th>
                          <th className="py-4 px-6 bg-slate-50 border-b border-slate-100">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Created
                            </span>
                          </th>
                          <th className="py-4 px-6 bg-slate-50 border-b border-slate-100 text-right">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Actions
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSenders.map((sender) => (
                          <tr key={sender.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-none">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${sender.type === "gmail"
                                    ? "bg-rose-50 text-rose-600 shadow-rose-200/40"
                                    : sender.provider === "outlook"
                                      ? "bg-blue-50 text-blue-600 shadow-blue-200/40"
                                      : "bg-violet-50 text-violet-600 shadow-violet-200/40"
                                    }`}
                                >
                                  {sender.type === "gmail" ? (
                                    <Gmail className="w-5 h-5" />
                                  ) : sender.type === "outlook" ? (
                                    <MicrosoftOutlook className="w-5 h-5" />
                                  ) : (
                                    <Server className="w-5 h-5" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-slate-800 tracking-tight text-sm">
                                    {sender.displayName}
                                  </h4>
                                  <p className="text-[11px] font-bold text-slate-500">
                                    {sender.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-[11px] font-extrabold text-slate-600 uppercase">
                                {sender.type === "smtp" ? "Direct SMTP" : sender.type}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {sender.isVerified ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200/50 rounded-lg text-[10px] font-extrabold uppercase tracking-widest">
                                  <CheckCircle className="w-3 h-3" />
                                  Active
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200/50 rounded-lg text-[10px] font-extrabold uppercase tracking-widest">
                                  <AlertCircle className="w-3 h-3" />
                                  Pending
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-[11px] font-extrabold text-slate-600 tabular-nums">
                                {new Date(sender.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {/* Edit */ }}
                                  className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSender(sender)}
                                  className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 shadow-sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {totalSenders > 0 && (
          <div className="mt-2 p-4 bg-white/50 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-sm">
            <Pagination
              currentPage={senderPage}
              hasNextPage={hasNextSenderPage}
              hasPreviousPage={hasPrevSenderPage}
              isLoadingMessages={isLoadingSenders}
              onNextPage={() => setSenderPage((p) => p + 1)}
              onPrevPage={() => setSenderPage((p) => p - 1)}
              totalMessages={totalSenders}
              startMessageCount={(senderPage - 1) * SENDER_PAGE_SIZE + 1}
              endMessageCount={Math.min(senderPage * SENDER_PAGE_SIZE, totalSenders)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceTabs;
