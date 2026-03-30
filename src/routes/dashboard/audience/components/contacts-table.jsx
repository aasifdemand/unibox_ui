import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Upload,
  Building2,
  MapPin,
  Phone,
  Briefcase,
  Globe,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Sparkles,
  Columns3,
  Check,
  Link,
  Star,
  Users,
  Tag,
} from 'lucide-react';
import { SkeletonLoader } from '../../../../components/ui/loading-spinner';

import { formatDate } from '../audience-service';
import { useAllContacts } from '../hooks/use-all-contacts';
import { useDebounce } from '../../../../hooks/useDebounce';
import { toast } from 'react-hot-toast';

const RECORDS_PER_PAGE = 10;

// ─── Status helpers ───────────────────────────────────────────────────────────
const getVerificationIcon = (status) => {
  switch (status) {
    case 'valid':
      return <CheckCircle className="w-3.5 h-3.5 text-orange-500" />;
    case 'invalid':
      return <XCircle className="w-3.5 h-3.5 text-orange-500" />;
    case 'risky':
      return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
    default:
      return <AlertCircle className="w-3.5 h-3.5 text-slate-300" />;
  }
};
const getVerificationBadgeClass = (status) => {
  switch (status) {
    case 'valid':
      return 'bg-orange-50 text-orange-600 border border-orange-100';
    case 'invalid':
      return 'bg-orange-50 text-orange-600 border border-orange-100';
    case 'risky':
      return 'bg-amber-50 text-amber-600 border border-amber-100';
    default:
      return 'bg-slate-50 text-slate-400 border border-slate-200';
  }
};

// ─── All Apollo-style fields with metadata key aliases ────────────────────────
const ALL_META_FIELDS = [
  {
    id: 'company',
    label: 'Company',
    icon: <Building2 className="w-3 h-3" />,
    keys: ['company', 'organization', 'org', 'employer', 'companyname'],
  },
  {
    id: 'job_title',
    label: 'Job Title',
    icon: <Briefcase className="w-3 h-3" />,
    keys: ['job_title', 'jobtitle', 'title', 'position', 'role', 'designation'],
  },
  {
    id: 'phone',
    label: 'Phone',
    icon: <Phone className="w-3 h-3" />,
    keys: ['phone', 'phonenumber', 'phone_number', 'mobile', 'tel', 'telephone', 'cell'],
  },
  {
    id: 'city',
    label: 'City',
    icon: <MapPin className="w-3 h-3" />,
    keys: ['city', 'town', 'locality'],
  },
  {
    id: 'country',
    label: 'Country',
    icon: <Globe className="w-3 h-3" />,
    keys: ['country', 'countryname', 'nation', 'countrycode'],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: <Link className="w-3 h-3" />,
    keys: ['linkedin', 'linkedin_url', 'linkedinurl'],
  },
  {
    id: 'website',
    label: 'Website',
    icon: <Globe className="w-3 h-3" />,
    keys: ['website', 'url', 'web', 'companywebsite', 'company_website'],
  },
  { id: 'seniority', label: 'Seniority', icon: <Star className="w-3 h-3" />, keys: ['seniority'] },
  {
    id: 'department',
    label: 'Department',
    icon: <Users className="w-3 h-3" />,
    keys: ['department'],
  },
  { id: 'industry', label: 'Industry', icon: <Tag className="w-3 h-3" />, keys: ['industry'] },
];

// Flatten aliases for fast lookup
const META_KEY_MAP = {};
ALL_META_FIELDS.forEach(({ id, keys }) => {
  keys.forEach((k) => (META_KEY_MAP[k] = id));
});

const extractMeta = (metadata) => {
  if (!metadata || typeof metadata !== 'object') return {};
  const result = {};
  Object.keys(metadata).forEach((k) => {
    const normalized = k.toLowerCase().replace(/[\s_-]/g, '');
    const fieldId = META_KEY_MAP[normalized] || META_KEY_MAP[k.toLowerCase()];
    if (fieldId && metadata[k]) result[fieldId] = metadata[k];
  });
  return result;
};

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

