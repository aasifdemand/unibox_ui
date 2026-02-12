import Modal from "../components/shared/modal";
import {
  FileText,
  X,
  Save,
  Type,
  MessageSquare,
  Tag,
  Zap,
  Database,
  CheckCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
} from "lucide-react";
import Button from "../components/ui/button";
import HtmlEmailEditor from "../components/shared/html-editor";
import { useState } from "react";

const ShowTemplate = ({
  showTemplateModal,
  setShowTemplateModal,
  editingTemplate,
  formData,
  handleSaveTemplate,
  setFormData,
  editorMode,
  setEditorMode,
  defaultUserFields,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

  if (!showTemplateModal) return null;

  // Steps configuration
  const steps = [
    {
      id: 1,
      title: "Basic Info",
      description: "Template name and subject",
      icon: <Type className="w-5 h-5" />,
    },
    {
      id: 2,
      title: "Content",
      description: "Write your email content",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 3,
      title: "Review",
      description: "Preview and finalize",
      icon: <Eye className="w-5 h-5" />,
    },
  ];

  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        alert("Template name is required");
        return;
      }
      if (!formData.subject.trim()) {
        alert("Subject line is required");
        return;
      }
    }
    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  // Get current step info
  const currentStepInfo = steps.find((s) => s.id === currentStep);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      /* =========================
         STEP 1: BASIC INFO
      ========================= */
      case 1:
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className=" p-6 rounded-2xl border border-blue-100/50">
              <div className="flex items-start">
                <div className="p-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 mr-4 shrink-0">
                  <Type className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Template Details
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Set up the basic information for your email template.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center mb-2">
                  <Type className="w-4 h-4 text-gray-500 mr-2" />
                  <label className="block text-sm font-medium text-gray-900">
                    Template Name *
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="e.g., Welcome Email, Product Launch"
                />
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-500 mr-2" />
                  <label className="block text-sm font-medium text-gray-900">
                    Subject Line *
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="e.g., Welcome to Our Service, {{first_name}}!"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Template Status
                  </label>
                  <p className="text-sm text-gray-600">
                    Active templates can be used in campaigns
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      /* =========================
         STEP 2: CONTENT - FIXED OVERFLOW
      ========================= */
      case 2:
        return (
          <div className="space-y-5">
            {/* Header Section - Smaller padding */}
            <div className=" p-5 rounded-xl border border-purple-100/50">
              <div className="flex items-start">
                <div className="p-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 mr-3 shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Email Content
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditorMode("rich")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition flex items-center ${
                          editorMode === "rich"
                            ? "bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Rich
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode("text")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition ${
                          editorMode === "text"
                            ? "bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Plain
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Tokens - More compact */}
            <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50/30 rounded-xl border border-green-100">
              <div className="flex items-start">
                <Database className="w-4 h-4 text-green-600 mr-2 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      Personalization Tokens
                    </h4>
                    <span className="text-xs text-green-600 flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      Click to insert
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                    {defaultUserFields.map((field, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const token = `{{${field.fieldName}}}`;
                          if (editorMode === "text") {
                            const textarea = document.querySelector(
                              'textarea[name="htmlContent"]',
                            );
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const newText =
                                textarea.value.substring(0, start) +
                                token +
                                textarea.value.substring(end);
                              setFormData({
                                ...formData,
                                htmlContent: newText,
                              });
                            }
                          }
                        }}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-xs transition-all"
                        title={`Sample: ${field.sampleValue}`}
                      >
                        <code className="font-mono text-blue-700 text-xs">{`{{${field.fieldName}}}`}</code>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-green-100/50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-800 flex items-start">
                      <CheckCircle className="w-3 h-3 text-green-600 mr-1.5 mt-0.5 shrink-0" />
                      <span>
                        Always include{" "}
                        <code className="font-mono bg-green-200 px-1 py-0.5 rounded text-xs">
                          {"{{unsubscribe_link}}"}
                        </code>{" "}
                        for compliance
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Area - CRITICAL FIX */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-gray-900">
                  Email Content *
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    {editorMode === "rich" ? "Rich HTML editor" : "Plain text"}
                  </span>
                </label>
              </div>

              {/* 🔴 FIX: Editor with controlled height and overflow */}
              <div className="border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden">
                {editorMode === "rich" ? (
                  <div className="h-87.5 flex flex-col">
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <HtmlEmailEditor
                        value={formData.htmlContent}
                        onChange={(html) =>
                          setFormData({ ...formData, htmlContent: html })
                        }
                        userFields={defaultUserFields}
                      />
                    </div>
                  </div>
                ) : (
                  <textarea
                    name="htmlContent"
                    rows={12}
                    value={formData.htmlContent}
                    onChange={(e) =>
                      setFormData({ ...formData, htmlContent: e.target.value })
                    }
                    className="w-full px-4 py-3 border-0 focus:ring-0 font-mono text-sm transition resize-none"
                    placeholder={`Hello {{first_name}},

We're excited to have you on board!

Best regards,
Your Team

{{unsubscribe_link}}`}
                  />
                )}
              </div>

              {/* Preview - Collapsible */}
              {previewMode && (
                <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-xs font-medium text-gray-700">Preview</p>
                  </div>
                  <div className="p-4 max-h-48 overflow-y-auto">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: formData.htmlContent || "<p>No content yet</p>",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      /* =========================
         STEP 3: REVIEW - COMPACT
      ========================= */
      case 3:
        return (
          <div className="space-y-5">
            {/* Hero Section */}
            <div className=" p-5 rounded-xl border border-amber-100/50">
              <div className="flex items-start">
                <div className="p-2.5 rounded-xl bg-linear-to-r from-amber-600 to-orange-600 mr-3 shrink-0">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    Review & Finalize
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Preview your template before saving
                  </p>
                </div>
              </div>
            </div>

            {/* Template Summary - Compact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <FileText className="w-4 h-4 text-blue-600 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Summary</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900 truncate max-w-50">
                      {formData.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium text-gray-900 truncate max-w-50">
                      {formData.subject}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        formData.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Token Summary - Compact */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <Tag className="w-4 h-4 text-purple-600 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Tokens</h4>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {(() => {
                    const tokens =
                      formData.htmlContent.match(/\{\{([^}]+)\}\}/g) || [];
                    const uniqueTokens = [...new Set(tokens)];
                    return uniqueTokens.length > 0 ? (
                      uniqueTokens.map((token, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-md bg-purple-50 border border-purple-100 text-purple-700 text-xs font-mono"
                        >
                          {token}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No tokens used</p>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Content Preview - Collapsible */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Preview</h4>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition flex items-center ${
                    previewMode
                      ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  {previewMode ? "Hide" : "Show"}
                </button>
              </div>

              {previewMode && (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                    <p className="text-xs font-medium text-gray-700">
                      Subject: {formData.subject}
                    </p>
                  </div>
                  <div className="p-4 max-h-60 overflow-y-auto">
                    {editorMode === "rich" ? (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: formData.htmlContent,
                        }}
                      />
                    ) : (
                      <pre className="text-xs whitespace-pre-wrap font-mono text-gray-800">
                        {formData.htmlContent}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={showTemplateModal}
      onClose={() => setShowTemplateModal(false)}
      maxWidth="max-w-5xl" // Slightly smaller
      closeOnBackdrop={true}
      className="max-h-[90vh] flex flex-col"
    >
      <div className="flex flex-col h-full">
        {/* Modal Header - Compact */}
        <div className="flex items-center justify-between px-6 py-4  shrink-0">
          <div className="flex items-center">
            <div className="p-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 mr-3">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Step {currentStep}: {currentStepInfo?.title}
              </p>
            </div>
          </div>
          {/* <button
            onClick={() => setShowTemplateModal(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button> */}
        </div>

        {/* Progress Steps - Compact */}
        <div className="px-6 py-3 border-b border-gray-200/50 shrink-0 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center space-x-2 cursor-pointer group"
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      currentStep === step.id
                        ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                        : currentStep > step.id
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4">{step.icon}</div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p
                      className={`text-xs font-medium ${
                        currentStep === step.id
                          ? "text-blue-600"
                          : currentStep > step.id
                            ? "text-green-600"
                            : "text-gray-600"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {step.id < steps.length && (
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-2" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
              Step {currentStep}/{steps.length}
            </div>
          </div>
        </div>

        {/* 🔴 FIX: Scrollable Modal Body - Optimized for content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderStepContent()}
        </div>

        {/* Modal Footer - Compact */}
        <div className="shrink-0 border-t border-gray-200/50  px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <Button
                  onClick={handlePreviousStep}
                  className="px-4 py-2 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1.5" />
                  Previous
                </Button>
              )}
              <Button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              {currentStep < steps.length ? (
                <Button
                  onClick={handleNextStep}
                  className="px-4 py-2 text-xs bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center transition"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSaveTemplate}
                  disabled={
                    !formData.name.trim() ||
                    !formData.subject.trim() ||
                    !formData.htmlContent.trim()
                  }
                  className="px-4 py-2 text-xs bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {editingTemplate ? "Update" : "Create"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShowTemplate;
