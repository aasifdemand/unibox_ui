import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Mail,
    Clock,
    Gauge,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Check,
    Zap,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import Input from '../../../../../components/ui/input';
import { Gmail } from '../../../../../icons/gmail';
import { MicrosoftOutlook } from '../../../../../icons/outlook';
import { Smtp } from '../../../../../icons/smtp';

const SetupStep = ({
    register,
    errors,
    watch,
    senders = [],
    isLoadingSenders,
    handleSenderSelect,
    watchSenderId,
    watchScheduleType,
}) => {
    const { t } = useTranslation();

    // Pagination for senders (Simplified for this component)
    const [sendersPage, setSendersPage] = React.useState(1);
    const sendersPerPage = 6;
    const totalSendersPages = Math.ceil(senders.length / sendersPerPage);

    const currentSenders = React.useMemo(() => {
        const indexOfLastSender = sendersPage * sendersPerPage;
        const indexOfFirstSender = indexOfLastSender - sendersPerPage;
        return senders.slice(indexOfFirstSender, indexOfLastSender);
    }, [senders, sendersPage]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Sender Selection */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">
                                Choose Sending Account
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                Select which account will deliver these emails
                            </p>
                        </div>
                    </div>

                    {totalSendersPages > 1 && (
                        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            <button
                                type="button"
                                disabled={sendersPage === 1}
                                onClick={() => setSendersPage((p) => p - 1)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 group shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                            <span className="text-[10px] font-black text-slate-500 px-2 uppercase tracking-widest">
                                {sendersPage} / {totalSendersPages}
                            </span>
                            <button
                                type="button"
                                disabled={sendersPage === totalSendersPages}
                                onClick={() => setSendersPage((p) => p + 1)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 group shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>

                {isLoadingSenders ? (
                    <div className="py-20 bg-slate-50/20 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-blue-500/20 animate-spin" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-6">
                            Indexing Mailboxes...
                        </p>
                    </div>
                ) : senders.length === 0 ? (
                    <div className="py-16 text-center bg-slate-50/20 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-xs font-black text-slate-800 uppercase tracking-widest mb-2">No mailboxes connected</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Connect an account in settings to proceed</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentSenders.map((sender) => {
                            const isSelected = watchSenderId === sender.id;
                            const sType = (sender.senderType || sender.type || 'smtp').toLowerCase();

                            return (
                                <div
                                    key={sender.id}
                                    onClick={() => handleSenderSelect(sender.id, sType)}
                                    className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer flex items-center gap-5 ${isSelected
                                        ? 'border-blue-500 bg-white shadow-xl ring-8 ring-blue-500/5 -translate-y-1'
                                        : 'border-slate-100 bg-white hover:border-blue-200 hover:-translate-y-0.5'
                                        }`}
                                >
                                    <div
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${isSelected
                                            ? 'bg-blue-600'
                                            : 'bg-slate-50'
                                            }`}
                                    >
                                        {sType === 'gmail' ? (
                                            <Gmail className="w-8 h-8" />
                                        ) : sType === 'outlook' ? (
                                            <MicrosoftOutlook className="w-8 h-8" />
                                        ) : (
                                            <Smtp className="w-8 h-8" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[11px] font-black uppercase tracking-tight truncate mb-0.5 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                                            {sender.displayName}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-widest">
                                            {sender.email}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-white">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                {/* Schedule */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                            Schedule Campaign
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'now', title: t('campaigns.send_now'), desc: t('campaigns.process_immediately'), icon: Zap },
                            { id: 'later', title: t('campaigns.schedule_later'), desc: t('campaigns.choose_time'), icon: Timer }
                        ].map((option) => (
                            <label
                                key={option.id}
                                className={`group relative flex items-center p-5 bg-white border-2 rounded-4xl cursor-pointer transition-all duration-300 hover:border-blue-200 ${watch('scheduleType') === option.id ? 'border-blue-500 bg-blue-50/20 ring-4 ring-blue-500/5' : 'border-slate-100'}`}
                            >
                                <input
                                    type="radio"
                                    {...register('scheduleType')}
                                    value={option.id}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-colors ${watch('scheduleType') === option.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    <option.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{option.title}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{option.desc}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${watch('scheduleType') === option.id ? 'border-blue-600' : 'border-slate-200'}`}>
                                    {watch('scheduleType') === option.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                </div>
                            </label>
                        ))}
                    </div>

                    {watchScheduleType === 'later' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 bg-blue-50/30 border-2 border-dashed border-blue-100 rounded-[2.5rem] space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-blue-50">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Set Release Time</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">When should we start sending?</p>
                                </div>
                            </div>

                            <Input
                                type="datetime-local"
                                {...register('scheduledAt')}
                                error={errors.scheduledAt?.message}
                                required
                                className="rounded-2xl border-2 border-white focus:border-blue-500 py-4 shadow-sm"
                            />
                        </motion.div>
                    )}
                </div>

                {/* Options */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Gauge className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                            Advanced Settings
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label={t('campaigns.sending_rate')}
                            type="number"
                            {...register('throttlePerMinute', { valueAsNumber: true })}
                            error={errors.throttlePerMinute?.message}
                            helperText={t('campaigns.sending_rate_hint')}
                            className="rounded-2xl border-2 border-slate-100 focus:border-blue-500 py-4"
                        />

                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Optimization Engine</span>
                            </div>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase leading-relaxed tracking-widest">
                                We automatically randomize sending intervals and headers to bypass spam filters and maintain high sender reputation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Timer icon since it wasn't imported from lucide
const Timer = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="10" x2="14" y1="2" y2="2" /><line x1="12" x2="15" y1="14" y2="11" /><circle cx="12" cy="14" r="8" /></svg>
);

export default SetupStep;
