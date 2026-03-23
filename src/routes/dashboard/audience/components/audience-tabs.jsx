import React from 'react';
import {
  Download,
  Eye,
  FileSpreadsheet,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useExportBatch } from '../../../../hooks/useBatches';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

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

const AudienceTabs = ({
  isLoadingBatches,
  filteredBatches,
  setShowUploadModal,
  handleDeleteBatch,
  openBatchDetails,
  pagination,
  currentPage,
  onPageChange,
}) => {
  const { t } = useTranslation();
  const exportBatch = useExportBatch();
  const [sorting, setSorting] = React.useState([]);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'originalFilename',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('audience.batch_name', 'Batch Name')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const batch = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{batch.originalFilename}</p>
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
              {t('audience.status', 'Status')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  ['completed', 'verified'].includes(status)
                    ? 'bg-orange-500'
                    : status === 'processing'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-orange-500'
                }`}
              ></div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                {t(`audience.${status}`)}
              </span>
            </div>
          );
        },
      },
      {
        id: 'valid',
        header: () => (
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
            {t('audience.valid', 'Valid')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-extrabold text-orange-600 tabular-nums">
            {row.original.verification?.valid ?? 0}
          </span>
        ),
      },
      {
        id: 'risky',
        header: () => (
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
            {t('audience.risky', 'Risky')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-extrabold text-amber-600 tabular-nums">
            {row.original.verification?.risky ?? 0}
          </span>
        ),
      },
      {
        id: 'invalid',
        header: () => (
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
            {t('audience.invalid', 'Invalid')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-extrabold text-orange-600 tabular-nums">
            {row.original.verification?.invalid ?? 0}
          </span>
        ),
      },
      {
        id: 'unverified',
        header: () => (
          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
            {t('audience.unverified', 'Unverified')}
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-extrabold text-slate-600 tabular-nums">
            {row.original.verification?.unverified ?? 0}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center group/header"
          >
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('audience.uploaded_on', 'Uploaded On')}
            </span>
            <SortIndicator column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <div className="text-right px-6">
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] select-none">
              {t('audience.actions', 'Actions')}
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2 px-6">
            <button
              onClick={() => openBatchDetails(row.original)}
              className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
              title={t('audience.view_details')}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => exportBatch.mutate({ batchId: row.original.id })}
              className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
              title={t('audience.export')}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteBatch(row.original.id)}
              className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
              title={t('audience.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [t, exportBatch, openBatchDetails, handleDeleteBatch],
  );

  const table = useReactTable({
    data: filteredBatches,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      {isLoadingBatches ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {t('audience.loading_contacts')}
          </p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="premium-card bg-white border-dashed border-2 border-slate-200 p-20 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
            <FileSpreadsheet className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">
            {t('audience.no_contacts_title')}
          </h3>
          <p className="text-sm font-medium text-slate-400 max-w-xs mb-8">
            {t('audience.no_contacts_description')}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary py-3 px-8 flex items-center gap-3"
          >
            <Upload className="w-4 h-4 text-white" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">
              {t('audience.upload_contacts_btn')}
            </span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden shadow-sm shadow-slate-900/5">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-start border-collapse border-separate border-spacing-0">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-slate-50/80 ">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-5 border-b border-slate-200/60 transition-colors first:ltr:rounded-tl-2xl last:ltr:rounded-tr-2xl text-left"
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
                  <tr key={row.id} className="group/row hover:bg-slate-50/50 transition-colors">
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
      )}

      {/* Pagination */}
      {!isLoadingBatches && pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 mt-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {pagination.total?.toLocaleString()} {t('audience.total_batches') || 'Total Batches'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-orange-600 transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="px-4 flex items-center gap-2">
              <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
                {currentPage}
              </span>
              <span className="text-[10px] font-black text-slate-300 uppercase">of</span>
              <span className="text-xs font-black text-slate-600">{pagination.pages}</span>
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              className="w-10 h-10 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-orange-600 transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudienceTabs;
