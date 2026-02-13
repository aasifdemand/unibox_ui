/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { FileText, Sparkles, Database, Users, Zap } from "lucide-react";
import Button from "../ui/button";
import HtmlEmailEditor from "../shared/html-editor";
import { useBatches } from "../../hooks/useBatches";

const Step2Content = ({
  register,
  errors,
  editorMode,
  setEditorMode,
  watch,
  setValue,
  selectedBatch,
}) => {
  const [userFields, setUserFields] = useState([]);
  const { data: batches = [] } = useBatches();
  const htmlBody = watch("htmlBody");
  const textBody = watch("textBody");
  const listBatchId = watch("listBatchId");

  // Extract user fields from selected batch
  const formatFieldName = (field) => {
    return field
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  useEffect(() => {
    if (listBatchId && batches.length > 0) {
      const batch = batches.find((b) => b.id === listBatchId);
      if (batch && batch.metadata && batch.metadata.fields) {
        // Extract field names from metadata
        const fields = Object.keys(batch.metadata.fields)
          .filter((field) => !["email", "name"].includes(field.toLowerCase()))
          .map((field) => ({
            fieldName: field,
            displayName: formatFieldName(field),
            sampleValue: batch.metadata.fields[field] || "N/A",
          }));
        setUserFields(fields);
      } else {
        setUserFields([]);
      }
    } else {
      setUserFields([]);
    }
  }, [listBatchId, batches]);

  const emailTemplates = [
    {
      name: "Personalized Welcome",
      description: "Professional welcome email with personalization",
      html: `
<div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; color:#111827;">
  <h2 style="color:#2563eb;">Welcome to UniBox, {{first_name}}</h2>

  <p>Hello {{first_name}},</p>

  <p>
    We’re excited to welcome you to UniBox.
    As a member from {{company}} in {{city}}, you now have access to tools designed
    to simplify operations and eliminate repetitive manual work.
  </p>

  <p>With UniBox, you can:</p>

  <ul>
    <li>Automate up to 90% of repetitive office tasks</li>
    <li>Run smarter email campaigns with personalization</li>
    <li>Scale your workflows without increasing overhead</li>
  </ul>

  <p>
    If you have any questions or would like a walkthrough,
    our team is always happy to help.
  </p>

  <p>
    Best regards<br>
    <strong>Aasif Ali</strong><br>
    CEO, UniBox
  </p>

  <p style="font-size:12px; color:#6b7280;">
    <a href="{{unsubscribe_link}}" style="color:#6b7280;">Unsubscribe</a>
  </p>
</div>
`,
      tokensUsed: [
        "{{first_name}}",
        "{{company}}",
        "{{city}}",
        "{{unsubscribe_link}}",
      ],
    },

    {
      name: "Product Announcement",
      description: "Announce a new SaaS feature or release",
      html: `
<div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; color:#111827;">
  <h2 style="color:#2563eb;">New Features Just Launched 🚀</h2>

  <p>Hello {{first_name}},</p>

  <p>
    We’re excited to share that UniBox has launched new features designed to help
    teams like yours reduce manual work and move faster.
  </p>

  <p>What’s new:</p>

  <ul>
    <li>Advanced AI-powered automation workflows</li>
    <li>Smarter email personalization at scale</li>
    <li>Improved reporting and performance insights</li>
  </ul>

  <p>
    These updates are now available to users from {{company}}.
    We’d love for you to try them out and share your feedback.
  </p>

  <p>
    Best regards<br>
    <strong>Aasif Ali</strong><br>
    CEO, UniBox
  </p>

  <p style="font-size:12px; color:#6b7280;">
    <a href="{{unsubscribe_link}}" style="color:#6b7280;">Unsubscribe</a>
  </p>
</div>
`,
      tokensUsed: ["{{first_name}}", "{{company}}", "{{unsubscribe_link}}"],
    },

    {
      name: "Re-engagement",
      description: "Win back inactive users professionally",
      html: `
<div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; color:#111827;">
  <h2 style="color:#2563eb;">We Miss You, {{first_name}}</h2>

  <p>Hello {{first_name}},</p>

  <p>
    It’s been a while since we last connected.
    A lot has changed at UniBox, and we think you’ll find our recent updates valuable.
  </p>

  <p>Here’s what’s new:</p>

  <ul>
    <li>Faster AI-powered automation</li>
    <li>New personalization features</li>
    <li>Upcoming product enhancements</li>
  </ul>

  <p>
    If you’re exploring ways to improve efficiency at {{company}},
    we’d be happy to schedule a quick call and walk you through what’s new.
  </p>

  <p>
    Best regards<br>
    <strong>Aasif Ali</strong><br>
    CEO, UniBox
  </p>

  <p style="font-size:12px; color:#6b7280;">
    Not interested?
    <a href="{{unsubscribe_link}}" style="color:#6b7280;">Unsubscribe here</a>
  </p>
</div>
`,
      tokensUsed: ["{{first_name}}", "{{company}}", "{{unsubscribe_link}}"],
    },
  ];

  const applyTemplate = (templateHtml) => {
    setValue("htmlBody", templateHtml, { shouldValidate: true });
  };

  const handleTextChange = (e) => {
    setValue("textBody", e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Email Content
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setEditorMode("html")}
              className={`px-4 py-2 rounded-lg transition flex items-center ${
                editorMode === "html"
                  ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Rich Editor
            </button>

            <button
              type="button"
              onClick={() => setEditorMode("text")}
              className={`px-4 py-2 rounded-lg transition ${
                editorMode === "text"
                  ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Plain Text
            </button>
          </div>
        </div>

        <div className="text-gray-600">
          {editorMode === "html" ? (
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-600" />
              <span>Create dynamic emails using personalization tokens</span>
            </div>
          ) : (
            "Simple text-only version for maximum compatibility"
          )}
        </div>
      </div>

      {/* Audience Data Info */}
      {selectedBatch && (
        <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50/30 rounded-xl border border-green-100">
          <div className="flex items-center">
            <Database className="w-5 h-5 text-green-600 mr-3" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  Connected Audience Data
                </h4>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                  {selectedBatch.validRecords} contacts
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Using: <strong>{selectedBatch.originalFilename}</strong>
              </p>

              {userFields.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Available Custom Fields:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {userFields.slice(0, 5).map((field, index) => (
                      <code
                        key={index}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono"
                        title={`Sample: ${field.sampleValue}`}
                      >
                        {`{{${field.fieldName}}}`}
                      </code>
                    ))}
                    {userFields.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{userFields.length - 5} more fields
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editor Area */}
      {editorMode === "html" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              HTML Email Content <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-gray-500 font-normal">
                Use tokens for personalization
              </span>
            </label>

            <HtmlEmailEditor
              value={htmlBody}
              onChange={(html) =>
                setValue("htmlBody", html, { shouldValidate: true })
              }
              userFields={userFields}
            />

            {errors.htmlBody && (
              <p className="text-sm text-red-600">{errors.htmlBody.message}</p>
            )}
          </div>

          {/* Plain Text Fallback */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Plain Text Fallback
              <span className="ml-2 text-xs text-gray-500 font-normal">
                (Optional - tokens will also work here)
              </span>
            </label>
            <textarea
              {...register("textBody")}
              value={textBody}
              onChange={handleTextChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-mono text-sm"
              placeholder={`Hello {{first_name}},

We're excited to share our latest updates with you!

Best regards,
Your Team`}
            />
            <p className="text-sm text-gray-500">
              This plain text version will be shown if HTML cannot be displayed.
              Tokens like {"{{first_name}}"} will be replaced.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Plain Text Content <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-gray-500 font-normal">
              (Text-only with tokens support)
            </span>
          </label>

          <textarea
            {...register("htmlBody")}
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-mono text-sm"
            placeholder={`Hello {{first_name}} {{last_name}},

We noticed you're from {{city}} and wanted to share something special.

Here's what's new:
• Feature 1: Description
• Feature 2: Description

To get started, visit: [Your Website]

Best regards,
Your Team

To unsubscribe: {{unsubscribe_link}}`}
          />

          {errors.htmlBody && (
            <p className="text-sm text-red-600">{errors.htmlBody.message}</p>
          )}
        </div>
      )}

      {/* Email Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Smart Templates</h4>
            <p className="text-sm text-gray-600">
              Pre-designed templates with personalization
            </p>
          </div>
          <Button variant="outline" size="small">
            View All Templates
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emailTemplates.map((template, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => applyTemplate(template.html)}
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">{template.name}</h5>
                <Users className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {template.description}
              </p>

              {/* Template Tokens */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Includes tokens:</p>
                <div className="flex flex-wrap gap-1">
                  {template.tokensUsed.map((token, tokenIndex) => (
                    <code
                      key={tokenIndex}
                      className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
                    >
                      {token}
                    </code>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 overflow-hidden">
                <div className="truncate">
                  {template.html.substring(0, 80)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalization Guide */}
      <div className="p-4 bg-linear-to-r from-yellow-50 to-amber-50/30 rounded-xl border border-yellow-100">
        <h4 className="font-medium text-gray-900 mb-3">
          🎯 How Personalization Works
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              For Each Recipient:
            </h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • <code>{"{{first_name}}"}</code> → "John"
              </li>
              <li>
                • <code>{"{{email}}"}</code> → "john@example.com"
              </li>
              <li>
                • <code>{"{{company}}"}</code> → "Acme Corp"
              </li>
              <li>
                • <code>{"{{city}}"}</code> → "New York"
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Best Practices:
            </h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • Always include <code>{"{{unsubscribe_link}}"}</code> for
                compliance
              </li>
              <li>
                • Use first name in subject line for 26% higher open rates
              </li>
              <li>• Test emails with different token combinations</li>
              <li>• Preview emails before sending to check token rendering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Content;
