/* eslint-disable no-case-declarations */
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import CampaignStepper from "../../../components/campaign/campaign-stepper";
import Step1BasicInfo from "../../../components/campaign/basic-info";
import Step2Content from "../../../components/campaign/content";
import Step3Audience from "../../../components/campaign/audience";
import Step4Schedule from "../../../components/campaign/schedule";
import Step5Settings from "../../../components/campaign/settings";
import { useCampaignStore } from "../../../store/campaign.store";
import { useSenderStore } from "../../../store/sender.store";
import { useUploadStore } from "../../../store/upload.store";
import Button from "../../../components/ui/button";

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
  const [editorMode, setEditorMode] = useState("html"); // Default to HTML mode

  // Zustand stores
  const {
    createCampaign,
    isLoading: isCreating,
    error: campaignError,
    clearError,
  } = useCampaignStore();
  const {
    senders,
    isLoading: isLoadingSenders,
    fetchSenders,
  } = useSenderStore();
  const {
    batches,
    isLoading: isLoadingBatches,
    fetchBatches,
  } = useUploadStore();

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
      htmlBody: "", // Initialize with empty string
      textBody: "", // Initialize with empty string
    },
  });

  const watchScheduleType = watch("scheduleType");
  const watchHtmlBody = watch("htmlBody");
  const watchTextBody = watch("textBody");

  useEffect(() => {
    fetchSenders();
    fetchBatches();
    clearError();
  }, [fetchBatches, clearError, fetchSenders]);

  const verifiedBatches = batches.filter(
    (batch) => batch.status === "verified",
  );

  const handleBatchSelect = (batchId) => {
    const batch = verifiedBatches.find((b) => b.id === batchId);
    setSelectedBatch(batch);
    setValue("listBatchId", batchId);
  };

  const handleSenderSelect = (senderId, senderType) => {
    // Add senderType parameter
    const sender = senders.find((s) => s.id === senderId);
    setSelectedSender(sender);
    setValue("senderId", senderId);
    setValue("senderType", senderType); // Set senderType
  };

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Campaign name and subject",
    },
    { number: 2, title: "Content", description: "Email body and design" },
    { number: 3, title: "Audience", description: "Recipients and sender" },
    { number: 4, title: "Schedule", description: "Timing and delivery" },
    { number: 5, title: "Settings", description: "Tracking and preferences" },
  ];

  const nextStep = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await trigger(["name", "subject"]);
        break;
      case 2:
        // FIX: Check content based on editor mode
        if (editorMode === "html") {
          // For HTML mode, require htmlBody
          if (!watchHtmlBody || watchHtmlBody.trim().length < 10) {
            setValue("htmlBody", watchHtmlBody || "");
            // Manually trigger validation
            await trigger("htmlBody");
            isValid = false;
          } else {
            isValid = true;
          }
        } else {
          // For text mode, require textBody
          if (!watchTextBody || watchTextBody.trim().length < 10) {
            setValue("textBody", watchTextBody || "");
            // Manually trigger validation
            await trigger("textBody");
            isValid = false;
          } else {
            // In text mode, htmlBody is not required, so we can proceed
            isValid = true;
          }
        }

        // Also check that we have at least some content
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
      case 3:
        isValid = await trigger(["senderId", "listBatchId"]);
        break;
      case 4:
        if (watchScheduleType === "later") {
          isValid = await trigger(["scheduledAt"]);
        } else {
          isValid = true;
        }
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log("Form data before processing:", data);
      console.log("Editor mode:", editorMode);
      console.log("Selected sender:", selectedSender);
      console.log("Selected batch:", selectedBatch);

      // Check if required fields are present
      if (!data.listBatchId) {
        alert("Please select a recipient list");
        return;
      }

      if (!data.senderId) {
        alert("Please select a sender");
        return;
      }

      // Ensure we have content in the appropriate field
      if (editorMode === "text" && data.textBody && !data.htmlBody) {
        data.htmlBody = `<pre style="font-family: monospace; white-space: pre-wrap;">${data.textBody}</pre>`;
      } else if (editorMode === "html" && data.htmlBody && !data.textBody) {
        data.textBody = data.htmlBody.replace(/<[^>]*>/g, " ");
      }

      // If senderType is not set, try to determine it from selectedSender
      if (!data.senderType && selectedSender) {
        console.log("Determining senderType from selectedSender");
        // Determine sender type from sender properties
        if (selectedSender.googleId) {
          data.senderType = "gmail";
        } else if (selectedSender.microsoftId) {
          data.senderType = "outlook";
        } else if (selectedSender.smtpHost) {
          data.senderType = "smtp";
        } else {
          data.senderType = "smtp"; // default
        }
      }

      const campaignData = {
        ...data,
        scheduledAt: data.scheduleType === "later" ? data.scheduledAt : null,
      };

      console.log("Final campaign data:", campaignData);
      console.log("Calling createCampaign API...");

      const success = await createCampaign(campaignData);

      if (success) {
        console.log("Campaign created successfully");

        // Get the newly created campaign from the store
        const newCampaign = useCampaignStore.getState().currentCampaign;

        // Navigate to campaigns list with success message
        navigate("/dashboard/campaigns", {
          state: {
            message:
              "Campaign created successfully! Don't forget to activate it when you're ready to send.",
            campaignId: newCampaign?.id,
          },
        });
      } else {
        console.log("Campaign creation failed");
      }
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
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicInfo {...stepProps} />;
      case 2:
        return <Step2Content {...stepProps} />;
      case 3:
        return <Step3Audience {...stepProps} />;
      case 4:
        return <Step4Schedule {...stepProps} />;
      case 5:
        return <Step5Settings {...stepProps} selectedBatch={selectedBatch} />;
      default:
        return <Step1BasicInfo {...stepProps} />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Campaign
          </h1>
          <p className="text-gray-600 mt-1">
            Follow the steps to create and launch your email campaign
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/campaigns")}
        >
          Cancel
        </Button>
      </div>

      <CampaignStepper steps={steps} currentStep={currentStep} />

      {campaignError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-700">{campaignError}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200/50 p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isCreating}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {currentStep < steps.length ? (
                <Button type="button" onClick={nextStep} disabled={isCreating}>
                  Continue to {steps[currentStep]?.title || "Next Step"}
                </Button>
              ) : (
                <Button
                  type="submit"
                  isLoading={isCreating}
                  disabled={isCreating}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Launch Campaign
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="p-6 rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50/30">
        <div className="flex items-center">
          <Sparkles className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h4 className="font-semibold text-gray-900">Need help?</h4>
            <p className="text-sm text-gray-600 mt-1">
              Check our campaign creation guide or contact support for
              assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
