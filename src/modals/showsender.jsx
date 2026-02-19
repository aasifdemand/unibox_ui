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
import Modal from "../components/shared/modal";
import { Microsoft } from "../icons/microsoft";
import { Google } from "../icons/google";
import Button from "../components/ui/button";

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
      maxWidth="max-w-3xl"
      closeOnBackdrop={true}
    >
      <div className="bg-linear-to-br from-indigo-600 to-blue-700 p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Mail className="w-20 h-20 text-blue-400" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-tighter">
              Add Sender
            </h3>
            <p className="text-[10px] font-bold text-indigo-100/60 uppercase tracking-widest mt-0.5">
              Choose your email provider
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Sender Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              type: "gmail",
              label: "Gmail",
              icon: Google,
              color: "rose",
              bg: "bg-rose-50",
              text: "text-rose-600",
              desc: "OAuth 2.0",
            },
            {
              type: "outlook",
              label: "Outlook",
              icon: Microsoft,
              color: "blue",
              bg: "bg-blue-50",
              text: "text-blue-600",
              desc: "Microsoft Graph",
            },
            {
              type: "smtp",
              label: "Custom SMTP",
              icon: Server,
              color: "slate",
              bg: "bg-slate-100",
              text: "text-slate-600",
              desc: "Manual setup",
            },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => {
                setSenderType(item.type);
                clearTestResults();
              }}
              disabled={isSubmitting}
              className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${
                senderType === item.type
                  ? `border-${item.color}-500 bg-${item.color}-50/30 shadow-2xl shadow-${item.color}-500/10`
                  : "border-slate-50 bg-white hover:border-slate-200"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                >
                  <item.icon className={`w-7 h-7 ${item.text}`} />
                </div>
                <span className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                  {item.label}
                </span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {item.desc}
                </p>
              </div>
              {senderType === item.type && (
                <div className="absolute top-4 right-4 animate-in zoom-in">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {senderType === "gmail" || senderType === "outlook" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div
                className={`p-6 rounded-[2.5rem] border-2 ${senderType === "gmail" ? "bg-rose-50/20 border-rose-100" : "bg-blue-50/20 border-blue-100"} relative overflow-hidden`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-white/50">
                    <Shield
                      className={`w-8 h-8 ${senderType === "gmail" ? "text-rose-500" : "text-blue-500"}`}
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-800 uppercase tracking-tighter">
                      Secure Connection
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Connect your account safely
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: Zap,
                      label: "No Passwords",
                      desc: "Secure token-based authentication",
                    },
                    {
                      icon: CheckCircle,
                      label: "High Deliverability",
                      desc: "Verified sender reputation",
                    },
                    {
                      icon: AtSign,
                      label: "Real-time Tracking",
                      desc: "Opens and clicks",
                    },
                    {
                      icon: Shield,
                      label: "Fully Encrypted",
                      desc: "OAuth 2.0 Security",
                    },
                  ].map((benefit, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60"
                    >
                      <benefit.icon
                        className={`w-5 h-5 mt-0.5 ${senderType === "gmail" ? "text-rose-400" : "text-blue-400"}`}
                      />
                      <div>
                        <p className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight">
                          {benefit.label}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-1">
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={
                      senderType === "gmail"
                        ? handleGmailOAuth
                        : handleOutlookOAuth
                    }
                    className={`px-12 py-5 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest text-white shadow-2xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-4 ${
                      senderType === "gmail"
                        ? "bg-rose-600 shadow-rose-600/30"
                        : "bg-blue-600 shadow-blue-600/30"
                    }`}
                  >
                    {senderType === "gmail" ? (
                      <Google className="w-5 h-5" />
                    ) : (
                      <Microsoft className="w-5 h-5" />
                    )}
                    Connect {senderType === "gmail" ? "Gmail" : "Outlook"}
                  </button>
                </div>
              </div>
            </div>
          ) : senderType === "smtp" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-tighter">
                      Sender Information
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Basic details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group space-y-2">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                      Display Name
                    </p>
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
                      className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                      placeholder="e.g. John Smith"
                    />
                  </div>
                  <div className="group space-y-2">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                      Email Address
                    </p>
                    <input
                      type="email"
                      value={smtpData.email}
                      onChange={(e) =>
                        setSmtpData({ ...smtpData, email: e.target.value })
                      }
                      required
                      disabled={isSubmitting}
                      className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                      placeholder="sender@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 p-2 rounded-4xl border-2 border-slate-100 flex gap-2">
                {[
                  { id: "smtp", label: "Outgoing (SMTP)", icon: Server },
                  {
                    id: "imap",
                    label: "Receiving (IMAP)",
                    icon: Mail,
                    tag: "Optional",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSettingsTab(tab.id)}
                    disabled={isSubmitting}
                    className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                      settingsTab === tab.id
                        ? "bg-white text-blue-600 shadow-xl shadow-slate-200/50 border border-slate-100"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">
                      {tab.label}
                    </span>
                    {tab.tag && (
                      <span className="text-[8px] font-bold text-slate-400 lowercase italic">
                        ({tab.tag})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {settingsTab === "smtp" ? (
                <div className="animate-in fade-in duration-500 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                        SMTP Host
                      </p>
                      <input
                        type="text"
                        value={smtpData.host}
                        onChange={(e) =>
                          setSmtpData({ ...smtpData, host: e.target.value })
                        }
                        required
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                        SMTP Port
                      </p>
                      <input
                        type="number"
                        value={smtpData.port}
                        onChange={(e) =>
                          setSmtpData({ ...smtpData, port: e.target.value })
                        }
                        required
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                        placeholder="587"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                        Username
                      </p>
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
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                        placeholder="username@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                        Password
                      </p>
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
                          className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none pr-14"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={smtpData.secure}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              secure: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-12 h-7 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5 shadow-sm"></div>
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">
                        Use SSL/TLS
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={testSmtpConnection}
                      disabled={
                        isSmtpTesting || !smtpData.host || !smtpData.password
                      }
                      className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isSmtpTesting ? "animate-spin" : ""}`}
                      />
                      {isSmtpTesting ? "Testing..." : "Test SMTP"}
                    </button>
                  </div>

                  {smtpTestResult && (
                    <div
                      className={`p-6 rounded-4xl border-2 animate-in slide-in-from-top-4 duration-500 ${
                        smtpTestResult.success
                          ? "bg-emerald-50/50 border-emerald-100"
                          : "bg-rose-50/50 border-rose-100"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${smtpTestResult.success ? "bg-emerald-500" : "bg-rose-500"}`}
                        >
                          {smtpTestResult.success ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-[10px] font-extrabold uppercase tracking-widest ${smtpTestResult.success ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {smtpTestResult.success ? "Success" : "Failed"}
                          </p>
                          <p
                            className={`text-xs font-bold mt-1 ${smtpTestResult.success ? "text-emerald-700" : "text-rose-700"}`}
                          >
                            {smtpTestResult.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-in fade-in duration-500 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                        IMAP Host
                      </p>
                      <input
                        type="text"
                        value={smtpData.imapHost || ""}
                        onChange={(e) =>
                          setSmtpData({
                            ...smtpData,
                            imapHost: e.target.value,
                          })
                        }
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                        placeholder="imap.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                        IMAP Port
                      </p>
                      <input
                        type="number"
                        value={smtpData.imapPort || ""}
                        onChange={(e) =>
                          setSmtpData({
                            ...smtpData,
                            imapPort: e.target.value,
                          })
                        }
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                        placeholder="993"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                        IMAP Username
                      </p>
                      <input
                        type="text"
                        value={smtpData.imapUser || ""}
                        onChange={(e) =>
                          setSmtpData({
                            ...smtpData,
                            imapUser: e.target.value,
                          })
                        }
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                        placeholder="username@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                        IMAP Password
                      </p>
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
                          className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none pr-14"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowImapPassword(!showImapPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showImapPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={smtpData.imapSecure || false}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              imapSecure: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-12 h-7 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5 shadow-sm"></div>
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">
                        Use SSL/TLS
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={testImapConnection}
                      className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isImapTesting ? "animate-spin" : ""}`}
                      />
                      {isImapTesting ? "Testing..." : "Test IMAP"}
                    </button>
                  </div>

                  {imapTestResult && (
                    <div
                      className={`p-6 rounded-4xl border-2 animate-in slide-in-from-top-4 duration-500 ${
                        imapTestResult.success
                          ? "bg-emerald-50/50 border-emerald-100"
                          : "bg-rose-50/50 border-rose-100"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${imapTestResult.success ? "bg-emerald-500" : "bg-rose-500"}`}
                        >
                          {imapTestResult.success ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-[10px] font-extrabold uppercase tracking-widest ${imapTestResult.success ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {imapTestResult.success ? "Success" : "Failed"}
                          </p>
                          <p
                            className={`text-xs font-bold mt-1 ${imapTestResult.success ? "text-emerald-700" : "text-rose-700"}`}
                          >
                            {imapTestResult.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                    <div className="flex gap-4">
                      <Zap className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
                        If you leave these empty, we'll try to use your sending
                        settings automatically.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 group">
              <div className="w-20 h-20 bg-white rounded-4xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-50">
                <Mail className="w-10 h-10 text-slate-200" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-2">
                Select a Provider
              </h4>
              <p className="text-xs text-slate-400 font-medium italic">
                Choose Gmail, Outlook, or Custom SMTP above.
              </p>
            </div>
          )}
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
              End-to-end encrypted
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowSenderModal(false)}
              className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95"
            >
              Cancel
            </button>
            {senderType === "smtp" && (
              <Button
                type="button"
                onClick={handleSmtpSubmit}
                disabled={isSubmitting || !smtpData.host || !smtpData.password}
                variant="primary"
                className="px-10 py-4 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Add Sender
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShowSender;
