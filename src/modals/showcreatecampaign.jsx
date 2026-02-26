import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import {
    Send,
    Sparkles,
    AlertCircle,
    Loader2,
    Zap,
    X,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
} from 'lucide-react';

import Modal from '../components/shared/modal';
import Button from '../components/ui/button';
import CampaignStepper from '../routes/dashboard/campaigns/components/create-campaign/campaign-stepper';
import DesignStep from '../routes/dashboard/campaigns/components/create-campaign/design-step';
import AudienceStep from '../routes/dashboard/campaigns/components/create-campaign/audience';
import FinalizeStep from '../routes/dashboard/campaigns/components/create-campaign/finalize-step';

// Import React Query hooks
import { useCreateCampaign } from '../hooks/useCampaign';
import { useSenders } from '../hooks/useSenders';
import { useBatches } from '../hooks/useBatches';
import { unescapeHtml } from '../utils/html-utils';

const getCampaignSchema = (t) => z
    .object({
        name: z.string().min(3, t('campaigns.err_name_min')).max(100),
        subject: z.string().min(5, t('campaigns.err_subject_min')).max(150),
        previewText: z.string().max(200, t('campaigns.err_preview_too_long')).optional(),
        htmlBody: z.string().optional(),
        textBody: z.string().optional(),
        senderId: z.string().min(1, t('campaigns.no_sender_selected')),
        senderType: z.enum(['gmail', 'outlook', 'smtp']),
        listBatchId: z.string().min(1, t('campaigns.no_list_selected')),
        scheduleType: z.enum(['now', 'later']),
        scheduledAt: z.string().optional(),
        timezone: z.string().default('UTC'),
        throttlePerMinute: z.number().min(1).max(100).default(10),
        trackOpens: z.boolean().default(true),
        trackClicks: z.boolean().default(true),
        unsubscribeLink: z.boolean().default(true),
    })
    .refine(
        (data) => {
            // Custom validation: Either htmlBody or textBody must be provided
            return data.htmlBody?.trim().length > 0 || data.textBody?.trim().length > 0;
        },
        {
            message: t('campaigns.err_content_req'),
            path: ['htmlBody'],
        },
    );

