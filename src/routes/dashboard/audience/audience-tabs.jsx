import {
  AlertCircle,
  CheckCircle,
  Download,
  Edit2,
  Eye,
  FileSpreadsheet,
  Filter,
  Mail,
  Plus,
  Search,
  Server,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import React from "react";
import Button from "../../../components/ui/button";

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
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "contacts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Contact Lists
          </button>
          <button
            onClick={() => setActiveTab("senders")}
            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "senders"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Email Senders
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "contacts" ? (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contact lists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Contact Lists */}
            {isLoadingBatches ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading contact lists...
                </span>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-12">
                <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No contact lists found
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload your first contact list to get started
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Contact List
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <FileSpreadsheet className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <h4 className="font-medium text-gray-900 truncate">
                            {batch.originalFilename}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${
                              batch.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : batch.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : batch.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {batch.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openBatchDetails(batch)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="p-1 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-green-700">
                        <span>Valid</span>
                        <span className="font-medium">
                          {batch.verification?.valid ?? 0}
                        </span>
                      </div>

                      <div className="flex justify-between text-yellow-700">
                        <span>Risky</span>
                        <span className="font-medium">
                          {batch.verification?.risky ?? 0}
                        </span>
                      </div>

                      <div className="flex justify-between text-red-700">
                        <span>Invalid</span>
                        <span className="font-medium">
                          {batch.verification?.invalid ?? 0}
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-500">
                        <span>Unverified</span>
                        <span className="font-medium">
                          {batch.verification?.unverified ?? 0}
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600 pt-1">
                        <span>Uploaded</span>
                        <span>
                          {new Date(batch.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>File Type</span>
                        <span className="uppercase">{batch.fileType}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between">
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => openBatchDetails(batch)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => {
                            /* Export functionality */
                          }}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Senders List */}
            {isLoadingSenders ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading senders...</span>
              </div>
            ) : senders.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No senders configured
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your first sender to start sending emails
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowSenderModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sender
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {senders.map((sender) => (
                  <div
                    key={sender.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                            sender.provider === "gmail"
                              ? "bg-red-100"
                              : sender.provider === "outlook"
                                ? "bg-blue-100"
                                : "bg-purple-100"
                          }`}
                        >
                          {sender.provider === "gmail" ? (
                            <Mail className="w-5 h-5 text-red-600" />
                          ) : sender.provider === "outlook" ? (
                            <AtSign className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Server className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {sender.displayName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {sender.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {sender.isVerified ? (
                          <CheckCircle
                            className="w-5 h-5 text-green-600"
                            title="Verified"
                          />
                        ) : (
                          <AlertCircle
                            className="w-5 h-5 text-yellow-600"
                            title="Not Verified"
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Provider:</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            sender.provider === "gmail"
                              ? "bg-red-100 text-red-800"
                              : sender.provider === "outlook"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {sender.provider === "smtp"
                            ? "SMTP"
                            : sender.provider}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            sender.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {sender.isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span>
                          {new Date(sender.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleTestSender(sender.id)}
                      >
                        Test Connection
                      </Button>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => {
                            /* Edit functionality */
                          }}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleDeleteSender(sender)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceTabs;
