import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
    X,
    Mail,
    User,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    FileText,
} from 'lucide-react';
import { formatDate } from '../audience-service';

const BatchDetailsModal = ({
    show,
    onClose,
    batchStatus,
    isLoading,
    recordsPage,
    setRecordsPage,
}) => {
    const { t } = useTranslation();

    if (!show) return null;

    const { batch, contacts = [], pagination = {} } = batchStatus || {};

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

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                <FileText className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
                                    {batch?.originalFilename || 'Batch Details'}
                                </h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {batch?.id}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading batch contacts...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Stats Bar */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: t('audience.valid'), value: batch?.verification?.valid || 0, color: 'emerald' },
                                        { label: t('audience.risky'), value: batch?.verification?.risky || 0, color: 'amber' },
                                        { label: t('audience.invalid'), value: batch?.verification?.invalid || 0, color: 'rose' },
                                        { label: t('audience.unverified'), value: batch?.verification?.unverified || 0, color: 'slate' },
                                    ].map((stat, i) => (
                                        <div key={i} className={`p-4 rounded-2xl bg-${stat.color}-50/50 border border-${stat.color}-100`}>
                                            <p className={`text-[10px] font-black text-${stat.color}-600/60 uppercase tracking-widest mb-1`}>
                                                {stat.label}
                                            </p>
                                            <p className={`text-2xl font-black text-${stat.color}-600`}>
                                                {stat.value.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Table */}
                                <div className="rounded-2xl border border-slate-200/60 overflow-hidden">
                                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                                        <thead className="bg-slate-50/80">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-900 uppercase tracking-widest">Email</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-900 uppercase tracking-widest">Name</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-900 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-900 uppercase tracking-widest">Added</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {contacts.map((contact) => (
                                                <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                            <span className="font-semibold text-slate-700">{contact.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                            <User className="w-3.5 h-3.5 text-slate-300" />
                                                            {contact.name || '—'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {getVerificationIcon(contact.verificationStatus)}
                                                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-lg ${getVerificationBadgeClass(contact.verificationStatus)}`}>
                                                                {contact.verificationStatus || 'unverified'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-slate-500 font-medium">{formatDate(contact.createdAt)}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {contacts.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                                                        No contacts found in this batch.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Pagination */}
                    {!isLoading && pagination.pages > 1 && (
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Total {pagination.total?.toLocaleString()} Records
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setRecordsPage(recordsPage - 1)}
                                    disabled={recordsPage === 1}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all disabled:opacity-20"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="px-4 flex items-center gap-2">
                                    <span className="text-xs font-black text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/60">{recordsPage}</span>
                                    <span className="text-[10px] font-black text-slate-300 uppercase">of</span>
                                    <span className="text-xs font-black text-slate-600">{pagination.pages}</span>
                                </div>
                                <button
                                    onClick={() => setRecordsPage(recordsPage + 1)}
                                    disabled={recordsPage === pagination.pages}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all disabled:opacity-20"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BatchDetailsModal;
