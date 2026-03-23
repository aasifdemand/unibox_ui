import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Zap, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CampaignStepper from './components/create-campaign/campaign-stepper';
import Step1Design from './components/create-campaign/design-step';
import ImportLeadsStep from './components/create-campaign/import-leads-step';
import SetupStep from './components/create-campaign/setup-step';
import Step3Finalize from './components/create-campaign/finalize-step';

// Import React Query hooks
import { useCreateCampaign, useUpdateCampaign, useCampaign } from '../../../hooks/useCampaign';
import { useSenders } from '../../../hooks/useSenders';
import { useBatches } from '../../../hooks/useBatches';
import { unescapeHtml } from '../../../utils/html-utils';

const getCampaignSchema = (t) =>
  z
    .object({
      name: z.string().min(3, t('campaigns.err_name_min')).max(100),
      subject: z.string().min(5, t('campaigns.err_subject_min')).max(150),
      previewText: z.string().max(200, t('campaigns.err_preview_too_long')).optional(),
      htmlBody: z.string().optional(),
      textBody: z.string().optional(),
      senderId: z.string().optional(),
      senderIds: z.array(z.string()).min(1, t('campaigns.no_sender_selected')),
      senderType: z.enum(['gmail', 'outlook', 'smtp']),
      listBatchId: z.string().min(1, t('campaigns.no_list_selected')),
      scheduleType: z.enum(['now', 'later']),
      scheduledAt: z.string().optional(),
      timezone: z.string().default('UTC'),
      throttlePerMinute: z.number().min(1).max(100).default(10),
      trackOpens: z.boolean().default(true),
      trackClicks: z.boolean().default(true),
      unsubscribeLink: z.boolean().default(true),
      sendingDays: z
        .array(z.string())
        .default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
      startTime: z.string().default('09:00'),
      endTime: z.string().default('18:00'),
      sendingInterval: z.number().min(1).default(20),
      maxLeadsPerDay: z.number().min(1).default(100),
      startDate: z.string().optional().nullable(),
      steps: z
        .array(
          z.object({
            stepOrder: z.number(),
            subject: z.string().min(5, t('campaigns.err_subject_min')).max(150),
            htmlBody: z.string().min(1, t('campaigns.err_content_req')),
            textBody: z.string().optional(),
            delayMinutes: z.number().min(1),
            condition: z.enum(['always', 'no_reply']),
          }),
        )
        .optional(),
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

  const { t } = useTranslation();
  const campaignSchema = React.useMemo(() => getCampaignSchema(t), [t]);

  // React Query hooks
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const {
    data: senderResponse = { data: [] },
    isLoading: isLoadingSenders,
    refetch: refetchSenders,
  } = useSenders({ limit: 1000 });

  const senders = senderResponse.data || [];

  const {
    data: batches = [],
    isLoading: isLoadingBatches,
    refetch: refetchBatches,
  } = useBatches(1, 20);

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
      name: 'Untitled Campaign',
      scheduleType: 'now',
      throttlePerMinute: 10,
      trackOpens: true,
      trackClicks: true,
      unsubscribeLink: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sendingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: '09:00',
      endTime: '18:00',
      sendingInterval: 20,
      maxLeadsPerDay: 100,
      htmlBody: '',
      textBody: '',
      steps: [],
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = {
      1: ['listBatchId'],
      2: ['subject', 'htmlBody', 'steps'],
      3: [
        'senderId',
        'senderType',
        'sendingDays',
        'startTime',
        'endTime',
        'sendingInterval',
        'maxLeadsPerDay',
      ],
    };

    const isStepValid = await trigger(fieldsToValidate[currentStep]);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const watchScheduleType = watch('scheduleType');
  const watchHtmlBody = watch('htmlBody');

  const watchListBatchId = watch('listBatchId');
  const watchSenderId = watch('senderId');
  const watchSenderIds = watch('senderIds') || [];

  // Fetch data on mount
  useEffect(() => {
    refetchSenders();
    refetchBatches();
  }, [refetchSenders, refetchBatches]);

  const verifiedBatches = React.useMemo(() => {
    if (!Array.isArray(batches)) return [];
    // Broadened filter to include more statuses and batches with valid records
    return batches.filter(
      (batch) =>
        ['verified', 'completed', 'valid', 'uploaded', 'parsing'].includes(batch.status) ||
        batch.validRecords > 0,
    );
  }, [batches]);

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

  // Fetch campaign data if editing
  const { id: editId } = useParams();
  const { data: campaignToEdit, isLoading: isLoadingEditing } = useCampaign(editId);

  useEffect(() => {
    if (campaignToEdit && editId) {
      // Pre-fill form
      setValue('name', campaignToEdit.name);
      setValue('subject', campaignToEdit.subject);
      setValue('htmlBody', campaignToEdit.htmlBody);
      setValue('previewText', campaignToEdit.previewText || '');
      setValue('senderId', campaignToEdit.senderId);
      setValue('senderType', campaignToEdit.senderType);
      setValue('listBatchId', campaignToEdit.listBatchId);
      setValue('timezone', campaignToEdit.timezone);
      setValue('throttlePerMinute', campaignToEdit.throttlePerMinute);
      setValue('trackOpens', campaignToEdit.trackOpens);
      setValue('trackClicks', campaignToEdit.trackClicks);
      setValue('unsubscribeLink', campaignToEdit.unsubscribeLink);
      setValue(
        'sendingDays',
        campaignToEdit.sendingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      );
      setValue('startTime', campaignToEdit.startTime || '09:00');
      setValue('endTime', campaignToEdit.endTime || '18:00');
      setValue('sendingInterval', campaignToEdit.sendingInterval || 20);
      setValue('maxLeadsPerDay', campaignToEdit.maxLeadsPerDay || 100);
      setValue('startDate', campaignToEdit.startDate);

      if (campaignToEdit.CampaignSteps) {
        const followUps = campaignToEdit.CampaignSteps.filter((s) => s.stepOrder > 0).map((s) => ({
          stepOrder: s.stepOrder,
          subject: s.subject,
          htmlBody: s.htmlBody,
          textBody: s.textBody || '',
          delayMinutes: s.delayMinutes,
          condition: s.condition,
        }));
        setValue('steps', followUps);
      }

      // Also set selected state for UI
      if (verifiedBatches.length > 0) {
        const batch = verifiedBatches.find((b) => b.id === campaignToEdit.listBatchId);
        if (batch) setSelectedBatch(batch);
      }
      if (senders.length > 0) {
        const sender = senders.find((s) => s.id === campaignToEdit.senderId);
        if (sender) setSelectedSender(sender);
      }
    }
  }, [campaignToEdit, editId, setValue, verifiedBatches, senders]);

  const steps = [
    { number: 1, title: 'Import Leads', description: 'Who are you reaching out to?' },
    { number: 2, title: 'Sequences', description: 'Write your emails' },
    { number: 3, title: 'Setup', description: 'Configure sending' },
    { number: 4, title: 'Final Review', description: 'Confirm and launch' },
  ];

  if (isLoadingEditing && editId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

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
      if (data.htmlBody) {
        data.textBody = data.htmlBody.replace(/<[^>]*>/g, ' ');
        data.htmlBody = unescapeHtml(data.htmlBody);
      }

      let scheduledAt = data.startDate || null;
      if (scheduledAt && data.startTime) {
        scheduledAt = `${scheduledAt}T${data.startTime}:00`;
      }

      const campaignData = {
        ...data,
        scheduledAt: scheduledAt,
      };

      if (editId) {
        await updateCampaign.mutateAsync({
          campaignId: editId,
          ...campaignData,
        });
        toast.success(t('campaigns.msg_campaign_updated'));
      } else {
        await createCampaign.mutateAsync(campaignData);
        toast.success(t('campaigns.msg_campaign_created'));
      }

      navigate('/dashboard/campaigns');
    } catch (error) {
      console.error('Failed to save campaign:', error);
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
      watchScheduleType,
      watchListBatchId,
      watchSenderId,
      watchSenderIds,
      isEdit: !!editId,
    };

    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ImportLeadsStep {...stepProps} />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Step1Design {...stepProps} />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SetupStep {...stepProps} />
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Step3Finalize {...stepProps} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Premium Sticky Top Header */}
      <header className="flex items-center justify-between px-8 h-20 border-b border-slate-100/80 sticky top-0 bg-white/80  z-50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="w-10 h-10 rounded-md hover:bg-slate-50 flex items-center justify-center transition-colors group"
          >
            <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
          </button>

          <div className="h-8 w-px bg-slate-200" />

          <div className="flex flex-col">
            <input
              type="text"
              {...register('name')}
              className="bg-transparent border-none p-0 text-lg font-bold text-slate-800 focus:ring-0 placeholder:text-slate-300 w-[240px]"
              placeholder="Campaign Name"
            />
          </div>
        </div>

        {/* Stepper Center */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 w-full max-w-[800px]">
          <CampaignStepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Actions Right */}
        <div className="flex items-center gap-4">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-2.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
            >
              Back
            </button>
          )}

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-orange-600 rounded-md text-[11px] font-bold text-white shadow-sm shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-0.5 transition-all"
            >
              Save & Next
            </button>
          ) : (
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={createCampaign.isPending}
              className="px-10 py-3 bg-orange-600 rounded-md text-[11px] font-bold text-white shadow-sm shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              {createCampaign.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {editId ? 'Update Campaign' : 'Launch Campaign'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={`flex-1 overflow-y-auto bg-slate-50/10 flex flex-col ${currentStep === 2 ? '' : 'items-center'}`}
      >
        <div className={`w-full ${currentStep === 2 ? 'max-w-none' : 'max-w-[1500px] px-8 py-12'}`}>
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default CreateCampaign;
