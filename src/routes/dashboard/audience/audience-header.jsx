import React from "react";
import Button from "../../../components/ui/button";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Plus,
  Upload,
  Users,
  XCircle,
} from "lucide-react";

const AudienceHeader = ({
  activeTab,
  setShowUploadModal,
  setShowSenderModal,
  totalContacts,
  verified,
  invalid,
  risky,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audience</h1>
          <p className="text-gray-600 mt-2">
            Manage your contact lists and email senders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === "contacts" ? (
            <Button variant="primary" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Contacts
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setShowSenderModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Sender
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Total Emails */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Emails</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalContacts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Verified Emails */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valid</p>
              <p className="text-2xl font-bold text-gray-900">
                {verified.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Invalid Emails */}
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Invalid</p>
              <p className="text-2xl font-bold text-gray-900">
                {invalid.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Risky</p>
              <p className="text-2xl font-bold text-gray-900">
                {risky.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceHeader;
