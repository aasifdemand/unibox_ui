import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Loader2, Zap, ChevronLeft } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import CampaignStepper from './components/create-campaign/campaign-stepper';
import Input from '../../../components/ui/input';

// Import React Query hooks
import { useCreateCampaign, useUpdateCampaign, useCampaign } from '../../../hooks/useCampaign';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useSenders } from '../../../hooks/useSenders';
import { useBatches } from '../../../hooks/useBatches';
import { unescapeHtml } from '../../../utils/html-utils';
import { convertLocalToUTC, detectedTZ, getSmartDefaults, steps } from './utils';
import RenderStep from './components/create-campaign/render-step';
import { getCampaignSchema } from './schemas/campaign.schema';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: editId } = useParams(); // moved up — needed before useEffect below
  const [currentStep, setCurrentStep] = useState(1);

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

  const senders = React.useMemo(() => senderResponse?.data || [], [senderResponse]);

  const {
    data: batches = [],
    isLoading: isLoadingBatches,
    refetch: refetchBatches,
  } = useBatches(1, 20);

  const { data: currentUser } = useCurrentUser();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    control,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: (() => {
      // Compute fresh on every mount — avoids stale time from module load
      const d = getSmartDefaults(detectedTZ);
      return {
        name: location.state?.campaignName || 'Untitled Campaign',
        scheduleType: 'now',
        throttlePerMinute: 10,
        trackOpens: true,
        trackClicks: true,
        unsubscribeLink: true,
        timezone: detectedTZ,
        sendingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: d.startTime,
        endTime: d.endTime,
        startDate: d.dateStr,
        sendingInterval: 20,
        maxLeadsPerDay: 100,
        htmlBody: '',
        textBody: '',
        steps: [],
      };
    })(),
  });

  // Once the user profile loads, re-apply scheduling defaults using their saved timezone.
  // Uses keepValues so fields the user has already touched are not overwritten.
  useEffect(() => {
    if (!currentUser?.timezone || editId) return; // skip for edit mode — we load from DB
    const userTZ = currentUser.timezone;
    const d = getSmartDefaults(userTZ);
    // RHF reset() requires a plain values object — not a callback function.
    // Use getValues() to spread existing values and only override scheduling fields.
    reset(
      {
        ...getValues(),
        timezone: userTZ,
        startTime: d.startTime,
        endTime: d.endTime,
        startDate: d.dateStr,
      },
      { keepDirtyValues: true }, // don't overwrite fields the user has already changed
    );
  }, [currentUser?.timezone, editId, reset, getValues]);

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

  const watchScheduleType = useWatch({ control, name: 'scheduleType' });
  const watchListBatchId = useWatch({ control, name: 'listBatchId' });
  const watchSenderId = useWatch({ control, name: 'senderId' });
  const watchSenderIds = useWatch({ control, name: 'senderIds' }) || [];

  // Fetch data on mount
  useEffect(() => {
    refetchSenders();
    refetchBatches();

    // If name was passed from quick create modal, set it
    if (location.state?.campaignName) {
      setValue('name', location.state.campaignName);
    }
  }, [refetchSenders, refetchBatches, location.state, setValue]);

  const verifiedBatches = React.useMemo(() => {
    if (!Array.isArray(batches)) return [];
    // Broadened filter to include more statuses and batches with valid records
    return batches.filter(
      (batch) =>
        ['verified', 'completed', 'valid', 'uploaded', 'parsing'].includes(batch.status) ||
        batch.validRecords > 0,
    );
  }, [batches]);

  const selectedBatch = React.useMemo(() => {
    const batchId = watchListBatchId;
    return verifiedBatches.find((b) => b.id === batchId) || null;
  }, [watchListBatchId, verifiedBatches]);

  const selectedSender = React.useMemo(() => {
    const senderId = watchSenderId;
    return senders.find((s) => s.id === senderId) || null;
  }, [watchSenderId, senders]);

  const handleBatchSelect = (batchId) => {
    setValue('listBatchId', batchId, { shouldValidate: true });
  };

  const handleSenderSelect = (senderId, senderType) => {
    setValue('senderId', senderId, { shouldValidate: true });
    setValue('senderType', senderType, { shouldValidate: true });
  };

  // Fetch campaign data if editing
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
    }
  }, [campaignToEdit, editId, setValue]);

  if (isLoadingEditing && editId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
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

      let scheduledAt = null;
      if (data.startDate && data.startTime) {
        // Convert the wall-clock time in the campaign timezone → proper UTC ISO string
        scheduledAt = convertLocalToUTC(data.startDate, data.startTime, data.timezone || 'UTC');
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

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm">
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
            <Input
              type="text"
              {...register('name')}
              className="h-10 border-slate-200 bg-white rounded-xl text-base font-extrabold text-slate-800 focus:border-purple-500 w-[280px]"
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
              className="px-8 py-3 bg-purple-600 rounded-md text-[11px] font-bold text-white shadow-sm shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 transition-all"
            >
              Save & Next
            </button>
          ) : (
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={createCampaign.isPending}
              className="px-10 py-3 bg-purple-600 rounded-md text-[11px] font-bold text-white shadow-sm shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
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
          <AnimatePresence mode="wait">
            <RenderStep stepProps={stepProps} currentStep={currentStep} />
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default CreateCampaign;
