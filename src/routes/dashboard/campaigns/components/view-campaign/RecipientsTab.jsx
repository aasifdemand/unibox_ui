import React from 'react';
import { Download, MessageCircle, Eye, Users, Mail, ShieldCheck } from 'lucide-react';

const RecipientsTab = ({
  campaign,
  stats,
  formatDate,
  viewReply,
  setSelectedRecipientForPreview,
}) => {
  const recipients = campaign.CampaignRecipients || [];

  const handleExportCsv = () => {
    if (!recipients.length) return;

    const headers = ['Email', 'Name', 'Status', 'LastSentAt', 'RepliedAt'];
    const rows = recipients.map((recipient) => [
      recipient.email || '',
      recipient.name || '',
      recipient.status || '',
      recipient.lastSentAt ? formatDate(recipient.lastSentAt) : '',
      recipient.repliedAt ? formatDate(recipient.repliedAt) : '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => (typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value))
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${campaign.id}-recipients.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="premium-card bg-slate-100/40 backdrop-blur-xl border-none p-6 shadow-2xl shadow-slate-900/2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Recipients</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Manage campaign recipients
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end ltr:mr-4 rtl:ml-4">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                {stats.totalRecipients} Total
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                RECIPIENT COUNT
              </span>
            </div>
            <button
              onClick={handleExportCsv}
              className="h-11 px-6 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="premium-card bg-white border-slate-200/60 overflow-hidden shadow-2xl shadow-slate-900/2">
        <div className="overflow-x-auto overflow-y-auto max-h-150 custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-5 px-6 ltr:text-left ltr:text-right rtl:text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Recipient Info
                  </span>
                </th>
                <th className="py-5 px-6 ltr:text-left ltr:text-right rtl:text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status
                  </span>
                </th>
                <th className="py-5 px-6 ltr:text-left ltr:text-right rtl:text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Last Sent
                  </span>
                </th>
                <th className="py-5 px-6 ltr:text-left ltr:text-right rtl:text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Replied At
                  </span>
                </th>
                <th className="py-5 px-6 ltr:text-right rtl:text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recipients.map((recipient) => (
                <tr key={recipient.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {recipient.email}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {recipient.name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <RecipientStatusBadge status={recipient.status} />
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-[11px] font-black text-slate-500 tabular-nums uppercase">
                      {recipient.lastSentAt ? formatDate(recipient.lastSentAt) : 'Pending'}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-[11px] font-black text-slate-500 tabular-nums uppercase">
                      {recipient.repliedAt ? formatDate(recipient.repliedAt) : '—'}
                    </span>
                  </td>
                  <td className="py-5 px-6 ltr:text-right rtl:text-left">
                    <div className="flex items-center justify-end gap-2">
                      {recipient.status === 'replied' ? (
                        <button
                          onClick={() => viewReply(recipient.id)}
                          className="h-8 px-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Reply
                        </button>
                      ) : (
                        <div className="h-8 px-4 text-slate-300 font-black uppercase tracking-widest text-[9px] flex items-center">
                          No Reply
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedRecipientForPreview(recipient)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recipients.length === 0 && (
          <div className="text-center py-24">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center rotate-3 border border-slate-100">
                <Users className="w-10 h-10 text-slate-200" />
              </div>
              <div className="absolute -bottom-2 -ltr:right-2 rtl:left-2 w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 rotate-12">
                <ShieldCheck className="w-5 h-5 text-indigo-200" />
              </div>
            </div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight">No Recipients</h4>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">
              Recipients will appear here once the campaign starts sending.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const RecipientStatusBadge = ({ status }) => {
  const configs = {
    replied: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: <MessageCircle className="w-3 h-3" />,
      label: 'Replied',
    },
    sent: {
      bg: 'bg-blue-50 text-blue-700 border-blue-100',
      icon: <Mail className="w-3 h-3" />,
      label: 'Sent',
    },
    bounced: {
      bg: 'bg-rose-50 text-rose-700 border-rose-100',
      icon: <ShieldCheck className="w-3 h-3" />,
      label: 'Bounced',
    },
    default: {
      bg: 'bg-slate-50 text-slate-500 border-slate-100',
      icon: <Users className="w-3 h-3" />,
      label: 'Pending',
    },
  };

  const config = configs[status] || configs.default;

  return (
    <div className={`px-3 py-1.5 rounded-xl border ${config.bg} flex items-center gap-2 w-fit`}>
      {config.icon}
      <span className="text-[9px] font-black uppercase tracking-widest leading-none">
        {config.label}
      </span>
    </div>
  );
};

export default RecipientsTab;
