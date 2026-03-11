import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
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
    Search,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Trash2,
} from 'lucide-react';

import { formatDate } from '../audience-service';


const RECORDS_PER_PAGE = 10;

const getVerificationIcon = (status) => {
    switch (status) {
        case 'valid': return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
        case 'invalid': return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
        case 'risky': return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
        default: return <AlertCircle className="w-3.5 h-3.5 text-slate-300" />;
    }
};

const getVerificationBadgeClass = (status) => {
    switch (status) {
        case 'valid': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
        case 'invalid': return 'bg-rose-50 text-rose-600 border border-rose-100';
        case 'risky': return 'bg-amber-50 text-amber-600 border border-amber-100';
        default: return 'bg-slate-50 text-slate-400 border border-slate-200';
    }
};

const METADATA_MAP = {
    company: ['company', 'organization', 'org', 'employer', 'companyname'],
    jobTitle: ['jobtitle', 'job_title', 'title', 'position', 'role', 'designation'],
    phone: ['phone', 'phonenumber', 'phone_number', 'mobile', 'tel', 'telephone', 'cell'],
    city: ['city', 'town', 'locality'],
    country: ['country', 'countryname', 'nation', 'countrycode'],
    website: ['website', 'url', 'web', 'linkedin', 'twitter'],
};

const extractMeta = (metadata) => {
    if (!metadata || typeof metadata !== 'object') return {};
    const lower = {};
    Object.keys(metadata).forEach((k) => { lower[k.toLowerCase().replace(/[\s_-]/g, '')] = metadata[k]; });

    const result = {};
    Object.entries(METADATA_MAP).forEach(([field, variants]) => {
        for (const v of variants) {
            if (lower[v]) { result[field] = lower[v]; break; }
        }
    });
    return result;
};

const metaIcons = {
    company: <Building2 className="w-3 h-3" />,
    jobTitle: <Briefcase className="w-3 h-3" />,
    phone: <Phone className="w-3 h-3" />,
    city: <MapPin className="w-3 h-3" />,
    country: <Globe className="w-3 h-3" />,
    website: <Globe className="w-3 h-3" />,
};



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

const Filter = ({ column, table }) => {
    const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);
    const columnFilterValue = column.getFilterValue();

    return (
        <div className="mt-1 relative group/filter">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 group-focus-within/filter:text-blue-500 transition-colors" />
            <input
                type="text"
                value={(columnFilterValue ?? '')}
                onChange={e => column.setFilterValue(e.target.value)}
                placeholder="Filter..."
                className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-inter"
            />
        </div>
    );
};

