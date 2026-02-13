// ============================================================================
// MAILBOX LIST COMPONENT
// ============================================================================

import { Clock, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const MailboxList = ({
  mailboxes,
  onSelect,
  getProviderIcon,
  timeAgo,
  format,
}) => {
  if (mailboxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 md:py-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No mailboxes connected
        </h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          Connect your Gmail or Outlook account to start managing emails
        </p>
        <Link
          to="/dashboard/audience"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          Connect Mailbox
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mailboxes?.map((mailbox) => (
          <button
            key={mailbox.id}
            onClick={() => onSelect(mailbox)}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center mr-4 group-hover:scale-110 transition">
                  {getProviderIcon(mailbox.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {mailbox.displayName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{mailbox.email}</p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  mailbox.isVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {mailbox.isVerified ? "Verified" : "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Daily Sent</p>
                <p className="font-medium text-gray-900">
                  {mailbox.stats?.dailySent || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last Sync</p>
                <p className="font-medium text-gray-900">
                  {mailbox.lastSyncAt ? timeAgo(mailbox.lastSyncAt) : "Never"}
                </p>
              </div>
            </div>

            {mailbox.expiresAt && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                Expires: {format(new Date(mailbox.expiresAt), "MMM d, yyyy")}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MailboxList;
