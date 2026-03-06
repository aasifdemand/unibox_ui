import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
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
} from 'lucide-react';
import { useAllContacts } from '../hooks/use-all-contacts';
import { getPaginatedData, formatDate } from '../audience-service';

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

/**
 * Extract readable metadata fields from a contact's metadata JSONB object.
 * Normalises common key variants (city, City, CITY, etc.).
 */
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

/**
 * ContactsTable — flat view of all contacts from all batches.
 * Shows email, name, verification status, plus any metadata fields from the uploaded file.
 */
const ContactsTable = ({ searchTerm, filterStatus, setShowUploadModal }) => {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);

    const { contacts, isLoading } = useAllContacts();

    const filteredContacts = useMemo(() => {
        let result = contacts;
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(
                (c) => c.email?.toLowerCase().includes(lower) || c.name?.toLowerCase().includes(lower),
            );
        }
        if (filterStatus && filterStatus !== 'all') {
            result = result.filter((c) => c.verificationStatus === filterStatus);
        }
        return result;
    }, [contacts, searchTerm, filterStatus]);

    React.useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

    const { totalPages, totalRecords, currentRecords } = useMemo(
        () => getPaginatedData(filteredContacts, currentPage, RECORDS_PER_PAGE),
        [filteredContacts, currentPage],
    );

    const handlePageChange = useCallback((page) => setCurrentPage(page), []);

    // Determine which metadata fields are actually present across visible records
    const visibleMetaFields = useMemo(() => {
        const fields = new Set();
        currentRecords.forEach((r) => {
            const meta = extractMeta(r.metadata);
            Object.keys(meta).forEach((k) => fields.add(k));
        });
        // Keep a preferred order
        return ['company', 'jobTitle', 'phone', 'city', 'country', 'website'].filter((f) => fields.has(f));
    }, [currentRecords]);

    const metaIcons = {
        company: <Building2 className="w-3 h-3" />,
        jobTitle: <Briefcase className="w-3 h-3" />,
        phone: <Phone className="w-3 h-3" />,
        city: <MapPin className="w-3 h-3" />,
        country: <Globe className="w-3 h-3" />,
        website: <Globe className="w-3 h-3" />,
    };

    const metaLabels = {
        company: 'Company',
        jobTitle: 'Job Title',
        phone: 'Phone',
        city: 'City',
        country: 'Country',
        website: 'Website',
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading contacts...</p>
            </div>
        );
    }

    if (contacts.length === 0) {
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
        <div>
            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-5 py-3.5 ltr:text-left rtl:text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                Email
                            </th>
                            <th className="px-5 py-3.5 ltr:text-left rtl:text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                Name
                            </th>
                            {visibleMetaFields.map((f) => (
                                <th key={f} className="px-5 py-3.5 ltr:text-left rtl:text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                    {metaLabels[f]}
                                </th>
                            ))}
                            <th className="px-5 py-3.5 ltr:text-left rtl:text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                Status
                            </th>
                            <th className="px-5 py-3.5 ltr:text-left rtl:text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                Added On
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {currentRecords.map((record, index) => {
                            const meta = extractMeta(record.metadata);
                            return (
                                <motion.tr
                                    key={record.id || `${record.email}-${index}`}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.025 }}
                                    className="group hover:bg-blue-50/30 transition-colors"
                                >
                                    {/* Email */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                                                <Mail className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
                                            </div>
                                            <span className="font-semibold text-slate-700 truncate max-w-52">{record.email || '—'}</span>
                                        </div>
                                    </td>

                                    {/* Name */}
                                    <td className="px-5 py-3.5 font-semibold text-slate-600 whitespace-nowrap">
                                        {record.name || '—'}
                                    </td>

                                    {/* Dynamic metadata columns */}
                                    {visibleMetaFields.map((f) => (
                                        <td key={f} className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                                            {meta[f] ? (
                                                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                    <span className="text-slate-400">{metaIcons[f]}</span>
                                                    {meta[f]}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                    ))}

                                    {/* Verification status */}
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            {getVerificationIcon(record.verificationStatus)}
                                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-lg ${getVerificationBadgeClass(record.verificationStatus)}`}>
                                                {record.verificationStatus
                                                    ? t(`audience.${record.verificationStatus}`)
                                                    : t('modals.details.table.unverified')}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Added On */}
                                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap font-medium">
                                        {formatDate(record.createdAt)}
                                    </td>
                                </motion.tr>
                            );
                        })}
                        {currentRecords.length === 0 && (
                            <tr>
                                <td colSpan={3 + visibleMetaFields.length} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                                            <FileSpreadsheet className="w-7 h-7 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400">{t('modals.details.table.no_records')}</p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                                            {t('modals.details.table.try_adjusting')}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer: count + pagination */}
            <div className="flex items-center justify-between pt-4 mt-2">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {totalRecords} {t('audience.total_contacts')}
                </p>

                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-extrabold text-slate-600 px-2">{currentPage} / {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactsTable;
