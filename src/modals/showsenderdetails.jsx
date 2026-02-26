import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
    Mail,
    CheckCircle,
    AlertCircle,
    Server,
    Zap,
    RefreshCw,
    Trash2,
    Settings,
    ShieldCheck,
    Link2,
} from 'lucide-react';
import Modal from '../components/shared/modal';
import { Gmail } from '../icons/gmail';
import { MicrosoftOutlook } from '../icons/outlook';
import { Smtp } from '../icons/smtp';
import Button from '../components/ui/button';

const ShowSenderDetails = ({
    sender,
    onClose,
    handleTestSender,
    handleDeleteSender,
    isTestingSender,
    isDeletingSender
}) => {
    const { t } = useTranslation();
    if (!sender) return null;

    const getProviderIcon = () => {
        switch (sender.type) {
            case 'gmail': return <Gmail className="w-10 h-10" />;
            case 'outlook': return <MicrosoftOutlook className="w-10 h-10" />;
            default: return <Smtp className="w-10 h-10" />;
        }
    };

    const getStatusConfig = () => {
        if (sender.isVerified) {
            return {
                label: t('settings.resources.senders.verified'),
                color: 'emerald',
                icon: <CheckCircle className="w-4 h-4" />,
                bg: 'bg-emerald-50',
                text: 'text-emerald-600',
                border: 'border-emerald-100'
            };
        }
        return {
            label: t('settings.resources.senders.pending'),
            color: 'amber',
            icon: <AlertCircle className="w-4 h-4" />,
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100'
        };
    };

    const status = getStatusConfig();

    // Helper to get SMTP host
    const getSmtpHost = () => {
        if (sender.type === 'smtp') return sender.smtpHost || '—';
        if (sender.type === 'gmail') return 'smtp.gmail.com';
        if (sender.type === 'outlook') return 'smtp.office365.com';
        return '—';
    };

    // Helper to get SMTP port
    const getSmtpPort = () => {
        if (sender.type === 'smtp') return sender.smtpPort || '587';
        if (sender.type === 'gmail' || sender.type === 'outlook') return '587';
        return '—';
    };

    return (
        <Modal
            isOpen={!!sender}
            onClose={onClose}
            maxWidth="max-w-3xl"
            closeOnBackdrop={true}
        >
            {/* Header Banner */}
            <div className={`bg-linear-to-br ${sender.type === 'gmail' ? 'from-rose-600 to-red-700' : sender.type === 'outlook' ? 'from-blue-600 to-indigo-700' : 'from-violet-600 to-purple-700'} p-8 relative overflow-hidden group`}>
                <div className="absolute top-0 ltr:right-0 rtl:left-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Mail className="w-24 h-24 text-white" />
                </div>
                <div className="relative flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                        {getProviderIcon()}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-extrabold text-white uppercase tracking-tighter">
                                {sender.displayName}
                            </h3>
                            <div className="px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-black uppercase tracking-widest text-white">
                                {sender.type}
                            </div>
                        </div>
                        <p className="text-sm font-bold text-white/70 mt-1">{sender.email}</p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Status Card */}
                    <div className={`p-5 rounded-3xl border-2 ${status.bg} ${status.border} flex flex-col items-center text-center`}>
                        <div className={`w-12 h-12 rounded-2xl bg-white border ${status.border} flex items-center justify-center mb-4 text-slate-800`}>
                            {status.icon}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{t('modals.details.sender_info.health')}</p>
                        <h4 className={`text-sm font-extrabold ${status.text}`}>{status.label}</h4>
                    </div>

                    {/* Setup Card */}
                    <div className="p-5 rounded-3xl border-2 bg-slate-50 border-slate-100 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-4 text-slate-800">
                            <Settings className="w-4 h-4 text-slate-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{t('modals.details.sender_info.setup_type')}</p>
                        <h4 className="text-sm font-extrabold text-slate-800 uppercase">
                            {sender.type === 'smtp' ? t('modals.details.sender_info.direct') : t('modals.details.sender_info.oauth')}
                        </h4>
                    </div>

                    {/* API ID Card */}
                    <div className="p-5 rounded-3xl border-2 bg-slate-50 border-slate-100 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-4 text-slate-800">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{t('modals.details.sender_info.sender_id')}</p>
                        <h4 className="text-[10px] font-extrabold text-slate-800 tabular-nums truncate max-w-full">
                            {sender.id}
                        </h4>
                    </div>
                </div>

                {/* Configuration Details */}
                <div className="space-y-8">
                    <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Smtp className="w-4 h-4" />
                            {t('modals.details.sender_info.outgoing')}
                        </h4>
                        <div className="premium-card p-6 bg-slate-50 border-none shadow-none grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('modals.details.sender_info.host')}</p>
                                <p className="text-sm font-bold text-slate-700">{getSmtpHost()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('modals.details.sender_info.port_security')}</p>
                                <p className="text-sm font-bold text-slate-700">{getSmtpPort()} ({sender.type === 'smtp' ? (sender.smtpSecure ? 'SSL/TLS' : 'StartTLS') : 'OAuth2'})</p>
                            </div>

                            {sender.type === 'smtp' && (
                                <div className="col-span-1 md:col-span-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('modals.details.sender_info.user')}</p>
                                    <p className="text-sm font-bold text-slate-700">{sender.smtpUsername || sender.smtpUser || sender.email}</p>
                                </div>
                            )}

                            {sender.type !== 'smtp' && (
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('modals.details.sender_info.auth_method')}</p>
                                    <p className="text-sm font-bold text-blue-600 uppercase tracking-tight">{t('modals.details.sender_info.oauth_token')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {(sender.type === 'smtp' || sender.imapHost) && (
                        <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-emerald-500" />
                                {t('modals.details.sender_info.incoming')}
                            </h4>
                            <div className="premium-card p-6 bg-slate-50 border-none shadow-none grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('modals.details.sender_info.imap_host')}</p>
                                    <p className="text-sm font-bold text-slate-700">{sender.imapHost || t('common.default_auto')}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('modals.details.sender_info.imap_port_security')}</p>
                                    <p className="text-sm font-bold text-slate-700">{sender.imapPort || '993'} ({sender.imapSecure !== false ? 'SSL/TLS' : t('common.non_secure')})</p>
                                </div>

                                {sender.type === 'smtp' && (
                                    <div className="col-span-1 md:col-span-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('modals.details.sender_info.imap_user')}</p>
                                        <p className="text-sm font-bold text-slate-700">{sender.imapUsername || sender.imapUser || sender.smtpUsername || sender.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>



                {/* Footer Actions */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                    <Button
                        onClick={() => handleDeleteSender(sender)}
                        variant="ghost"
                        className="px-6 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2"
                        disabled={isDeletingSender}
                    >
                        <Trash2 className="w-4 h-4" />
                        {t('modals.details.sender_info.delete_account')}
                    </Button>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            {t('common.close')}
                        </button>
                        <Button
                            onClick={() => handleTestSender(sender.id)}
                            variant="primary"
                            className="px-10 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all flex items-center gap-3"
                            disabled={isTestingSender}
                        >
                            {isTestingSender ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {t('modals.sender.btn.test')}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ShowSenderDetails;