// ─── Column Selector Dropdown ─────────────────────────────────────────────────
export const ColumnSelector = ({ visibleCols, onToggle }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative z-5100 " ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-3 rounded-md border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:border-orange-200 hover:text-orange-600 transition-all shadow-sm"
      >
        <Columns3 className="w-3.5 h-3.5" />
        Columns
        <span className="bg-orange-100 text-orange-600 rounded px-1.5 py-0.5 text-[9px] font-black">
          {visibleCols.size}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-sm shadow-slate-200/80 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Toggle Columns
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    ALL_META_FIELDS.forEach((f) => !visibleCols.has(f.id) && onToggle(f.id))
                  }
                  className="text-[9px] font-black text-orange-500 hover:text-orange-700 uppercase tracking-wider"
                >
                  All
                </button>
                <span className="text-slate-200">|</span>
                <button
                  onClick={() =>
                    ALL_META_FIELDS.forEach((f) => visibleCols.has(f.id) && onToggle(f.id))
                  }
                  className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider"
                >
                  None
                </button>
              </div>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto">
              {ALL_META_FIELDS.map((field) => (
                <button
                  key={field.id}
                  onClick={() => onToggle(field.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors group"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${visibleCols.has(field.id) ? 'bg-orange-600 border-orange-600' : 'border-slate-200 bg-white'}`}
                  >
                    {visibleCols.has(field.id) && (
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-slate-500 group-hover:text-slate-700">{field.icon}</span>
                  <span className="text-[12px] font-semibold text-slate-700">{field.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
import { api } from '../../../../lib/api';
const ContactsTable = ({ searchTerm, filterStatus, setShowUploadModal }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState([]);
  const [enrichingId, setEnrichingId] = useState(null);
  const [visibleCols, setVisibleCols] = useState(new Set());

  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus]);

  const {
    contacts: currentRecords = [],
    pagination = { pages: 0, total: 0 },
    isLoading,
    refetch,
  } = useAllContacts({
    page: currentPage,
    limit: RECORDS_PER_PAGE,
    searchTerm: debouncedSearchTerm,
    filterStatus,
  });
  const { pages: totalPages, total: totalRecords } = pagination;

  const toggleCol = (id) => {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Enrich handler
  const handleEnrich = async (contact) => {
    setEnrichingId(contact.id);
    const toastId = toast.loading(`Enriching ${contact.email}...`);
    try {
      const res = await api.post(`/lists/contact/${contact.id}/enrich`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Enrichment failed');
      toast.dismiss(toastId);
      const fields = data.data?.enrichedFields?.join(', ');
      toast.success(`✨ ${data.message}${fields ? ` — Found: ${fields}` : ''}`);
      refetch();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.message);
    } finally {
      setEnrichingId(null);
    }
  };

  const columns = useMemo(() => {
    const base = [
      {
        id: 'email',
        accessorKey: 'email',
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer select-none group/header"
            onClick={column.getToggleSortingHandler()}
          >
            <span>Email</span>
            <SortIndicator column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2.5 min-w-[200px]">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="font-semibold text-slate-700 truncate max-w-[200px] text-[13px]">
              {info.getValue() || '—'}
            </span>
          </div>
        ),
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer select-none group/header"
            onClick={column.getToggleSortingHandler()}
          >
            <span>Name</span>
            <SortIndicator column={column} />
          </div>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2 min-w-[120px]">
            {info.getValue() ? (
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                {info
                  .getValue()
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-slate-300 text-[10px] font-black">?</span>
              </div>
            )}
            <span className="font-semibold text-slate-700 text-[13px]">
              {info.getValue() || <span className="text-slate-300">—</span>}
            </span>
          </div>
        ),
      },
      {
        id: 'sourceBatch',
        accessorKey: 'sourceBatch',
        header: () => <span>Source</span>,
        cell: (info) => (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight bg-slate-50 px-2 py-1 rounded-md border border-slate-100 whitespace-nowrap">
            {info.getValue() || '—'}
          </span>
        ),
      },
    ];

    // Apollo-style meta columns — only those toggled on
    const metaCols = ALL_META_FIELDS.filter((f) => visibleCols.has(f.id)).map((field) => ({
      id: `meta-${field.id}`,
      header: () => (
        <div className="flex items-center gap-1.5 text-slate-500">
          {field.icon}
          <span>{field.label}</span>
        </div>
      ),
      accessorFn: (row) => extractMeta(row.metadata)[field.id],
      cell: (info) => {
        const val = info.getValue();
        if (!val) return <span className="text-slate-200 select-none">—</span>;
        if (field.id === 'linkedin')
          return (
            <a
              href={val}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-orange-500 hover:text-orange-700 font-medium text-[12px] truncate max-w-[160px]"
              onClick={(e) => e.stopPropagation()}
            >
              <Link className="w-3 h-3 shrink-0" />
              <span className="truncate">Profile</span>
            </a>
          );
        return (
          <span className="flex items-center gap-1.5 text-slate-600 font-medium text-[13px] whitespace-nowrap">
            <span className="text-slate-300">{field.icon}</span>
            <span className="truncate max-w-[160px]">{val}</span>
          </span>
        );
      },
    }));

    const end = [
      {
        id: 'verificationStatus',
        accessorKey: 'verificationStatus',
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer select-none group/header"
            onClick={column.getToggleSortingHandler()}
          >
            <span>Status</span>
            <SortIndicator column={column} />
          </div>
        ),
        cell: (info) => {
          const status = info.getValue();
          return (
            <div className="flex items-center gap-2">
              {getVerificationIcon(status)}
              <span
                className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-lg ${getVerificationBadgeClass(status)}`}
              >
                {status ? t(`audience.${status}`) : t('modals.details.table.unverified')}
              </span>
            </div>
          );
        },
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <div
            className="flex items-center cursor-pointer select-none group/header"
            onClick={column.getToggleSortingHandler()}
          >
            <span>Added On</span>
            <SortIndicator column={column} />
          </div>
        ),
        cell: (info) => (
          <span className="text-slate-500 whitespace-nowrap font-medium text-[12px]">
            {formatDate(info.getValue())}
          </span>
        ),
      },
      {
        id: 'enrich',
        header: () => (
          <div className="flex items-center gap-1 text-orange-400">
            <Sparkles className="w-3 h-3" />
            <span>Enrich</span>
          </div>
        ),
        cell: ({ row }) => {
          const isEnriching = enrichingId === row.original.id;
          const wasEnriched = !!row.original.metadata?._enrichedAt;
          return (
            <button
              onClick={() => handleEnrich(row.original)}
              disabled={isEnriching}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${isEnriching
                ? 'bg-orange-100 text-orange-500 animate-pulse cursor-wait'
                : wasEnriched
                  ? 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100'
                  : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100'
                }`}
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              {isEnriching ? 'Enriching...' : wasEnriched ? 'Re-enrich' : 'Enrich'}
            </button>
          );
        },
        meta: { sticky: true },
      },
    ];

    return [...base, ...metaCols, ...end];
  }, [visibleCols, t, enrichingId]);

  const table = useReactTable({
    data: currentRecords,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualFiltering: true,
  });

  if (isLoading)
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end px-1" />
        <div className="overflow-hidden rounded-lg border border-slate-200/60 bg-white shadow-sm">
          <SkeletonLoader type="list" count={10} />
        </div>
      </div>
    );

  if (!isLoading && currentRecords.length === 0 && !searchTerm && filterStatus === 'all')
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
          <FileSpreadsheet className="w-10 h-10 text-slate-300" />
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-700 tracking-tight mb-1">
            {t('audience.no_contacts_yet')}
          </p>
          <p className="text-sm text-slate-400 font-medium">
            {t('audience.upload_to_get_started')}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary h-11 px-6 flex items-center gap-3 rounded-md text-[11px] font-extrabold uppercase tracking-widest shadow-sm shadow-orange-500/20"
        >
          <Upload className="w-4 h-4" />
          {t('audience.add_contacts')}
        </button>
      </div>
    );

  return (
    <div className="space-y-4 min-h-[450px]">
      {/* Toolbar: column selector */}
      <div className="flex items-center justify-end px-1 relative z-50 h-px" />

      <div className="overflow-hidden rounded-lg border border-slate-200/60 bg-white shadow-sm shadow-slate-200/20">
        <div className="overflow-x-auto custom-scrollbar scroll-smooth">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-slate-50/80 ">
                  {hg.headers.map((header) => {
                    const isSticky = header.column.columnDef.meta?.sticky;
                    return (
                      <th
                        key={header.id}
                        className={`px-5 py-3.5 ltr:text-left rtl:text-right border-b border-slate-200/60 whitespace-nowrap ${isSticky ? 'sticky right-0 bg-slate-50/90  border-l border-slate-200/60 z-10' : ''}`}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] select-none">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.012, duration: 0.25, ease: 'easeOut' }}
                  className="group hover:bg-orange-50/20 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSticky = cell.column.columnDef.meta?.sticky;
                    return (
                      <td
                        key={cell.id}
                        className={`px-5 py-3.5 ${isSticky ? 'sticky right-0 bg-white group-hover:bg-orange-50/20 border-l border-slate-100 z-10' : ''}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-lg bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                        <FileSpreadsheet className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-xl font-black text-slate-700 tracking-tight">
                        {t('modals.details.table.no_records')}
                      </p>
                      <p className="text-sm font-bold text-slate-400 mt-2">
                        {t('modals.details.table.try_adjusting')}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4 sm:gap-0 py-1">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {totalRecords.toLocaleString()} {t('audience.total_contacts')}
          </p>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
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
              <span className="text-xs font-black text-slate-600">{totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-orange-600 transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsTable;
