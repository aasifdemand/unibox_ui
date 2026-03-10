import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender
} from '@tanstack/react-table';
import {
  ChevronRight,
  Clock,
  Mail,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';

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

const MailboxList = ({
  mailboxes,
  onSelect,
  getProviderIcon,
  timeAgo,
  format,
  viewMode = 'grid',
  selectedSenderIds = [],
  onCheckSender,
  onCheckAllSenders,
}) => {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState([]);

  const isSelected = (id) => selectedSenderIds.some((item) => item.id === id);

  const columns = React.useMemo(() => [
    {
      id: 'selection',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => {
              onCheckAllSenders(e.target.checked);
              table.toggleAllPageRowsSelected(!!e.target.checked);
            }}
            className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 cursor-pointer shadow-xs transition-all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <div className={`transition-opacity duration-300 ${row.getIsSelected() || selectedSenderIds.length > 0 ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100 focus-within:opacity-100'}`}>
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={(e) => {
                onCheckSender(row.original.id, row.original.type, e.target.checked);
                row.toggleSelected(!!e.target.checked);
              }}
              className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 cursor-pointer shadow-xs transition-all"
            />
          </div>
        </div>
      ),
    },
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
          <div className="flex items-center transition-transform duration-300 group-hover/row:translate-x-0.5" onClick={() => onSelect(mailbox)}>
            <div
              className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center me-3 group-hover/row:scale-110 transition-transform duration-300 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onCheckSender(mailbox.id, mailbox.type, !row.getIsSelected());
                row.toggleSelected(!row.getIsSelected());
              }}
            >
              {getProviderIcon(mailbox.type, 'w-7 h-7')}
            </div>
            <div>
              <p className="font-bold text-slate-800 group-hover/row:text-indigo-600 transition-colors">
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
      cell: ({ row }) => <p className="text-sm font-medium text-slate-600">{row.original.email}</p>,
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
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
            : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}
        >
          {row.original.isVerified ? t('mailboxes.status_active') : t('mailboxes.status_warning')}
        </span>
      ),
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
          {row.original.lastSyncAt ? timeAgo(row.original.lastSyncAt) : t('mailboxes.sync_idle')}
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
        <div className="flex items-center justify-end" onClick={() => onSelect(row.original)}>
          <div className="inline-flex w-8 h-8 rounded-full bg-slate-50 items-center justify-center group-hover/row:bg-indigo-600 transition-colors shadow-xs">
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover/row:text-white transition-colors" />
          </div>
        </div>
      ),
    }
  ], [t, getProviderIcon, onSelect, onCheckSender, timeAgo, selectedSenderIds]);

  const table = useReactTable({
    data: mailboxes,
    columns,
    state: {
      sorting,
      rowSelection: Object.fromEntries(selectedSenderIds.map(item => [mailboxes.findIndex(m => m.id === item.id), true])),
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  if (mailboxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center animate-in fade-in duration-700 slide-in-from-bottom-4">
        <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-4xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">
          {t('mailboxes.no_mailboxes')} <span className="text-gradient">{t('mailboxes.linked_yet')}</span>
        </h3>
        <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
          {t('mailboxes.connect_description_centralize')}
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden shadow-xl shadow-slate-900/5">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-start border-collapse border-separate border-spacing-0">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-slate-50/80 backdrop-blur-md">
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-5 border-b border-slate-200/60 transition-colors first:ltr:rounded-tl-2xl last:ltr:rounded-tr-2xl"
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
                    className={`group/row hover:bg-slate-50/50 transition-colors cursor-pointer ${row.getIsSelected() ? 'bg-indigo-50/30' : ''}`}
                  >
                    {row.getVisibleCells().map(cell => (
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
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mailboxes?.map((mailbox) => (
          <div
            key={mailbox.id}
            className={`premium-card p-6 text-start group flex flex-col h-full bg-white relative overflow-hidden transition-all ${isSelected(mailbox.id) ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/10' : 'hover:shadow-xl'}`}
          >
            {/* Improved Checkbox Positioning (Top Right) */}
            <div className={`absolute inset-inline-end-4 top-4 z-20 transition-opacity duration-300 ${isSelected(mailbox.id) || selectedSenderIds.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
              <input
                type="checkbox"
                checked={isSelected(mailbox.id)}
                onChange={(e) => onCheckSender(mailbox.id, mailbox.type, e.target.checked)}
                className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer shadow-sm hover:scale-110"
              />
            </div>

            <button
              onClick={() => onSelect(mailbox)}
              className="w-full text-start flex flex-col h-full"
            >
              {/* Background Glow */}
              <div className="absolute -inset-inline-end-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>

              <div className="flex items-start mb-6 relative z-10">
                <div
                  className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center me-4 group-hover:scale-110 transition-transform duration-300 shadow-inner"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCheckSender(mailbox.id, mailbox.type, !isSelected(mailbox.id));
                  }}
                >
                  {getProviderIcon(mailbox.type, 'w-10 h-10')}
                </div>
                <div className="flex-1 min-w-0 pe-8">
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                    {mailbox.displayName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {mailbox.type}
                    </p>
                    <span
                      className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-md border shadow-2xs shrink-0 ${mailbox.isVerified
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}
                    >
                      {mailbox.isVerified ? t('mailboxes.status_active') : t('mailboxes.status_warning')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex-1">
                <p className="text-sm font-medium text-slate-500 truncate mb-4">{mailbox.email}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {t('mailboxes.todays_volume')}
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
                      className={`text-sm font-bold ${mailbox.isVerified ? 'text-green-600' : 'text-amber-500'}`}
                    >
                      {mailbox.isVerified ? t('mailboxes.status_active') : t('mailboxes.status_warning')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Clock className="w-3 h-3 me-1.5" />
                  {mailbox.lastSyncAt ? timeAgo(mailbox.lastSyncAt) : t('mailboxes.sync_idle')}
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </div>
              </div>

              {mailbox.expiresAt && (
                <div className="bg-amber-500/5 px-6 py-2 -mx-6 -mb-6 mt-4 border-t border-amber-500/10">
                  <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest text-center">
                    {t('mailboxes.account_expires', { date: format(new Date(mailbox.expiresAt), 'MMM d, yyyy') })}
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
