import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Pause,
  Send,
  Trash2,
  TrendingUp,
  Zap,
  BarChart3,
  Target,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { calculateOpenRate, formatDate, getStatusInfo } from '../../campaign-utils';
import { Link } from 'react-router-dom';

const SortIndicator = ({ column }) => {
  const isSorted = column.getIsSorted();
  if (!isSorted) return (
    <div className="w-4 h-4 flex items-center justify-center rounded-md group-hover/header:bg-slate-100 transition-all ml-1 opacity-0 group-hover/header:opacity-100">
      <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover/header:text-slate-400" />
    </div>
  );
  return (
    <div className="w-4 h-4 flex items-center justify-center rounded-md bg-indigo-50/50 border border-indigo-100/50 ml-1">
      {isSorted === 'desc'
        ? <ChevronDown className="w-2.5 h-2.5 text-indigo-600" />
        : <ChevronUp className="w-2.5 h-2.5 text-indigo-600" />
      }
    </div>
  );
};

const CampaignListView = ({
  campaigns,
  selectedCampaigns,
  handleSelectAll,
  handleSelectCampaign,
  isAnyLoading,
  handleActivateCampaign,
  handlePauseCampaign,
  handleViewCampaign,
  handleDeleteClick,
  isLoadingAction,
}) => {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState([]);

  const columns = React.useMemo(() => [
    {
      id: 'selection',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => {
            handleSelectAll(e.target.checked);
            table.toggleAllPageRowsSelected(!!e.target.checked);
          }}
          className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 cursor-pointer shadow-xs"
          disabled={isAnyLoading}
        />
      ),
      cell: ({ row }) => (
        <div className={`transition-opacity duration-300 ${row.getIsSelected() || selectedCampaigns.length > 0 ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100 focus-within:opacity-100'}`}>
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              handleSelectCampaign(row.original.id);
              row.toggleSelected(!!e.target.checked);
            }}
            className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 cursor-pointer shadow-xs transition-all"
            disabled={isAnyLoading}
          />
        </div>
      ),
    },
    {
      accessorKey: 'name',
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
        const campaign = row.original;
        return (
          <div className="flex items-center transition-transform duration-300 group-hover/row:translate-x-0.5">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center ltr:mr-4 rtl:ml-4 shadow-lg shadow-indigo-500/10 group-hover/row:scale-110 transition-transform duration-500">
              <Send className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1.5 group-hover/row:text-indigo-600 transition-colors">
                {campaign.name}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 max-w-50">
                {campaign.subject || t('campaigns.no_subject')}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center group/header"
        >
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
            {t('mailboxes.status')}
          </span>
          <SortIndicator column={column} />
        </button>
      ),
      cell: ({ row }) => {
        const { label, color, icon } = getStatusInfo(row.original.status);
        return (
          <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 border w-fit ${color.replace('bg-', 'text-').replace('-100', '-600').replace('-50', '-100')}`}>
            {icon}
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: 'totalRecipients',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center group/header"
        >
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
            {t('analytics.recipients')}
          </span>
          <SortIndicator column={column} />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <Target className="w-3 h-3 text-slate-400" />
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {row.original.totalRecipients?.toLocaleString() || '0'}
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {t('analytics.recipients')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'openRate',
      header: ({ column }) => (
        <div className="flex justify-end">
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('analytics.open_rate')}
            </span>
            <SortIndicator column={column} />
          </button>
        </div>
      ),
      cell: ({ row }) => {
        const openRate = calculateOpenRate(row.original);
        return (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-indigo-600 tabular-nums">
                {openRate}
              </span>
              {openRate !== '-' && parseFloat(openRate) > 30 && (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-inter">
              {t('analytics.stats')}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <div className="flex justify-end">
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('common.date')}
            </span>
            <SortIndicator column={column} />
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-slate-900 tracking-tight">
            {formatDate(row.original.createdAt)}
          </span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {t('campaigns.status_created')}
          </span>
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
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <div className="flex items-center justify-end gap-1.5 transition-transform duration-300 group-hover/row:-translate-x-0.5">
            {campaign.status === 'draft' && (
              <button
                onClick={() => handleActivateCampaign(campaign.id)}
                disabled={isLoadingAction.activate}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-xs hover:shadow-emerald-100"
              >
                <Send className="w-4 h-4" />
              </button>
            )}

            {campaign.status === 'running' && (
              <button
                onClick={() => handlePauseCampaign(campaign.id)}
                disabled={isLoadingAction.pause}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all shadow-xs hover:shadow-amber-100"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => handleViewCampaign(campaign.id)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-xs hover:shadow-indigo-100"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDeleteClick(campaign)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-xs hover:shadow-rose-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }
  ], [t, isAnyLoading, isLoadingAction, selectedCampaigns, handleSelectAll, handleSelectCampaign, handleActivateCampaign, handlePauseCampaign, handleViewCampaign, handleDeleteClick]);

  const table = useReactTable({
    data: campaigns,
    columns,
    state: {
      sorting,
      rowSelection: Object.fromEntries(selectedCampaigns.map(id => [campaigns.findIndex(c => c.id === id), true])),
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  if (campaigns.length === 0) {
    return (
      <div className="premium-card bg-white border-none p-20 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl shadow-indigo-900/2">
        <div className="absolute top-0 ltr:left-1/2 ltr:right-1/2 rtl:left-1/2 -translate-x-1/2 w-125 h-75 bg-indigo-500/5 rounded-full blur-[100px] -mt-40"></div>
        <div className="relative mb-10">
          <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-700 rounded-[28px] flex items-center justify-center rotate-3 shadow-2xl shadow-indigo-500/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-800 tracking-tighter mb-4">
          {t('campaigns.empty_log_title')}
        </h3>
        <p className="text-sm font-medium text-slate-400 max-w-sm mb-10 leading-relaxed uppercase tracking-widest text-[10px]">
          {t('campaigns.empty_log_subtitle')}
        </p>
        <Link
          to={'/dashboard/campaigns/create'}
          className="btn-primary py-3 px-8 text-white font-extrabold uppercase tracking-widest text-[10px]"
        >
          {t('campaigns.launch_protocol')}
        </Link>
      </div>
    );
  }

  return (
    <div className="premium-card border border-slate-200/60 bg-white p-2 shadow-xl shadow-slate-900/5 overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-slate-50/80 backdrop-blur-md">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="py-5 px-6 border-b border-slate-200/60 transition-colors first:ltr:rounded-tl-2xl last:ltr:rounded-tr-2xl"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-50">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`group/row hover:bg-slate-50/50 transition-all duration-300 cursor-default ${row.getIsSelected() ? 'bg-indigo-50/30' : ''}`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="py-4 px-6 border-b border-slate-50/50">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignListView;
