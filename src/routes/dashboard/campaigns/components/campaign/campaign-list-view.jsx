/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Send,
  Trash2,
  Zap,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Mail,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Play,
  Pause,
  Edit2,
} from 'lucide-react';
import {
  calculateOpenRate,
  calculateReplyRate,
  calculateProgress,
  calculateBounceRate,
  calculateUnsubscribeRate,
  formatDate,
  formatDateTime,
} from '../../campaign-utils';


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

const CampaignListView = ({
  campaigns,
  selectedCampaigns,
  handleSelectAll,
  handleSelectCampaign,
  isAnyLoading,
  handleActivateCampaign,
  handlePauseCampaign,
  handleResumeCampaign,
  handleEditCampaign,
  handleViewCampaign,
  handleDeleteClick,
  isLoadingAction,
  userTz,
}) => {
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
              {t('campaigns.sequence_details')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const campaign = row.original;
          const progress = calculateProgress(campaign);
          return (
            <div className="flex items-center gap-4">
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
                      progress === 100
                        ? 'text-purple-500 text-opacity-100'
                        : campaign.status === 'paused'
                          ? 'text-slate-400'
                          : 'text-purple-400 text-opacity-80'
                    }
                    strokeDasharray={`${progress}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full m-1">
                  <span className="text-[10px] font-bold text-slate-600">
                    {campaign.status === 'paused' ? '(II)' : `${progress}%`}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-slate-800 hover:text-purple-600 cursor-pointer transition-colors max-w-[200px] truncate">
                    {campaign.name}
                  </p>
                  <a
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="text-slate-400 hover:text-purple-600"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <span className="capitalize">{campaign.status}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>
                    {campaign.startedAt
                      ? `Started at: ${formatDateTime(campaign.startedAt, userTz)}`
                      : campaign.scheduledAt
                        ? `Scheduled at: ${formatDateTime(campaign.scheduledAt, userTz)}`
                        : formatDateTime(campaign.createdAt, userTz) || formatDate(campaign.createdAt, userTz)}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'report',
        header: () => (
          <div className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none text-left">
            Report
          </div>
        ),
        cell: ({ row }) => {
          const campaign = row.original;
          const sent = campaign.totalSent || 0;
          const opened = campaign.totalOpens || 0;
          const openRate = calculateOpenRate(campaign);
          const replied = campaign.totalReplied || 0;
          const replyRate = calculateReplyRate(campaign);

          const bounced = campaign.totalBounced || 0;
          const senderBounced = campaign.totalSenderBounced || 0;

          return (
            <div className="flex items-center gap-6 text-[12px] whitespace-nowrap overflow-x-auto min-w-max pb-3 pt-3">
              <div className="flex flex-col w-24">
                <span className="font-bold text-purple-600 text-base mb-1">{sent}</span>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-purple-600" /> Sent
                </span>
              </div>
              <div className="flex flex-col w-28">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-bold text-fuchsia-600 text-base">{opened}</span>
                  <span className="text-[10px] font-semibold text-fuchsia-600/50">
                    {openRate !== '-' ? openRate : ''}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-fuchsia-600" /> Opened
                </span>
              </div>
              <div className="flex flex-col w-32">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-bold text-purple-500 text-base">{replied}</span>
                  <span className="text-[10px] font-semibold text-purple-500/50">
                    {replyRate !== '-' ? replyRate : ''}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" /> Replied
                </span>
              </div>
              <div className="flex flex-col w-24">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-bold text-purple-500 text-base">{bounced}</span>
                  <span className="text-[10px] font-semibold text-purple-500/50">
                    {calculateBounceRate(campaign) !== '-'
                      ? `(${calculateBounceRate(campaign)})`
                      : ''}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-purple-500" /> Bounced
                </span>
              </div>
              <div className="flex flex-col w-32">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-bold text-red-500 text-base">{senderBounced}</span>
                  {/* Reusing bounce rate for sender bounce rate display to show it correctly relative to total sent */}
                  <span className="text-[10px] font-semibold text-red-500/50">
                    {campaign.totalSent
                      ? `(${Math.round((senderBounced / campaign.totalSent) * 100)}%)`
                      : ''}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Sender Bounced
                </span>
              </div>
              <div className="flex flex-col w-32">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-bold text-slate-500 text-base">
                    {campaign.totalUnsubscribed || 0}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500/50">
                    {calculateUnsubscribeRate(campaign) !== '-'
                      ? `(${calculateUnsubscribeRate(campaign)})`
                      : ''}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> Unsubscribed
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => (
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none"></span>
          </div>
        ),
        cell: ({ row }) => {
          const campaign = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5 transition-transform duration-300">
              {campaign.status === 'draft' || campaign.status === 'paused' ? (
                <button
                  onClick={() =>
                    campaign.status === 'paused'
                      ? handleResumeCampaign(campaign.id)
                      : handleActivateCampaign(campaign.id)
                  }
                  title={campaign.status === 'paused' ? 'Resume Campaign' : 'Start Campaign'}
                  disabled={isLoadingAction.activate || isLoadingAction.resume}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-slate-200 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </button>
              ) : campaign.status === 'running' ? (
                <button
                  onClick={() => handlePauseCampaign(campaign.id)}
                  title="Pause Campaign"
                  disabled={isLoadingAction.pause}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all border border-slate-200 shadow-sm"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : null}
              <button
                onClick={() => handleEditCampaign(campaign)}
                disabled={!['draft', 'paused'].includes(campaign.status)}
                title={
                  !['draft', 'paused'].includes(campaign.status)
                    ? 'Cannot edit while running'
                    : 'Edit Campaign'
                }
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border border-slate-200 shadow-sm ${
                  !['draft', 'paused'].includes(campaign.status)
                    ? 'text-slate-200 cursor-not-allowed bg-slate-50'
                    : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDeleteClick(campaign)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-slate-200 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    [
      t,
      isAnyLoading,
      isLoadingAction,
      selectedCampaigns,
      handleSelectAll,
      handleSelectCampaign,
      handleActivateCampaign,
      handlePauseCampaign,
      handleResumeCampaign,
      handleEditCampaign,
      handleViewCampaign,
      handleDeleteClick,
      userTz,
    ],
  );

  const table = useReactTable({
    data: campaigns,
    columns,
    state: {
      sorting,
      rowSelection: Object.fromEntries(
        selectedCampaigns.map((id) => [campaigns.findIndex((c) => c.id === id), true]),
      ),
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  if (campaigns.length === 0) {
    return (
      <div className=" p-20 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-sm shadow-purple-900/2">
        <div className="absolute top-0 ltr:left-1/2 ltr:right-1/2 rtl:left-1/2 -translate-x-1/2 w-125 h-75 bg-purple-500/5 rounded-full blur-[100px] -mt-40"></div>
        <div className="relative mb-10">
          <div className="w-20 h-20 bg-linear-to-br from-purple-600 to-purple-600 rounded-[28px] flex items-center justify-center rotate-3 shadow-sm shadow-purple-500/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-800 tracking-tighter mb-4">
          {t('campaigns.empty_log_title')}
        </h3>
        <p className="text-sm font-medium text-slate-400 max-w-sm mb-10 leading-relaxed tracking-widest ">
          {t('campaigns.empty_log_subtitle')}
        </p>
        
      </div>
    );
  }

  return (
    <div className="border border-slate-200/60 bg-white shadow-sm overflow-hidden rounded-lg">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-slate-50/80 ">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-5 px-6 border-b border-slate-200/60 transition-colors first:ltr:rounded-tl-2xl last:ltr:rounded-tr-2xl"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`group/row hover:bg-slate-50/80 transition-all duration-300 cursor-default even:bg-slate-50 ${row.getIsSelected() ? 'bg-purple-50/40' : ''}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-4 px-6 border-b border-slate-100">
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
