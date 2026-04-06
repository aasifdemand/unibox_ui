import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Send, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

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

const RecentCampaignsTable = ({ recentCampaigns = [] }) => {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState([]);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('dashboard.table.campaign')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const campaign = row.original;
          return (
            <div className="flex items-center gap-4 transition-transform duration-300 group-hover/row:translate-x-0.5">
              {/* Circular Progress */}
              <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      campaign.progress === 100
                        ? 'text-purple-500'
                        : campaign.status === 'paused'
                          ? 'text-slate-400'
                          : 'text-purple-400'
                    }
                    strokeDasharray={`${campaign.progress}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full m-1 shadow-inner">
                  <span className="text-[9px] font-black text-slate-600">
                    {campaign.status === 'paused' ? '||' : `${Math.round(campaign.progress)}%`}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 mb-0.5 group-hover/row:text-purple-600 transition-colors">
                  {campaign.name}
                </p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {campaign.status}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'statusLabel',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('dashboard.table.status')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const campaign = row.original;
          return (
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${campaign.statusColor} border border-white/50 shadow-xs transition-all group-hover/row:scale-105 group-hover/row:shadow-md`}
            >
              <span className="me-2 opacity-70 scale-90">{campaign.statusIcon}</span>
              {campaign.statusLabel}
            </span>
          );
        },
      },
      {
        accessorKey: 'recipients',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('dashboard.table.reach')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight group-hover/row:text-purple-600 transition-colors">
              {row.original.recipients}
            </span>
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
              {t('dashboard.table.recipients')}
            </span>
          </div>
        ),
      },
      {
        id: 'engagement',
        header: () => (
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
            {t('dashboard.table.engagement')}
          </span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-sm font-black text-purple-600 tracking-tight">
                {row.original.openRate}
              </span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                {t('dashboard.table.open')}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-purple-600 tracking-tight">
                {row.original.clickRate}
              </span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                {t('dashboard.table.click')}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-purple-600 tracking-tight">
                {row.original.bounceRate}
              </span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
                Bounce
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'sentDate',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('dashboard.table.launch_date')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight group-hover/row:text-slate-900 transition-colors">
              {row.original.sentDate}
            </span>
            <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">
              {t('dashboard.table.launched')}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('dashboard.table.actions')}
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <Link
              to={`/dashboard/campaigns/${row.original.id}`}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-purple-600 hover:bg-white rounded-md transition-all shadow-xs hover:shadow-purple-500/10 border border-transparent hover:border-purple-100"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ),
      },
    ],
    [t],
  );

  const table = useReactTable({
    data: recentCampaigns,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (recentCampaigns.length === 0) {
    return (
      <div className="py-24 text-center bg-white/40 ">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
          <Send className="w-10 h-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {t('dashboard.empty.no_campaigns')}
        </h3>
        <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">
          {t('dashboard.empty.description')}
        </p>
       
      </div>
    );
  }

  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full text-start border-collapse  border-spacing-0">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-slate-50/80 ">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-8 py-5 border-b border-slate-200/60 transition-colors"
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
                <td key={cell.id} className="px-8 py-4 border-b border-slate-50/50">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentCampaignsTable;
