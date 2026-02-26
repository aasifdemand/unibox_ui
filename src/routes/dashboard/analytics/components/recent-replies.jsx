import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Download, Loader2, MessageCircle, Eye } from 'lucide-react';

const RecentReplies = ({ replies, isLoading }) => {
  const { t } = useTranslation();
  const handleExport = () => {
    if (!replies || !replies.length) return;

    const headers = ['From', 'RecipientEmail', 'Subject', 'CampaignName', 'ReceivedAt'];
    const rows = replies.map((reply) => [
      reply.from || '',
      reply.recipientEmail || '',
      reply.subject || '',
      reply.campaignName || '',
      reply.receivedAt ? new Date(reply.receivedAt).toISOString() : '',
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
    a.download = `recent-replies-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="premium-card overflow-hidden">
      <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {t('analytics.recent_replies_title')} <span className="text-violet-500">{t('analytics.replies_span')}</span>
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {t('analytics.replies_subtitle')}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn-secondary py-2 px-4 shadow-xs flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">{t('common.export')}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {t('analytics.loading_replies')}
          </p>
        </div>
      ) : replies?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-4 px-8 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {t('analytics.table_from')}
                </th>
                <th className="py-4 px-8 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {t('analytics.table_subject')}
                </th>
                <th className="py-4 px-8 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {t('analytics.table_campaign')}
                </th>
                <th className="py-4 px-8 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {t('analytics.table_date_time')}
                </th>
                <th className="py-4 px-8 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-end">
                  {t('analytics.table_actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {replies.map((reply) => (
                <tr key={reply.id} className="group hover:bg-violet-50/30 transition-colors">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-extrabold text-xs shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">
                        {reply.from?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors whitespace-nowrap">
                          {reply.from}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                          {reply.recipientEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <p className="text-sm font-bold text-slate-700 max-w-xs truncate group-hover:text-slate-800 transition-colors">
                      {reply.subject}
                    </p>
                  </td>
                  <td className="py-5 px-8">
                    {reply.campaignName ? (
                      <Link
                        to={`/dashboard/campaigns/${reply.campaignId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-blue-100/50 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        {reply.campaignName}
                      </Link>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-5 px-8">
                    <p className="text-sm font-extrabold text-slate-700 tabular-nums">
                      {new Date(reply.receivedAt).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {new Date(reply.receivedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="py-5 px-8 text-end">
                    <Link
                      to={`/dashboard/campaigns/${reply.campaignId}`}
                      className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all inline-block"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            <MessageCircle className="w-8 h-8 text-slate-300" />
          </div>
          <h4 className="text-xl font-extrabold text-slate-800 mb-2">{t('analytics.no_replies_yet')}</h4>
          <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            {t('analytics.no_replies_description')}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentReplies;
