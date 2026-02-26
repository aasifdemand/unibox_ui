import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, AlertCircle, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CampaignStepper from './components/create-campaign/campaign-stepper';
import Step1Design from './components/create-campaign/design-step';
import Step2Audience from './components/create-campaign/audience';
import Step3Finalize from './components/create-campaign/finalize-step';

// Import React Query hooks
import { useCreateCampaign } from '../../../hooks/useCampaign';
import { useSenders } from '../../../hooks/useSenders';
import { useBatches } from '../../../hooks/useBatches';
import { unescapeHtml } from '../../../utils/html-utils';

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

const CreateCampaign = () => {
  const navigate = useNavigate();
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
    refetchSenders();
    refetchBatches();
  }, [refetchSenders, refetchBatches]);

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
    // Don't proceed if we're already on the last step or if a campaign is being created
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
      // Make sure we're not accidentally submitting the form
      e?.preventDefault?.();
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      navigate('/dashboard/campaigns');
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast.error(t('campaigns.err_create_failed', { message: error.message }));
    }
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
      navigate,
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
            <Step2Audience {...stepProps} />
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
            <Step1Design {...stepProps} />
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
            <Step3Finalize {...stepProps} />
          </motion.div>
        );
      default:
        return <Step2Audience {...stepProps} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 md:p-12 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Simplified Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                {watch('name') || t('campaigns.create_campaign')}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {t('campaigns.step_indicator', { current: currentStep, total: steps.length })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/campaigns')}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>

        {/* Horizontal Stepper */}
        <div className="py-4">
          <CampaignStepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Main Content Area */}
        <div className="space-y-8">
          {createCampaign.error && (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl animate-in bounce-in duration-500">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-rose-500" />
                <div>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                    {t('common.error')}
                  </p>
                  <p className="text-sm font-bold text-rose-700">{createCampaign.error.message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 p-10 relative overflow-hidden">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative z-10"
              onKeyDown={(e) => {
                // Prevent form submission on Enter key unless we're on the final step
                if (e.key === 'Enter' && currentStep < steps.length) {
                  e.preventDefault();
                }
              }}
            >
              <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

              <div className="flex items-center justify-between pt-12 mt-12 border-t border-slate-100">
                <div className="min-w-35">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={createCampaign.isPending}
                      className="px-8 py-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-slate-400 transition-all disabled:opacity-50 shadow-sm"
                    >
                      {t('common.back')}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={createCampaign.isPending}
                      className="px-10 py-5 bg-linear-to-r from-indigo-600 to-blue-700 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {t('campaigns.continue_to', { step: steps[currentStep]?.title || t('campaigns.next_step') })}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={createCampaign.isPending}
                      className="px-12 py-5 bg-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
