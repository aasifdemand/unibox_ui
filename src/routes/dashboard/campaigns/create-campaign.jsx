import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles, AlertCircle, Loader2, Zap } from "lucide-react";
import CampaignStepper from "./components/create-campaign/campaign-stepper";
import Step1Design from "./components/create-campaign/design-step";
import Step2Audience from "./components/create-campaign/audience";
import Step3Finalize from "./components/create-campaign/finalize-step";
import Button from "../../../components/ui/button";

// Import React Query hooks
import { useCreateCampaign } from "../../../hooks/useCampaign";
import { useSenders } from "../../../hooks/useSenders";
import { useBatches } from "../../../hooks/useBatches";
import { unescapeHtml } from "../../../utils/html-utils";

const campaignSchema = z
  .object({
    name: z
      .string()
      .min(3, "Campaign name must be at least 3 characters")
      .max(100),
    subject: z
      .string()
      .min(5, "Subject must be at least 5 characters")
      .max(150),
    previewText: z.string().max(200, "Preview text is too long").optional(),
    htmlBody: z.string().optional(),
    textBody: z.string().optional(),
    senderId: z.string().min(1, "Please select a sender"),
    senderType: z.enum(["gmail", "outlook", "smtp"]),
    listBatchId: z.string().min(1, "Please select a recipient list"),
    scheduleType: z.enum(["now", "later"]),
    scheduledAt: z.string().optional(),
    timezone: z.string().default("UTC"),
    throttlePerMinute: z.number().min(1).max(100).default(10),
    trackOpens: z.boolean().default(true),
    trackClicks: z.boolean().default(true),
    unsubscribeLink: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Custom validation: Either htmlBody or textBody must be provided
      return (
        data.htmlBody?.trim().length > 0 || data.textBody?.trim().length > 0
      );
    },
    {
      message: "Email content is required",
      path: ["htmlBody"],
    },
  );

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSender, setSelectedSender] = useState(null);
  const [editorMode, setEditorMode] = useState("html");

  // React Query hooks
  const createCampaign = useCreateCampaign();
  const {
    data: senders = [],
    isLoading: isLoadingSenders,
    refetch: refetchSenders,
  } = useSenders();

  const {
    data: batches = [],
    isLoading: isLoadingBatches,
    refetch: refetchBatches,
  } = useBatches();

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
      scheduleType: "now",
      throttlePerMinute: 10,
      trackOpens: true,
      trackClicks: true,
      unsubscribeLink: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      htmlBody: "",
      textBody: "",
    },
  });

  const watchScheduleType = watch("scheduleType");
  const watchHtmlBody = watch("htmlBody");
  const watchTextBody = watch("textBody");
  const watchListBatchId = watch("listBatchId");
  const watchSenderId = watch("senderId");

  // Fetch data on mount
  useEffect(() => {
    refetchSenders();
    refetchBatches();
  }, [refetchSenders, refetchBatches]);

  const verifiedBatches = batches.filter(
    (batch) => batch.status === "verified",
  );

  const handleBatchSelect = (batchId) => {
    const batch = verifiedBatches.find((b) => b.id === batchId);
    setSelectedBatch(batch);
    setValue("listBatchId", batchId, { shouldValidate: true });
  };

  const handleSenderSelect = (senderId, senderType) => {
    const sender = senders.find((s) => s.id === senderId);
    setSelectedSender(sender);
    setValue("senderId", senderId, { shouldValidate: true });
    setValue("senderType", senderType, { shouldValidate: true });
  };

  const steps = [
    { number: 1, title: "Contacts", description: "Who are you emailing?" },
    {
      number: 2,
      title: "Content",
      description: "Write your email",
    },
    { number: 3, title: "Review", description: "Final check & launch" },
  ];

  const nextStep = async (e) => {
    // Don't proceed if we're already on the last step or if a campaign is being created
    if (currentStep >= steps.length || createCampaign.isPending) {
      return;
    }

    let isValid = false;

    switch (currentStep) {
      case 1: // Audience validation
        isValid = await trigger(["senderId", "listBatchId"]);
        break;
      case 2: {
        // Design validation (Name + Subject)
        const infoValid = await trigger(["name", "subject"]);
        if (!infoValid) return;

        // Content validation
        if (editorMode === "html") {
          if (!watchHtmlBody || watchHtmlBody.trim().length < 10) {
            setValue("htmlBody", watchHtmlBody || "");
            await trigger("htmlBody");
            isValid = false;
          } else {
            isValid = true;
          }
        } else {
          if (!watchTextBody || watchTextBody.trim().length < 10) {
            setValue("textBody", watchTextBody || "");
            await trigger("textBody");
            isValid = false;
          } else {
            isValid = true;
          }
        }

        const hasContent =
          editorMode === "html"
            ? watchHtmlBody && watchHtmlBody.trim().length > 0
            : watchTextBody && watchTextBody.trim().length > 0;

        if (!hasContent) {
          alert(
            `Please add some content to your ${editorMode === "html" ? "HTML" : "plain text"} email before proceeding.`,
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!data.listBatchId) {
        alert("Please select a recipient list");
        return;
      }

      if (!data.senderId || !data.senderType) {
        alert("Please select a sender");
        return;
      }

      // Ensure we have content
      if (editorMode === "text" && data.textBody && !data.htmlBody) {
        data.htmlBody = `<pre style="font-family: monospace; white-space: pre-wrap;">${data.textBody}</pre>`;
      } else if (editorMode === "html" && data.htmlBody && !data.textBody) {
        data.textBody = data.htmlBody.replace(/<[^>]*>/g, " ");
      }

      if (data.htmlBody) {
        data.htmlBody = unescapeHtml(data.htmlBody);
      }

      const campaignData = {
        ...data,
        scheduledAt: data.scheduleType === "later" ? data.scheduledAt : null,
      };

      await createCampaign.mutateAsync(campaignData);

      navigate("/dashboard/campaigns", {
        state: { message: "Campaign created successfully!" },
      });
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert(`Error creating campaign: ${error.message}`);
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
        return <Step2Audience {...stepProps} />;
      case 2:
        return <Step1Design {...stepProps} />;
      case 3:
        return <Step3Finalize {...stepProps} />;
      default:
        return <Step2Audience {...stepProps} />;
    }
  };

  return (
    <div className="w-full p-8  space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Send className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
              Create Campaign
            </h1>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">
            Step {currentStep} of {steps.length}
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/campaigns")}
          className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <CampaignStepper steps={steps} currentStep={currentStep} />

          <div className="hidden lg:block p-8 rounded-[2.5rem] bg-linear-to-br from-indigo-600 to-blue-700 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="w-20 h-20 text-blue-400" />
            </div>
            <div className="relative">
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">
                Need Help?
              </h4>
              <p className="text-[10px] font-bold text-indigo-100/70 leading-relaxed uppercase tracking-tight">
                Need a hand? Our guides can help you get started.
              </p>
              <button className="mt-6 w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[9px] font-extrabold text-white uppercase tracking-widest transition-all">
                Read Guide
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {createCampaign.error && (
            <div className="mb-8 p-6 bg-rose-50 border-2 border-rose-100 rounded-4xl animate-in bounce-in duration-500">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-rose-500" />
                <div>
                  <p className="text-xs font-black text-rose-600 uppercase tracking-widest">
                    Error
                  </p>
                  <p className="text-sm font-bold text-rose-700">
                    {createCampaign.error.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 p-10 relative overflow-hidden">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative z-10"
              onKeyDown={(e) => {
                // Prevent form submission on Enter key unless we're on the final step
                if (e.key === "Enter" && currentStep < steps.length) {
                  e.preventDefault();
                }
              }}
            >
              {renderStepContent()}

              <div className="flex items-center justify-between pt-12 mt-12 border-t border-slate-100">
                <div className="min-w-35">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={createCampaign.isPending}
                      className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-slate-300 transition-all disabled:opacity-50"
                    >
                      Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={createCampaign.isPending}
                      className="px-10 py-5 bg-linear-to-r from-indigo-600 to-blue-700 rounded-3xl text-[10px] font-extrabold uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                    >
                      Continue to {steps[currentStep]?.title || "Next Step"}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={createCampaign.isPending}
                      className="px-12 py-5 bg-blue-600 rounded-3xl text-[11px] font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                    >
                      {createCampaign.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Zap className="w-5 h-5" />
                      )}
                      {createCampaign.isPending
                        ? "Creating Campaign..."
                        : "Create Campaign"}
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
