import {
  AtSign,
  CheckCircle,
  Mail,
  Server,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/button";
import Modal from "../components/shared/modal";

const ShowSender = ({
  setShowSenderModal,
  setSenderType,
  senderType,
  handleGmailOAuth,
  handleOutlookOAuth,
  handleSmtpSubmit,
  smtpData,
  setSmtpData,
}) => {
  const [settingsTab, setSettingsTab] = useState("smtp");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingImap, setTestingImap] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null);
  const [imapTestResult, setImapTestResult] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Test SMTP connection only
  const testSmtpConnection = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const res = await fetch(`${API_URL}/senders/test-smtp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: smtpData.host,
          port: smtpData.port,
          secure: smtpData.secure,
          user: smtpData.username,
          password: smtpData.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSmtpTestResult({
          success: true,
          message:
            "✅ SMTP connection successful! Your outgoing mail settings work.",
        });
      } else {
        setSmtpTestResult({
          success: false,
          message:
            data.message ||
            "❌ SMTP connection failed. Please check your settings.",
        });
      }
    } catch (err) {
      setSmtpTestResult({
        success: false,
        message: `❌ Error: ${err.message}`,
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  // Test IMAP connection only
  const testImapConnection = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setTestingImap(true);
    setImapTestResult(null);

    // Auto-fill IMAP host if not provided
    const imapHost =
      smtpData.imapHost || smtpData.host?.replace("smtp", "imap");

    try {
      const res = await fetch(`${API_URL}/senders/test-imap`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: imapHost,
          port: smtpData.imapPort || 993,
          secure:
            smtpData.imapSecure !== undefined ? smtpData.imapSecure : true,
          user: smtpData.imapUser || smtpData.username,
          password: smtpData.imapPassword || smtpData.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setImapTestResult({
          success: true,
          message:
            "✅ IMAP connection successful! Your incoming mail settings work.",
        });
      } else {
        setImapTestResult({
          success: false,
          message:
            data.message ||
            "❌ IMAP connection failed. Please check your settings.",
        });
      }
    } catch (err) {
      setImapTestResult({
        success: false,
        message: `❌ Error: ${err.message}`,
      });
    } finally {
      setTestingImap(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => setShowSenderModal(false)}
      maxWidth="max-w-2xl"
      closeOnBackdrop={true}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center">
            <Mail className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Add Email Sender
              </h3>
              <p className="text-sm text-gray-600">
                Configure how you want to send emails
              </p>
            </div>
          </div>
        </div>

        {/* Sender Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            onClick={() => setSenderType("gmail")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              senderType === "gmail"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="font-medium text-gray-900">Gmail (OAuth)</h4>
            </div>
          </div>

          <div
            onClick={() => setSenderType("outlook")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              senderType === "outlook"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <AtSign className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Outlook (OAuth)</h4>
            </div>
          </div>

          <div
            onClick={() => setSenderType("smtp")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              senderType === "smtp"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                <Server className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Custom SMTP</h4>
            </div>
          </div>
        </div>

        {/* Content Area - Fixed with proper scrolling */}
        <div className="max-h-[50vh] overflow-y-auto pr-2 -mr-2">
          {senderType === "gmail" ? (
            <div className="p-6 bg-linear-to-r from-red-50 to-orange-50/30 rounded-xl border border-red-100">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h5 className="font-medium text-gray-900 mb-2">Benefits:</h5>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      No password storage - uses secure tokens
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Better deliverability and reputation
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Higher sending limits
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Automatic reply tracking
                    </li>
                  </ul>
                </div>

                <Button
                  type="button"
                  onClick={handleGmailOAuth}
                  className="w-full bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Connect Gmail Account
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  You'll be redirected to Google to authorize access
                </p>
              </div>
            </div>
          ) : senderType === "outlook" ? (
            <div className="p-6 bg-linear-to-r from-blue-50 to-cyan-50/30 rounded-xl border border-blue-100">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h5 className="font-medium text-gray-900 mb-2">Benefits:</h5>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Enterprise-grade security with Microsoft Azure AD
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      No app passwords required
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Works with Office 365 and Outlook.com
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Automatic reply tracking
                    </li>
                  </ul>
                </div>

                <Button
                  type="button"
                  onClick={handleOutlookOAuth}
                  className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  <AtSign className="w-4 h-4 mr-2" />
                  Connect Outlook Account
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  You'll be redirected to Microsoft to authorize access
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSmtpSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name <span className="text-red-500">*</span>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={smtpData.email}
                      onChange={(e) =>
                        setSmtpData({ ...smtpData, email: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="sender@yourdomain.com"
                    />
                  </div>
                </div>
              </div>

              {/* Settings Tabs */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setSettingsTab("smtp")}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        settingsTab === "smtp"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Server className="w-4 h-4 inline mr-2" />
                      SMTP Settings (Required)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsTab("imap")}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        settingsTab === "imap"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Mail className="w-4 h-4 inline mr-2" />
                      IMAP Settings (Optional)
                    </button>
                  </nav>
                </div>
              </div>

              {/* SMTP Settings Tab */}
              {settingsTab === "smtp" && (
                <div className="bg-gray-50 p-6 rounded-lg border space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-4">
                      SMTP Settings for Sending Emails
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      Configure your outgoing mail server settings. These are
                      required to send emails.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={smtpData.host}
                        onChange={(e) =>
                          setSmtpData({ ...smtpData, host: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="smtp.yourdomain.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Example: smtp.gmail.com, smtp.mail.yahoo.com
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={smtpData.port}
                        onChange={(e) =>
                          setSmtpData({ ...smtpData, port: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="587"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Common ports: 587 (TLS), 465 (SSL), 25 (non-secure)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Username <span className="text-red-500">*</span>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your-email@domain.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={smtpData.password}
                        onChange={(e) =>
                          setSmtpData({
                            ...smtpData,
                            password: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use app password if using Gmail/Yahoo
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={smtpData.secure}
                        onChange={(e) =>
                          setSmtpData({ ...smtpData, secure: e.target.checked })
                        }
                        id="smtpSecure"
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label
                        htmlFor="smtpSecure"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Use TLS/SSL encryption
                      </label>
                    </div>

                    {/* ✅ SMTP TEST BUTTON */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={testSmtpConnection}
                      disabled={
                        testingSmtp ||
                        !smtpData.host ||
                        !smtpData.port ||
                        !smtpData.username ||
                        !smtpData.password
                      }
                      className="flex items-center"
                    >
                      <RefreshCw
                        className={`w-3 h-3 mr-1 ${testingSmtp ? "animate-spin" : ""}`}
                      />
                      {testingSmtp ? "Testing..." : "Test SMTP"}
                    </Button>
                  </div>

                  {/* ✅ SMTP TEST RESULT */}
                  {smtpTestResult && (
                    <div
                      className={`mt-3 p-3 rounded-lg text-sm ${
                        smtpTestResult.success
                          ? "bg-green-50 border border-green-200 text-green-800"
                          : "bg-red-50 border border-red-200 text-red-800"
                      }`}
                    >
                      <div className="flex items-start">
                        {smtpTestResult.success ? (
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                        )}
                        <span>{smtpTestResult.message}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* IMAP Settings Tab */}
              {settingsTab === "imap" && (
                <div className="bg-blue-50 p-6 rounded-lg border space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-4">
                      IMAP Settings for Receiving Emails
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      Optional: Configure IMAP settings to track email replies
                      and manage incoming mail. If not provided, system will
                      auto-detect based on SMTP settings.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IMAP Host
                      </label>
                      <input
                        type="text"
                        value={smtpData.imapHost || ""}
                        onChange={(e) =>
                          setSmtpData({ ...smtpData, imapHost: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="imap.yourdomain.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Example: imap.gmail.com, imap.mail.yahoo.com
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IMAP Port
                      </label>
                      <input
                        type="number"
                        value={smtpData.imapPort || ""}
                        onChange={(e) =>
                          setSmtpData({ ...smtpData, imapPort: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="993"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Common ports: 993 (SSL), 143 (non-secure)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IMAP Username
                      </label>
                      <input
                        type="text"
                        value={smtpData.imapUser || ""}
                        onChange={(e) =>
                          setSmtpData({ ...smtpData, imapUser: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your-email@domain.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IMAP Password
                      </label>
                      <input
                        type="password"
                        value={smtpData.imapPassword || ""}
                        onChange={(e) =>
                          setSmtpData({
                            ...smtpData,
                            imapPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Usually same as SMTP password
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={smtpData.imapSecure || false}
                        onChange={(e) =>
                          setSmtpData({
                            ...smtpData,
                            imapSecure: e.target.checked,
                          })
                        }
                        id="imapSecure"
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label
                        htmlFor="imapSecure"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Use TLS/SSL encryption
                      </label>
                    </div>

                    {/* ✅ IMAP TEST BUTTON */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={testImapConnection}
                      disabled={testingImap}
                      className="flex items-center"
                    >
                      <RefreshCw
                        className={`w-3 h-3 mr-1 ${testingImap ? "animate-spin" : ""}`}
                      />
                      {testingImap ? "Testing..." : "Test IMAP"}
                    </Button>
                  </div>

                  {/* ✅ IMAP TEST RESULT */}
                  {imapTestResult && (
                    <div
                      className={`mt-3 p-3 rounded-lg text-sm ${
                        imapTestResult.success
                          ? "bg-green-50 border border-green-200 text-green-800"
                          : "bg-red-50 border border-red-200 text-red-800"
                      }`}
                    >
                      <div className="flex items-start">
                        {imapTestResult.success ? (
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                        )}
                        <span>{imapTestResult.message}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-100/30 p-3 rounded-lg mt-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> IMAP settings are optional but
                      recommended for tracking email replies. Many providers use
                      the same credentials as SMTP but different host/port.
                    </p>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between items-center pt-6 mt-2 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            {senderType === "smtp" && (
              <>
                {settingsTab === "smtp"
                  ? "Test your SMTP connection before saving"
                  : "Test your IMAP connection before saving"}
              </>
            )}
            {senderType !== "smtp" && "Connect with OAuth for secure access"}
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSenderModal(false)}
            >
              Cancel
            </Button>
            {senderType === "smtp" ? (
              <Button type="submit" onClick={handleSmtpSubmit}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            ) : senderType === "gmail" ? (
              <Button
                type="button"
                onClick={handleGmailOAuth}
                className="bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Connect Gmail
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleOutlookOAuth}
                className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <AtSign className="w-4 h-4 mr-2" />
                Connect Outlook
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShowSender;