const ShowCreateCampaign = ({ showModal, setShowModal }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedSender, setSelectedSender] = useState(null);
    const [editorMode, setEditorMode] = useState('html');
    const { t } = useTranslation();
    const campaignSchema = React.useMemo(() => getCampaignSchema(t), [t]);

    // React Query hooks
    const createCampaign = useCreateCampaign();
    const {
        data: senderResponse = { data: [] },
        isLoading: isLoadingSenders,
        refetch: refetchSenders,
    } = useSenders({ limit: 1000 });

    const senders = senderResponse.data || [];

    const { data: batches = [], isLoading: isLoadingBatches, refetch: refetchBatches } = useBatches();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        trigger,
        reset,
    } = useForm({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            scheduleType: 'now',
            throttlePerMinute: 10,
            trackOpens: true,
            trackClicks: true,
            unsubscribeLink: true,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            htmlBody: '',
            textBody: '',
        },
    });

    const watchScheduleType = watch('scheduleType');
    const watchHtmlBody = watch('htmlBody');
    const watchTextBody = watch('textBody');
    const watchListBatchId = watch('listBatchId');
    const watchSenderId = watch('senderId');

    // Fetch data on mount
    useEffect(() => {
        if (showModal) {
            refetchSenders();
            refetchBatches();
        }
    }, [showModal, refetchSenders, refetchBatches]);

    const verifiedBatches = batches.filter((batch) => batch.status === 'verified');

    const handleBatchSelect = (batchId) => {
        const batch = verifiedBatches.find((b) => b.id === batchId);
        setSelectedBatch(batch);
        setValue('listBatchId', batchId, { shouldValidate: true });
    };

    const handleSenderSelect = (senderId, senderType) => {
        const sender = senders.find((s) => s.id === senderId);
        setSelectedSender(sender);
        setValue('senderId', senderId, { shouldValidate: true });
        setValue('senderType', senderType, { shouldValidate: true });
    };

    const steps = [
        { number: 1, title: t('campaigns.step_contacts'), description: t('campaigns.step_contacts_desc') },
        {
            number: 2,
            title: t('campaigns.step_content'),
            description: t('campaigns.step_content_desc'),
        },
        { number: 3, title: t('campaigns.step_review'), description: t('campaigns.step_review_desc') },
    ];

    const nextStep = async (e) => {
        if (currentStep >= steps.length || createCampaign.isPending) {
            return;
        }

        let isValid = false;

        switch (currentStep) {
            case 1: // Audience validation
                isValid = await trigger(['senderId', 'listBatchId']);
                break;
            case 2: {
                // Design validation (Name + Subject)
                const infoValid = await trigger(['name', 'subject']);
                if (!infoValid) return;

                // Content validation
                if (editorMode === 'html') {
                    if (!watchHtmlBody || watchHtmlBody.trim().length < 10) {
                        setValue('htmlBody', watchHtmlBody || '');
                        await trigger('htmlBody');
                        isValid = false;
                    } else {
                        isValid = true;
                    }
                } else {
                    if (!watchTextBody || watchTextBody.trim().length < 10) {
                        setValue('textBody', watchTextBody || '');
                        await trigger('textBody');
                        isValid = false;
                    } else {
                        isValid = true;
                    }
                }

                const hasContent =
                    editorMode === 'html'
                        ? watchHtmlBody && watchHtmlBody.trim().length > 0
                        : watchTextBody && watchTextBody.trim().length > 0;

                if (!hasContent) {
                    toast.error(
                        t('campaigns.error_add_content', { mode: editorMode === 'html' ? 'HTML' : t('campaigns.plain_text') }),
                    );
                    return;
                }
                break;
            }
            default:
                isValid = true;
        }

        if (isValid && currentStep < steps.length) {
            e?.preventDefault?.();
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (!data.listBatchId) {
                toast.error(t('campaigns.no_list_selected'));
                return;
            }

            if (!data.senderId || !data.senderType) {
                toast.error(t('campaigns.no_sender_selected'));
                return;
            }

            // Ensure we have content
            if (editorMode === 'text' && data.textBody && !data.htmlBody) {
                data.htmlBody = `<pre style="font-family: monospace; white-space: pre-wrap;">${data.textBody}</pre>`;
            } else if (editorMode === 'html' && data.htmlBody && !data.textBody) {
                data.textBody = data.htmlBody.replace(/<[^>]*>/g, ' ');
            }

            if (data.htmlBody) {
                data.htmlBody = unescapeHtml(data.htmlBody);
            }

            const campaignData = {
                ...data,
                scheduledAt: data.scheduleType === 'later' ? data.scheduledAt : null,
            };

            await createCampaign.mutateAsync(campaignData);

            toast.success(t('campaigns.msg_campaign_created'));
            handleClose();
        } catch (error) {
            console.error('Failed to create campaign:', error);
            toast.error(t('campaigns.err_create_failed', { message: error.message }));
        }
    };

    const handleClose = () => {
        setShowModal(false);
        reset();
        setCurrentStep(1);
        setSelectedBatch(null);
        setSelectedSender(null);
    };

    const renderStepContent = () => {
        const stepProps = {
            register,
            errors,
            watch,
            setValue,
            selectedBatch,
            selectedSender,
            verifiedBatches,
            senders,
            isLoadingBatches,
            isLoadingSenders,
            handleBatchSelect,
            handleSenderSelect,
            editorMode,
            setEditorMode,
            watchScheduleType,
            watchListBatchId,
            watchSenderId,
        };

        switch (currentStep) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AudienceStep {...stepProps} />
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <DesignStep {...stepProps} />
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <FinalizeStep {...stepProps} />
                    </motion.div>
                );
            default:
                return <AudienceStep {...stepProps} />;
        }
    };

    return (
        <Modal
            isOpen={showModal}
            onClose={handleClose}
            maxWidth="max-w-6xl"
            closeOnBackdrop={true}
        >
            <div className="relative bg-white flex flex-col h-full max-h-[90vh]">
                {/* Consistent Header */}
                <div className="px-8 py-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Send className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tighter">
                                    {watch('name') || t('campaigns.create_campaign')}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        {t('campaigns.step_indicator', { current: currentStep, total: steps.length })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Steps Navigation for Header */}
                        <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                            {steps.map((step) => {
                                const isActive = currentStep === step.number;
                                const isCompleted = currentStep > step.number;

                                return (
                                    <button
                                        key={step.number}
                                        disabled={!isCompleted && !isActive}
                                        onClick={() => isCompleted && setCurrentStep(step.number)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isActive
                                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                                            : isCompleted
                                                ? 'text-emerald-600 hover:bg-emerald-50'
                                                : 'text-slate-300 opacity-50 cursor-not-allowed'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <span className="w-4 h-4 flex items-center justify-center text-[10px] font-black border-2 border-current rounded-full">
                                                {step.number}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest hidden lg:block">
                                            {step.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-8 md:px-12 md:py-10">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {createCampaign.error && (
                            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                                        <AlertCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                                            {t('common.error')}
                                        </p>
                                        <p className="text-sm font-bold text-rose-700">{createCampaign.error.message}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 p-10 relative overflow-hidden backdrop-blur-sm">
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="relative z-10"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && currentStep < steps.length) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Improved Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-all"
                    >
                        {t('common.cancel')}
                    </button>

                    <div className="flex items-center gap-3">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={createCampaign.isPending}
                                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 hover:border-slate-300 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {t('common.back')}
                            </button>
                        )}

                        {currentStep < steps.length ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                disabled={createCampaign.isPending}
                                variant="primary"
                                className="px-10 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                            >
                                {t('common.continue')}
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <button
                                onClick={handleSubmit(onSubmit)}
                                disabled={createCampaign.isPending}
                                className="px-12 py-3 bg-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                            >
                                {createCampaign.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Zap className="w-5 h-5" />
                                )}
                                {createCampaign.isPending ? t('campaigns.creating_campaign') : t('campaigns.create_campaign_btn')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ShowCreateCampaign;
