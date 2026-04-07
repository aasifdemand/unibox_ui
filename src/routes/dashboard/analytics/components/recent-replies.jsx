import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Download,
  Loader2,
  MessageCircle,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';

import { useCurrentUser } from '../../../../hooks/useAuth';
import { formatInTimezone } from '../../../../utils/date-utils';

import { DateTime } from 'luxon';

const SortIndicator = ({ column }) => {
  const isSorted = column.getIsSorted();
  if (!isSorted)
    return (
      <div className="w-4 h-4 flex items-center justify-center rounded-md group-hover/header:bg-slate-100 transition-all ml-1 opacity-0 group-hover/header:opacity-100">
        <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover/header:text-slate-400" />
      </div>
    );
  return (
    <div className="w-4 h-4 flex items-center justify-center rounded-md bg-purple-50/50 border border-purple-100/50 ml-1">
      {isSorted === 'desc' ? (
        <ChevronDown className="w-2.5 h-2.5 text-purple-600" />
      ) : (
        <ChevronUp className="w-2.5 h-2.5 text-purple-600" />
      )}
    </div>
  );
};

const RecentReplies = ({ replies = [], isLoading }) => {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState([]);
  const { data: user } = useCurrentUser();
  const userTz = user?.timezone || 'UTC';

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'from',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('analytics.table_from')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const reply = row.original;
          return (
            <div className="flex items-center gap-4 transition-transform duration-300 group-hover/row:translate-x-0.5">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm shadow-purple-500/20 group-hover/row:rotate-6 transition-all">
                {reply.from?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 group-hover/row:text-purple-600 transition-colors whitespace-nowrap">
                  {reply.from}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {reply.recipientEmail}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'subject',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('analytics.table_subject')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <p className="text-sm font-bold text-slate-700 max-w-xs truncate group-hover/row:text-slate-900 transition-colors">
            {row.original.subject}
          </p>
        ),
      },
      {
        accessorKey: 'campaignName',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('analytics.table_campaign')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const reply = row.original;
          return reply.campaignName ? (
            <Link
              to={`/dashboard/campaigns/${reply.campaignId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-purple-100/50 hover:bg-purple-600 hover:text-white transition-all shadow-xs"
            >
              {reply.campaignName}
            </Link>
          ) : (
            <span className="text-slate-300">—</span>
          );
        },
      },
      {
        accessorKey: 'receivedAt',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('analytics.table_date_time')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <p className="text-sm font-bold text-slate-900 tabular-nums">
              {formatInTimezone(row.original.receivedAt, userTz, { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {formatInTimezone(row.original.receivedAt, userTz, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('analytics.table_actions')}
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <Link
              to={`/dashboard/campaigns/${row.original.campaignId}`}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all shadow-xs hover:shadow-purple-100"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </div>
        ),
      },
    ],
    [t, userTz],
  );

  const table = useReactTable({
    data: replies,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleExport = () => {
    if (!replies || !replies.length) return;

    const headers = ['From', 'RecipientEmail', 'Subject', 'CampaignName', 'ReceivedAt'];
    const rows = replies.map((reply) => [
      reply.from || '',
      reply.recipientEmail || '',
      reply.subject || '',
      reply.campaignName || '',
      reply.receivedAt 
        ? DateTime.fromISO(new Date(reply.receivedAt).toISOString()).setZone(userTz).toFormat('yyyy-MM-dd HH:mm:ss')
        : '',
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
    a.download = `recent-replies-${DateTime.now().setZone(userTz).toFormat('yyyy-MM-dd')}.csv`;
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
            {t('analytics.recent_replies_title')}{' '}
            <span className="text-purple-500">{t('analytics.replies_span')}</span>
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
          <span className="text-[10px] font-extrabold uppercase tracking-widest">
            {t('common.export')}
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {t('analytics.loading_replies')}
          </p>
        </div>
      ) : replies?.length > 0 ? (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-start border-collapse border-spacing-0">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-slate-50/80 ">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="py-5 px-8 border-b border-slate-200/60 transition-colors"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="group/row hover:bg-purple-50/30 transition-all duration-300 cursor-default"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-4 px-8 border-b border-slate-50/50">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            <MessageCircle className="w-8 h-8 text-slate-300" />
          </div>
          <h4 className="text-xl font-extrabold text-slate-800 mb-2">
            {t('analytics.no_replies_yet')}
          </h4>
          <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            {t('analytics.no_replies_description')}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentReplies;