const ContactsTable = ({ searchTerm, filterStatus, setShowUploadModal }) => {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const [sorting, setSorting] = useState([]);

    const { totalPages, total: totalRecords } = pagination;

    const visibleMetaFields = useMemo(() => {
        const fields = new Set();
        currentRecords.forEach((r) => {
            const meta = extractMeta(r.metadata);
            Object.keys(meta).forEach((k) => fields.add(k));
        });
        return ['company', 'jobTitle', 'phone', 'city', 'country', 'website'].filter((f) => fields.has(f));
    }, [currentRecords]);

    const columns = useMemo(() => {
        const baseColumns = [
            {
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
                cell: info => (
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                            <Mail className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
                        </div>
                        <span className="font-semibold text-slate-700 truncate max-w-52">{info.getValue() || '—'}</span>
                    </div>
                ),
            },
            {
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
                cell: info => <span className="font-medium text-slate-600">{info.getValue() || '—'}</span>,
            },
            {
                accessorKey: 'sourceBatch',
                header: ({ column }) => (
                    <div
                        className="flex items-center cursor-pointer select-none group/header"
                        onClick={column.getToggleSortingHandler()}
                    >
                        <span>Batch</span>
                        <SortIndicator column={column} />
                    </div>
                ),
                cell: info => (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {info.getValue() || '—'}
                    </span>
                ),
            },
        ];

        // Dynamic Meta Columns
        const metaCols = visibleMetaFields.map(field => ({
            id: `meta-${field}`,
            header: ({ column }) => (
                <div
                    className="flex items-center cursor-pointer select-none group/header"
                    onClick={column.getToggleSortingHandler()}
                >
                    <span>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                    <SortIndicator column={column} />
                </div>
            ),
            accessorFn: row => {
                const meta = extractMeta(row.metadata);
                return meta[field];
            },
            cell: info => info.getValue() ? (
                <span className="flex items-center gap-1.5 text-slate-600 font-medium whitespace-nowrap">
                    <span className="text-slate-400">{metaIcons[field]}</span>
                    {info.getValue()}
                </span>
            ) : <span className="text-slate-300">—</span>,
        }));

        const endColumns = [
            {
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
                cell: info => {
                    const status = info.getValue();
                    return (
                        <div className="flex items-center gap-2">
                            {getVerificationIcon(status)}
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-lg ${getVerificationBadgeClass(status)}`}>
                                {status ? t(`audience.${status}`) : t('modals.details.table.unverified')}
                            </span>
                        </div>
                    );
                },
            },
            {
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
                cell: info => <span className="text-slate-500 whitespace-nowrap font-medium">{formatDate(info.getValue())}</span>,
            },
        ];

        return [...baseColumns, ...metaCols, ...endColumns];
    }, [visibleMetaFields, t]);

    const table = useReactTable({
        data: currentRecords,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualFiltering: true,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading contacts...</p>
            </div>
        );
    }

    if (!isLoading && currentRecords.length === 0 && !searchTerm && filterStatus === 'all') {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <FileSpreadsheet className="w-10 h-10 text-slate-300" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-black text-slate-700 tracking-tight mb-1">
                        {t('audience.no_contacts_yet')}
                    </p>
                    <p className="text-sm text-slate-400 font-medium">{t('audience.upload_to_get_started')}</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="btn-primary h-11 px-6 flex items-center gap-3 rounded-xl text-[11px] font-extrabold uppercase tracking-widest shadow-xl shadow-indigo-500/20"
                >
                    <Upload className="w-4 h-4" />
                    {t('audience.add_contacts')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="overflow-hidden no-scrollbar rounded-3xl border border-slate-200/60 bg-white shadow-xl shadow-slate-200/20">
                <div className="overflow-x-auto no-scrollbar scroll-smooth">
                    <table className="w-full text-sm border-separate border-spacing-0 min-w-[1200px]">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-slate-50/80 backdrop-blur-md">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 ltr:text-left rtl:text-right border-b border-slate-200/60 transition-colors">
                                            {header.isPlaceholder ? null : (
                                                <div className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.15em] select-none">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-100/60">
                            {table.getRowModel().rows.map((row, index) => (
                                <motion.tr
                                    key={row.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: index * 0.015,
                                        duration: 0.3,
                                        ease: "easeOut"
                                    }}
                                    className="group hover:bg-slate-50/40 transition-colors duration-200 cursor-default"
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 font-inter">
                                            <div className="transition-transform duration-200 group-hover:translate-x-0.5">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </div>
                                        </td>
                                    ))}
                                </motion.tr>
                            ))}
                            {table.getRowModel().rows.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                                                <FileSpreadsheet className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <p className="text-xl font-black text-slate-700 tracking-tight">{t('modals.details.table.no_records')}</p>
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

            <div className="flex flex-col sm:flex-row items-center justify-between px-4 gap-4 sm:gap-0 py-2 sm:py-0">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        {totalRecords.toLocaleString()} {t('audience.total_contacts')}
                    </p>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all disabled:opacity-20 disabled:pointer-events-none"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="px-4 flex items-center gap-2">
                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">{currentPage}</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase">of</span>
                            <span className="text-xs font-black text-slate-600">{totalPages}</span>
                        </div>

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all disabled:opacity-20 disabled:pointer-events-none"
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
