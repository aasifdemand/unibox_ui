/* eslint-disable no-unused-vars */
import {
  AtSign,
  CheckCircle,
  Mail,
  Server,
  RefreshCw,
  AlertCircle,
  X,
  ChevronRight,
  Shield,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/button";
import Modal from "../components/shared/modal";
import { Microsoft } from "../icons/microsoft";
import { Google } from "../icons/google";

// Import React Query hooks
import { useTestSmtp, useTestImap } from "../hooks/useSenders";

const ShowSender = ({
  setShowSenderModal,
  setSenderType,
  senderType,
  handleGmailOAuth,
  handleOutlookOAuth,
  handleSmtpSubmit,
  smtpData,
  setSmtpData,
  isSubmitting = false,
}) => {
  const [settingsTab, setSettingsTab] = useState("smtp");
  const [smtpTestResult, setSmtpTestResult] = useState(null);
  const [imapTestResult, setImapTestResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showImapPassword, setShowImapPassword] = useState(false);

  // React Query hooks
  const testSmtp = useTestSmtp();
  const testImap = useTestImap();

  // Test SMTP connection only
  const testSmtpConnection = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setSmtpTestResult(null);

    try {
      const result = await testSmtp.mutateAsync({
        host: smtpData.host,
        port: smtpData.port,
        secure: smtpData.secure,
        username: smtpData.username,
        password: smtpData.password,
      });

      setSmtpTestResult({
        success: true,
        message:
          result.message ||
          "SMTP connection successful! Your outgoing mail settings work.",
      });
    } catch (err) {
      setSmtpTestResult({
        success: false,
        message:
          err.message || "SMTP connection failed. Please check your settings.",
      });
    }
  };

  // Test IMAP connection only
  const testImapConnection = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setImapTestResult(null);

    // Auto-fill IMAP host if not provided
    const imapHost =
      smtpData.imapHost || smtpData.host?.replace("smtp", "imap");

    try {
      const result = await testImap.mutateAsync({
        host: imapHost,
        port: smtpData.imapPort || 993,
        secure: smtpData.imapSecure !== undefined ? smtpData.imapSecure : true,
        user: smtpData.imapUser || smtpData.username,
        password: smtpData.imapPassword || smtpData.password,
      });

      setImapTestResult({
        success: true,
        message:
          result.message ||
          "IMAP connection successful! Your incoming mail settings work.",
      });
    } catch (err) {
      setImapTestResult({
        success: false,
        message:
          err.message || "IMAP connection failed. Please check your settings.",
      });
    }
  };

  const clearTestResults = () => {
    setSmtpTestResult(null);
    setImapTestResult(null);
  };

  const isSmtpTesting = testSmtp.isPending;
  const isImapTesting = testImap.isPending;

  return (
    <Modal
      isOpen={true}
      onClose={() => {
        setShowSenderModal(false);
        clearTestResults();
      }}
      maxWidth="max-w-2xl"
      closeOnBackdrop={true}
    >
      <div className="relative">
        {/* Close button */}
        <button
          onClick={() => setShowSenderModal(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Add Email Sender
                </h3>
                <p className="text-sm text-gray-500">
                  Choose how you want to connect your email account
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <span className={senderType ? "text-blue-600 font-medium" : ""}>
                1. Select type
              </span>
              <ChevronRight className="w-3 h-3" />
              <span
                className={
                  senderType ? "text-blue-600 font-medium" : "text-gray-300"
                }
              >
                2. Configure
              </span>
            </div>
          </div>

          {/* Sender Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {[
              {
                type: "gmail",
                label: "Gmail",
                icon: Google,
                color: "red",
                bg: "red",
              },
              {
                type: "outlook",
                label: "Outlook",
                icon: Microsoft,
                color: "blue",
                bg: "blue",
              },
              {
                type: "smtp",
                label: "Custom SMTP",
                icon: Server,
                color: "purple",
                bg: "purple",
              },
            ].map(({ type, label, icon: Icon, color, bg }) => (
              <button
                key={type}
                onClick={() => {
                  setSenderType(type);
                  clearTestResults();
                }}
                disabled={isSubmitting}
                className={`group relative p-4 rounded-xl border-2 transition-all ${
                  senderType === type
                    ? `border-${color}-500 bg-${color}-50/50 shadow-sm`
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-12 h-12 rounded-xl bg-${bg}-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                  </div>
                  <span className="font-medium text-gray-900">{label}</span>
                  {senderType === type && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="max-h-[50vh] overflow-y-auto pr-1 -mr-1 scroll-smooth">
            {senderType === "gmail" ? (
              <div className="bg-linear-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Secure OAuth Connection
                      </h4>
                      <p className="text-sm text-gray-600">
                        Connect securely without storing your password
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "No password storage",
                      "Better deliverability",
                      "Higher limits",
                      "Reply tracking",
                    ].map((benefit, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 p-2 rounded-lg"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : senderType === "outlook" ? (
              <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Microsoft Azure AD
                      </h4>
                      <p className="text-sm text-gray-600">
                        Enterprise-grade security with OAuth 2.0
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Azure AD security",
                      "No app passwords",
                      "Office 365 support",
                      "Reply tracking",
                    ].map((benefit, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 p-2 rounded-lg"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : senderType === "smtp" ? (
              <form onSubmit={handleSmtpSubmit} className="space-y-6">
                {/* Basic Info - Card style */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    Sender Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Display Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={smtpData.displayName}
                        onChange={(e) =>
                          setSmtpData({
                            ...smtpData,
                            displayName: e.target.value,
                          })
                        }
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="e.g., Acme Marketing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Sender Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={smtpData.email}
                        onChange={(e) =>
                          setSmtpData({ ...smtpData, email: e.target.value })
                        }
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="sender@yourdomain.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Settings Tabs - Modern style */}
                <div className="bg-gray-50/50 rounded-xl p-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSettingsTab("smtp")}
                      disabled={isSubmitting}
                      className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        settingsTab === "smtp"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Server className="w-4 h-4 inline mr-2" />
                      SMTP Settings
                      <span className="ml-2 text-xs text-red-400">*</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsTab("imap")}
                      disabled={isSubmitting}
                      className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        settingsTab === "imap"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Mail className="w-4 h-4 inline mr-2" />
                      IMAP Settings
                      <span className="ml-2 text-xs text-gray-400">
                        optional
                      </span>
                    </button>
                  </div>
                </div>

                {/* SMTP Settings Tab */}
                {settingsTab === "smtp" && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          Outgoing Mail Server
                        </h5>
                        <p className="text-sm text-gray-500 mt-1">
                          Configure how you'll send emails
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                          Required
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          SMTP Host <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={smtpData.host}
                          onChange={(e) =>
                            setSmtpData({ ...smtpData, host: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          SMTP Port <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          value={smtpData.port}
                          onChange={(e) =>
                            setSmtpData({ ...smtpData, port: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Username <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={smtpData.username}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              username: e.target.value,
                            })
                          }
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Password <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={smtpData.password}
                            onChange={(e) =>
                              setSmtpData({
                                ...smtpData,
                                password: e.target.value,
                              })
                            }
                            required
                            disabled={isSubmitting}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:hidden"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smtpData.secure}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              secure: e.target.checked,
                            })
                          }
                          disabled={isSubmitting}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-700">
                          Use TLS/SSL encryption
                        </span>
                      </label>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={testSmtpConnection}
                        disabled={
                          isSmtpTesting ||
                          isSubmitting ||
                          !smtpData.host ||
                          !smtpData.port ||
                          !smtpData.username ||
                          !smtpData.password
                        }
                        className="min-w-25 p-1"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 mr-2 ${isSmtpTesting ? "animate-spin" : ""}`}
                        />
                        {isSmtpTesting ? "Testing..." : "Test SMTP"}
                      </Button>
                    </div>

                    {/* Test Result with animation */}
                    {smtpTestResult && (
                      <div
                        className={`mt-3 p-4 rounded-lg text-sm animate-slideDown ${
                          smtpTestResult.success
                            ? "bg-green-50 border border-green-100"
                            : "bg-red-50 border border-red-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-1 rounded-full ${
                              smtpTestResult.success
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {smtpTestResult.success ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <span
                            className={
                              smtpTestResult.success
                                ? "text-green-800"
                                : "text-red-800"
                            }
                          >
                            {smtpTestResult.message}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* IMAP Settings Tab */}
                {settingsTab === "imap" && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          Incoming Mail Server
                        </h5>
                        <p className="text-sm text-gray-500 mt-1">
                          Optional - for tracking replies and managing incoming
                          mail
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                        Optional
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          IMAP Host
                        </label>
                        <input
                          type="text"
                          value={smtpData.imapHost || ""}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              imapHost: e.target.value,
                            })
                          }
                          disabled={isSubmitting}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                          placeholder="imap.gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          IMAP Port
                        </label>
                        <input
                          type="number"
                          value={smtpData.imapPort || ""}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              imapPort: e.target.value,
                            })
                          }
                          disabled={isSubmitting}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                          placeholder="993"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          IMAP Username
                        </label>
                        <input
                          type="text"
                          value={smtpData.imapUser || ""}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              imapUser: e.target.value,
                            })
                          }
                          disabled={isSubmitting}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          IMAP Password
                        </label>
                        <div className="relative">
                          <input
                            type={showImapPassword ? "text" : "password"}
                            value={smtpData.imapPassword || ""}
                            onChange={(e) =>
                              setSmtpData({
                                ...smtpData,
                                imapPassword: e.target.value,
                              })
                            }
                            disabled={isSubmitting}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowImapPassword(!showImapPassword)
                            }
                            disabled={isSubmitting}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:hidden"
                          >
                            {showImapPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smtpData.imapSecure || false}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              imapSecure: e.target.checked,
                            })
                          }
                          disabled={isSubmitting}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-700">
                          Use TLS/SSL encryption
                        </span>
                      </label>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={testImapConnection}
                        disabled={isImapTesting || isSubmitting}
                        className="min-w-25 p-1"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 mr-2 ${isImapTesting ? "animate-spin" : ""}`}
                        />
                        {isImapTesting ? "Testing..." : "Test IMAP"}
                      </Button>
                    </div>

                    {/* Test Result with animation */}
                    {imapTestResult && (
                      <div
                        className={`mt-3 p-4 rounded-lg text-sm animate-slideDown ${
                          imapTestResult.success
                            ? "bg-green-50 border border-green-100"
                            : "bg-red-50 border border-red-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-1 rounded-full ${
                              imapTestResult.success
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {imapTestResult.success ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <span
                            className={
                              imapTestResult.success
                                ? "text-green-800"
                                : "text-red-800"
                            }
                          >
                            {imapTestResult.message}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50/50 p-4 rounded-lg">
                      <div className="flex gap-3">
                        <Zap className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Auto-detection:</span>{" "}
                          If left empty, we'll try to detect IMAP settings from
                          your SMTP configuration.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              // Empty state when no sender type selected
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Select a sender type above to continue
                </p>
              </div>
            )}
          </div>

          {/* Footer Buttons - Sticky at bottom */}
          <div className="sticky bottom-0 bg-white pt-6 mt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {senderType === "smtp" ? (
                  settingsTab === "smtp" ? (
                    "Test your SMTP connection before saving"
                  ) : (
                    "Test your IMAP connection before saving"
                  )
                ) : senderType ? (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Secure OAuth connection
                  </span>
                ) : (
                  <span>Choose a connection method</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSenderModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                {senderType === "smtp" ? (
                  <Button
                    type="submit"
                    onClick={handleSmtpSubmit}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                ) : senderType === "gmail" ? (
                  <Button
                    type="button"
                    onClick={handleGmailOAuth}
                    disabled={isSubmitting}
                    className="bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <Google className="w-4 h-4 mr-2" />
                    Connect Gmail
                  </Button>
                ) : senderType === "outlook" ? (
                  <Button
                    type="button"
                    onClick={handleOutlookOAuth}
                    disabled={isSubmitting}
                    className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <Microsoft className="w-4 h-4 mr-2" />
                    Connect Outlook
                  </Button>
                ) : (
                  <Button disabled className="opacity-50 cursor-not-allowed">
                    Select a method
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShowSender;
