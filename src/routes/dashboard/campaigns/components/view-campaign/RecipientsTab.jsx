import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, MessageCircle, Eye, Users, Mail, ShieldCheck } from 'lucide-react';

const RecipientsTab = ({
  campaign,
  stats,
  formatDate,
  viewReply,
  setSelectedRecipientForPreview,
}) => {
  const { t } = useTranslation();
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
      <div className="premium-card bg-slate-100/40  border-none p-6 shadow-sm shadow-slate-900/2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{t('campaigns.recipients.title', 'Recipients')}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {t('campaigns.recipients.desc', 'Manage campaign recipients')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end ltr:mr-4 rtl:ml-4">
              <span className="text-xs font-bold text-purple-600 leading-none">
                {t('campaigns.recipients.total_count', { count: stats.totalRecipients })}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 mt-1">
                {t('campaigns.recipients.count_label', 'Recipient Count')}
              </span>
            </div>
            <button
              onClick={handleExportCsv}
              className="h-11 px-6 bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50/30 rounded-lg font-bold text-xs transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t('campaigns.recipients.export_csv', 'Export CSV')}
            </button>
          </div>
        </div>
      </div>

      <div className="premium-card bg-white border-slate-200/60 overflow-hidden shadow-sm shadow-slate-900/2">
        <div className="overflow-x-auto overflow-y-auto max-h-150 custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-5 px-6 text-left">
                  <span className="text-xs font-semibold text-slate-500">
                    {t('campaigns.recipients.info_header', 'Recipient Info')}
                  </span>
                </th>
                <th className="py-5 px-6 text-left">
                  <span className="text-xs font-semibold text-slate-500">
                    {t('campaigns.recipients.status_header', 'Status')}
                  </span>
                </th>
                <th className="py-5 px-6 text-left">
                  <span className="text-xs font-semibold text-slate-500">
                    {t('campaigns.recipients.last_sent_header', 'Last Sent')}
                  </span>
                </th>
                <th className="py-5 px-6 text-left">
                  <span className="text-xs font-semibold text-slate-500">
                    {t('campaigns.recipients.replied_at_header', 'Replied At')}
                  </span>
                </th>
                <th className="py-5 px-6 ltr:text-right rtl:text-left">
                  <span className="text-xs font-semibold text-slate-500">
                    {t('campaigns.recipients.actions_header', 'Actions')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recipients.map((recipient) => (
                <tr key={recipient.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors">
                        {recipient.email}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {recipient.name || t('campaigns.common.na', 'N/A')}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <RecipientStatusBadge status={recipient.status} t={t} />
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                      {recipient.lastSentAt ? formatDate(recipient.lastSentAt) : t('campaigns.recipients.status_pending', 'Pending')}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                      {recipient.repliedAt ? formatDate(recipient.repliedAt) : '—'}
                    </span>
                  </td>
                  <td className="py-5 px-6 ltr:text-right rtl:text-left">
                    <div className="flex items-center justify-end gap-2">
                      {recipient.status === 'replied' ? (
                        <button
                          onClick={() => viewReply(recipient.id)}
                          className="h-8 px-4 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md font-bold text-[10px] transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t('campaigns.recipients.view_reply', 'View Reply')}
                        </button>
                      ) : (
                        <div className="h-8 px-4 text-slate-400 font-bold text-[10px] flex items-center">
                          {t('campaigns.recipients.no_reply', 'No Reply')}
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedRecipientForPreview(recipient)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-purple-50 hover:text-purple-600 rounded-md transition-all"
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
              <div className="absolute -bottom-2 -ltr:right-2 rtl:left-2 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100 rotate-12">
                <ShieldCheck className="w-5 h-5 text-purple-200" />
              </div>
            </div>
            <h4 className="text-xl font-bold text-slate-900 tracking-tight">{t('campaigns.recipients.empty_title', 'No Recipients')}</h4>
            <p className="text-xs font-semibold text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
              {t('campaigns.recipients.empty_desc', 'Recipients will appear here once the campaign starts sending.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const RecipientStatusBadge = ({ status, t }) => {
  const configs = {
    replied: {
      bg: 'bg-purple-50 text-purple-700 border-purple-100',
      icon: <MessageCircle className="w-3 h-3" />,
      label: t('campaigns.recipients.status_replied', 'Replied'),
    },
    sent: {
      bg: 'bg-purple-50 text-purple-700 border-purple-100',
      icon: <Mail className="w-3 h-3" />,
      label: t('campaigns.recipients.status_sent', 'Sent'),
    },
    bounced: {
      bg: 'bg-purple-50 text-purple-700 border-purple-100',
      icon: <ShieldCheck className="w-3 h-3" />,
      label: t('campaigns.recipients.status_bounced', 'Bounced'),
    },
    failed: {
      bg: 'bg-red-50 text-red-700 border-red-100',
      icon: <ShieldCheck className="w-3 h-3" />,
      label: t('campaigns.recipients.status_failed', 'Failed'),
    },
    default: {
      bg: 'bg-slate-50 text-slate-500 border-slate-100',
      icon: <Users className="w-3 h-3" />,
      label: t('campaigns.recipients.status_pending', 'Pending'),
    },
  };

  const config = configs[status] || configs.default;

  return (
    <div className={`px-3 py-1.5 rounded-md border ${config.bg} flex items-center gap-2 w-fit`}>
      {config.icon}
      <span className="text-[10px] font-bold capitalize leading-none">
        {config.label}
      </span>
    </div>
  );
};

export default RecipientsTab;
