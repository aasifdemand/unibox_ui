import { ChevronRight, Clock, Mail } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center animate-in fade-in duration-700 slide-in-from-bottom-4">
        <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-4xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">
          No mailboxes <span className="text-gradient">linked yet</span>
        </h3>
        <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
          Connect your organization's email accounts to centralize your outreach
          and management.
        </p>
        <Link
          to="/dashboard/audience"
          className="btn-primary flex items-center shadow-blue-500/30"
        >
          <Mail className="w-4 h-4 mr-2" />
          Link Your First Account
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mailboxes?.map((mailbox) => (
          <button
            key={mailbox.id}
            onClick={() => onSelect(mailbox)}
            className="premium-card p-6 text-left group flex flex-col h-full bg-white relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>

            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  {getProviderIcon(mailbox.type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-30">
                    {mailbox.displayName}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {mailbox.type}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-lg border shadow-xs ${
                  mailbox.isVerified
                    ? "bg-green-50 text-green-600 border-green-100"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}
              >
                {mailbox.isVerified ? "Direct" : "Pending"}
              </span>
            </div>

            <div className="mb-6 flex-1">
              <p className="text-sm font-medium text-slate-500 truncate mb-4">
                {mailbox.email}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Today's Volume
                  </p>
                  <p className="text-lg font-extrabold text-slate-800">
                    {mailbox.stats?.dailySent || 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <p
                    className={`text-sm font-bold ${mailbox.isVerified ? "text-green-600" : "text-amber-500"}`}
                  >
                    {mailbox.isVerified ? "Active" : "Warning"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock className="w-3 h-3 mr-1.5" />
                {mailbox.lastSyncAt ? timeAgo(mailbox.lastSyncAt) : "Idle"}
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
              </div>
            </div>

            {mailbox.expiresAt && (
              <div className="bg-amber-500/5 px-6 py-2 -mx-6 -mb-6 mt-4 border-t border-amber-500/10">
                <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest text-center">
                  Account Expires{" "}
                  {format(new Date(mailbox.expiresAt), "MMM d, yyyy")}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MailboxList;
