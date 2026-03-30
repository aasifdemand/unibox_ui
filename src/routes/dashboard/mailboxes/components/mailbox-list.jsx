import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  ChevronRight,
  Clock,
  Mail,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ShieldCheck,
  ShieldAlert,
  Shield,
  RefreshCw,
} from 'lucide-react';

const SortIndicator = ({ column }) => {
  const isSorted = column.getIsSorted();
  if (!isSorted)
    return (
      <div className="w-4 h-4 flex items-center justify-center rounded-md group-hover/header:bg-slate-100 transition-all ml-1 opacity-0 group-hover/header:opacity-100">
        <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover/header:text-slate-400" />
      </div>
    );
  return (
    <div className="w-4 h-4 flex items-center justify-center rounded-md bg-orange-50/50 border border-orange-100/50 ml-1">
      {isSorted === 'desc' ? (
        <ChevronDown className="w-2.5 h-2.5 text-orange-600" />
      ) : (
        <ChevronUp className="w-2.5 h-2.5 text-orange-600" />
      )}
    </div>
  );
};

const MailboxList = ({
  mailboxes,
  onSelect,
  getProviderIcon,
  timeAgo,
  selectedSenderIds = [],
  onCheckSender,
  onSync,
  isSyncingMailboxId,
}) => {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState([]);

  const isSelected = (id) => selectedSenderIds.some((item) => item.id === id);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'displayName',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('mailboxes.table_mailbox')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const mailbox = row.original;
          return (
            <div
              className="flex items-center transition-transform duration-300 group-hover/row:translate-x-0.5"
              onClick={() => onSelect(mailbox)}
            >
              <div
                className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center me-3 group-hover/row:scale-110 transition-transform duration-300 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckSender(mailbox.id, mailbox.type, !row.getIsSelected());
                  row.toggleSelected(!row.getIsSelected());
                }}
              >
                {getProviderIcon(mailbox.type, 'w-7 h-7')}
              </div>
              <div>
                <p className="font-bold text-slate-800 group-hover/row:text-orange-600 transition-colors">
                  {mailbox.displayName}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                  {mailbox.type}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('mailboxes.table_email')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <p className="text-sm font-medium text-slate-600">{row.original.email}</p>
        ),
      },
      {
        accessorKey: 'isVerified',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('mailboxes.table_status')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <span
            className={`text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-lg border shadow-xs inline-block ${row.original.isVerified
                ? 'bg-orange-50 text-orange-600 border-orange-100'
                : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}
          >
            {row.original.isVerified ? t('mailboxes.status_active') : t('mailboxes.status_warning')}
          </span>
        ),
      },
      {
        accessorKey: 'reputation',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              Reputation
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const score = row.original.reputation ?? row.original.stats?.reputationScore ?? 100;
          let colorClass = 'bg-orange-50 text-orange-600 border-orange-100';
          let Icon = ShieldCheck;

          if (score < 50) {
            colorClass = 'bg-orange-50 text-orange-600 border-orange-100';
            Icon = ShieldAlert;
          } else if (score < 80) {
            colorClass = 'bg-amber-50 text-amber-600 border-amber-100';
            Icon = Shield;
          }

          return (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-xs ${colorClass}`}
            >
              <Icon className="w-3 h-3" />
              <span className="text-[10px] font-black tabular-nums">{score}%</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'stats.dailySent',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('mailboxes.table_volume')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800 tabular-nums">
              {row.original.stats?.dailySent || 0}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t('mailboxes.volume_today')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'lastSyncAt',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('mailboxes.table_last_sync')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest tabular-nums">
            <Clock className="w-3.5 h-3.5 me-1.5 text-slate-400" />
            {row.original.lastSyncAt ? (
              timeAgo(row.original.lastSyncAt)
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSync(row.original.id, row.original.type);
                }}
                className="text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 transition-all"
              >
                {t('mailboxes.sync_idle')}
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('mailboxes.table_actions')}
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2 px-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSync(row.original.id, row.original.type);
              }}
              disabled={isSyncingMailboxId === row.original.id}
              className="inline-flex w-8 h-8 rounded-full bg-slate-50 items-center justify-center hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-all border border-transparent hover:border-orange-100 shadow-xs active:scale-90"
              title="Sync Now"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncingMailboxId === row.original.id ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={() => onSelect(row.original)}
              className="inline-flex w-8 h-8 rounded-full bg-orange-600 items-center justify-center hover:bg-slate-800 transition-all shadow-md shadow-orange-500/20 active:scale-90"
              title="View Mailbox"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        ),
      },
    ],
    [
      t,
      getProviderIcon,
      onSelect,
      onCheckSender,
      timeAgo,
      selectedSenderIds,
      onSync,
      isSyncingMailboxId,
    ],
  );

  const table = useReactTable({
    data: mailboxes,
    columns,
    state: {
      sorting,
      rowSelection: Object.fromEntries(
        selectedSenderIds.map((item) => [mailboxes.findIndex((m) => m.id === item.id), true]),
      ),
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  if (mailboxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center animate-in fade-in duration-700 slide-in-from-bottom-4">
        <div className="w-24 h-24 bg-linear-to-br from-orange-500 to-orange-600 rounded-4xl flex items-center justify-center mb-8 shadow-sm shadow-orange-500/20">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">
          {t('mailboxes.no_mailboxes')}{' '}
          <span className="text-gradient">{t('mailboxes.linked_yet')}</span>
        </h3>
        <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
          {t('mailboxes.connect_description_centralize')}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto  animate-in fade-in duration-500 mt-4 md:mt-6">
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm shadow-slate-900/5">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-start border-collapse border-separate border-spacing-0">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-slate-50/80 ">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-5 border-b border-slate-200/60 transition-colors first:ltr:rounded-tl-2xl last:ltr:rounded-tr-2xl"
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
                  className={`group/row hover:bg-slate-50/50 transition-colors cursor-pointer ${row.getIsSelected() ? 'bg-orange-50/30' : ''}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 border-b border-slate-50/50">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MailboxList;
