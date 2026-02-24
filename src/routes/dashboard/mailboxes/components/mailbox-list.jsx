import { ChevronRight, Clock, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const MailboxList = ({
  mailboxes,
  onSelect,
  getProviderIcon,
  timeAgo,
  format,
  viewMode = "grid",
  selectedSenderIds = [],
  onCheckSender,
  onCheckAllSenders,
}) => {
  const isSelected = (id) => selectedSenderIds.some((item) => item.id === id);
  const allSelected =
    mailboxes.length > 0 && selectedSenderIds.length === mailboxes.length;
  const isSomeSelected =
    selectedSenderIds.length > 0 &&
    selectedSenderIds.length < mailboxes.length;

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

      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 w-10 text-center">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeSelected;
                        }}
                        onChange={(e) => onCheckAllSenders(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Mailbox
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Email
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Volume
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Last Sync
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mailboxes.map((mailbox) => (
                  <tr
                    key={mailbox.id}
                    className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${isSelected(mailbox.id) ? "bg-blue-50/30" : ""}`}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected(mailbox.id)}
                          onChange={(e) =>
                            onCheckSender(mailbox.id, mailbox.type, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={() => onSelect(mailbox)}>
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCheckSender(
                              mailbox.id,
                              mailbox.type,
                              !isSelected(mailbox.id),
                            );
                          }}
                        >
                          {getProviderIcon(mailbox.type)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {mailbox.displayName}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                            {mailbox.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-600">
                        {mailbox.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] uppercase tracking-widest font-extrabold px-2 py-1 rounded-lg border shadow-xs inline-block ${mailbox.isVerified
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                      >
                        {mailbox.isVerified ? "Active" : "Warning"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-slate-800">
                          {mailbox.stats?.dailySent || 0}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Today
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {mailbox.lastSyncAt
                          ? timeAgo(mailbox.lastSyncAt)
                          : "Idle"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex w-8 h-8 rounded-full bg-slate-50 items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mailboxes?.map((mailbox) => (
          <div
            key={mailbox.id}
            className={`premium-card p-6 text-left group flex flex-col h-full bg-white relative overflow-hidden transition-all ${isSelected(mailbox.id) ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/10" : "hover:shadow-xl"}`}
          >
            {/* Improved Checkbox Positioning (Top Right) */}
            <div className="absolute right-4 top-4 z-20">
              <input
                type="checkbox"
                checked={isSelected(mailbox.id)}
                onChange={(e) =>
                  onCheckSender(mailbox.id, mailbox.type, e.target.checked)
                }
                className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer shadow-sm hover:scale-110"
              />
            </div>

            <button
              onClick={() => onSelect(mailbox)}
              className="w-full text-left flex flex-col h-full"
            >
              {/* Background Glow */}
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>

              <div className="flex items-start mb-6 relative z-10">
                <div
                  className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-inner"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCheckSender(
                      mailbox.id,
                      mailbox.type,
                      !isSelected(mailbox.id),
                    );
                  }}
                >
                  {getProviderIcon(mailbox.type)}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                    {mailbox.displayName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {mailbox.type}
                    </p>
                    <span
                      className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-md border shadow-2xs shrink-0 ${mailbox.isVerified
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                    >
                      {mailbox.isVerified ? "Active" : "Warning"}
                    </span>
                  </div>
                </div>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default MailboxList;
