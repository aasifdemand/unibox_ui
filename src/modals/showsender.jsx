import {
  Mail,
  RefreshCw,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Info,
  Play,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../components/shared/modal';
import { Microsoft } from '../icons/microsoft';
import { Google } from '../icons/google';
import { Smtp } from '../icons/smtp';
import Button from '../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import BulkSenderUpload from '../components/senders/BulkSenderUpload';
import { toast } from 'react-hot-toast';

// Import React Query hooks
import { useTestSmtp, useTestImap, useBulkCreateSenders } from '../hooks/useSenders';

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
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1: Main Selection, 2: Specific Form
  const [settingsTab, setSettingsTab] = useState('smtp');
  const [showPassword, setShowPassword] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null);
  const [imapTestResult, setImapTestResult] = useState(null);

  // React Query hooks
  const testSmtp = useTestSmtp();
  const testImap = useTestImap();
  const bulkCreate = useBulkCreateSenders();

  const handleBulkUpload = async (senders) => {
    try {
      await bulkCreate.mutateAsync(senders);
      toast.success('All mailboxes added successfully');
      setShowSenderModal(false);
    } catch (err) {
      toast.error(err.message || 'Bulk upload failed');
    }
  };

  const testSmtpConnection = async (e) => {
    e.preventDefault();
    setSmtpTestResult(null);
    try {
      await testSmtp.mutateAsync({
        host: smtpData.host,
        port: smtpData.port,
        secure: smtpData.secure,
        username: smtpData.username,
        password: smtpData.password,
      });
      setSmtpTestResult({ success: true, message: 'SMTP connection successful!' });
    } catch (err) {
      setSmtpTestResult({ success: false, message: err.message || 'SMTP connection failed.' });
    }
  };

  const testImapConnection = async (e) => {
    e.preventDefault();
    setImapTestResult(null);
    const imapHost = smtpData.imapHost || smtpData.host?.replace('smtp', 'imap');
    try {
      await testImap.mutateAsync({
        host: imapHost,
        port: smtpData.imapPort || 993,
        secure: smtpData.imapSecure !== undefined ? smtpData.imapSecure : true,
        user: smtpData.imapUser || smtpData.username,
        password: smtpData.imapPassword || smtpData.password,
      });
      setImapTestResult({ success: true, message: 'IMAP connection successful!' });
    } catch (err) {
      setImapTestResult({ success: false, message: err.message || 'IMAP connection failed.' });
    }
  };

  const isTesting = testSmtp.isPending || testImap.isPending;

  return (
    <Modal
      isOpen={true}
      onClose={() => setShowSenderModal(false)}
      maxWidth="max-w-4xl"
      closeOnBackdrop={true}
    >
      <div className="bg-linear-to-br from-purple-600 to-purple-700 p-8 relative overflow-hidden group rounded-t-lg border-b border-purple-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Mail className="w-24 h-24 text-white" />
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {t('mailboxes.add_mailbox')}
              </h3>
              <p className="text-xs font-semibold text-purple-100/60 mt-0.5">
                Connect your email account in minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stepper Outside Header - Focused on White Background */}
        <div className="flex items-center gap-8 justify-center mb-10 bg-slate-50/50 border border-slate-200/60 py-4 px-8 rounded-2xl pointer-events-none shadow-xs">
            <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full ${step === 1 ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-[11px] font-black transition-all duration-500`}>1</div>
                <span className={`text-xs font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>Selection</span>
            </div>
            <div className="w-8 h-px bg-slate-200" />
            <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full ${step === 2 ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-[11px] font-black transition-all duration-500`}>2</div>
                <span className={`text-xs font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>Setup</span>
            </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: CONCURRENT VIEW */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Configuration Box */}
              <div className="p-6 bg-purple-50/40 border-2 border-purple-100 rounded-lg relative group transition-all duration-300">
                <div className="absolute top-5 left-5">
                    <div className="w-5 h-5 rounded-full border-2 border-purple-600 bg-white flex items-center justify-center p-0.5">
                        <div className="w-full h-full bg-purple-600 rounded-full" />
                    </div>
                </div>
                
                <div className="flex items-start gap-5 ml-8">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/10">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 tracking-tight">Standard Connection</h4>
                                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Reliable and easy email sending</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
                            {[
                                'Quick Setup', 'Automated maintenance', 
                                'Standard Permissions', 'Optimized settings'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-3 text-purple-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 tracking-tight">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Provider Selection */}
                        <div className="pt-6 border-t border-purple-100/40">
                            <h5 className="text-xs font-bold text-slate-800 mb-4">Choose your provider:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                   { id: 'gmail', label: 'Gmail / Google', icon: Google },
                                   { id: 'outlook', label: 'Outlook / Office 365', icon: Microsoft },
                                   { id: 'smtp', label: 'Other (Manual)', icon: Smtp },
                                ].map((provider) => (
                                   <button
                                     key={provider.id}
                                     onClick={() => {
                                         setSenderType(provider.id);
                                         setStep(2);
                                     }}
                                     className="group flex flex-col items-center bg-white border border-slate-100 rounded-lg p-5 transition-all hover:border-purple-600 hover:shadow-md active:scale-95"
                                   >
                                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110 text-purple-600">
                                            <provider.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-800 tracking-tight mb-2">{provider.label}</span>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 group-hover:text-purple-600 transition-all">
                                            <Play className="w-2.5 h-2.5 fill-current" />
                                            Tutorial
                                        </div>
                                   </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Bulk Section */}
              <div className="pt-2 border-t border-slate-50">
                <BulkSenderUpload onUpload={handleBulkUpload} isSubmitting={bulkCreate.isPending} />
              </div>
            </motion.div>
          )}

          {/* STEP 2: FORMS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {senderType === 'gmail' || senderType === 'outlook' ? (
                <div className="p-8 bg-purple-50/20 border border-purple-100 rounded-lg text-center space-y-6 relative overflow-hidden">
                   <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-white/50 flex items-center justify-center mx-auto mb-2 text-purple-600">
                        <Shield className="w-8 h-8" />
                   </div>
                   <div>
                        <h4 className="text-lg font-bold text-slate-800 tracking-tight">Secure Connection</h4>
                        <p className="text-xs font-semibold text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                            Complete your connection safely through {senderType === 'gmail' ? 'Google' : 'Microsoft'}.
                            {senderType === 'gmail' && <span className="block mt-1 text-purple-600 font-bold italic">Note: Google Workspace accounts only. Personal @gmail.com accounts are not supported.</span>}
                        </p>
                   </div>
                   <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        <button
                            onClick={senderType === 'gmail' ? handleGmailOAuth : handleOutlookOAuth}
                            className={`w-full py-4 rounded-lg text-white font-bold text-sm shadow-md shadow-purple-600/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700`}
                        >
                            {senderType === 'gmail' ? <Google className="w-5 h-5 text-white" /> : <Microsoft className="w-5 h-5 text-white" />}
                            Connect {senderType === 'gmail' ? 'Google' : 'Outlook'}
                        </button>
                        <button 
                            onClick={() => setStep(1)}
                            className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 text-purple-600" />
                            Back to Methods
                        </button>
                   </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                <Smtp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 tracking-tight">Manual Connection</h4>
                                <p className="text-xs font-semibold text-slate-400">Add any other email provider</p>
                            </div>
                        </div>
                        <button 
                          onClick={() => setStep(1)} 
                          className="flex items-center gap-2 text-[9px] font-bold text-slate-400 hover:text-slate-800 uppercase tracking-widest transition-all"
                        >
                          <RotateCcw className="w-3 h-3 text-purple-600" />
                          Methods
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-2">
                        <div className="space-y-2">
                           <label className="block text-[13px] font-semibold text-slate-800 ml-1">Display Name</label>
                           <input
                             type="text"
                             value={smtpData.displayName}
                             onChange={(e) => setSmtpData({ ...smtpData, displayName: e.target.value })}
                             className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm hover:border-slate-300"
                             placeholder="John Doe"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="block text-[13px] font-semibold text-slate-800 ml-1">Email Address</label>
                           <input
                             type="email"
                             value={smtpData.email}
                             onChange={(e) => setSmtpData({ ...smtpData, email: e.target.value })}
                             className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm hover:border-slate-300"
                             placeholder="john@example.com"
                           />
                        </div>
                    </div>

                    <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex items-start gap-4 mb-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                            <Info className="w-4 h-4 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-[11px] font-black text-purple-900 uppercase tracking-widest">Setup Guide</h5>
                            <p className="text-xs font-semibold text-purple-700/80 leading-relaxed">
                                Use <strong>Sending Settings</strong> for outbound mail and <strong>Receiving Settings</strong> to track replies. 
                                Most providers (Gmail, Zoho, Outlook) require an <strong className="text-purple-900">App Password</strong> instead of your regular login.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1.5 border border-slate-200/60 shadow-inner">
                        {['smtp', 'imap'].map(t => (
                            <button
                             key={t}
                             onClick={() => setSettingsTab(t)}
                             className={`flex-1 py-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98] ${settingsTab === t ? 'bg-white text-purple-600 shadow-md border border-slate-100 ring-4 ring-purple-500/5' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {t === 'smtp' ? 'Sending (SMTP)' : 'Receiving (IMAP)'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-2">
                        <div className="space-y-2">
                            <label className="block text-[13px] font-semibold text-slate-800 ml-1">
                                {settingsTab === 'smtp' ? 'SMTP Host' : 'IMAP Host'}
                            </label>
                            <input
                              type="text"
                              value={settingsTab === 'smtp' ? smtpData.host : (smtpData.imapHost || '')}
                              onChange={(e) => setSmtpData({ ...smtpData, [settingsTab === 'smtp' ? 'host' : 'imapHost']: e.target.value })}
                              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm hover:border-slate-300"
                              placeholder={settingsTab === 'smtp' ? 'e.g. smtp.gmail.com' : 'e.g. imap.gmail.com'}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[13px] font-semibold text-slate-800 ml-1">Port</label>
                            <input
                              type="number"
                              value={settingsTab === 'smtp' ? smtpData.port : (smtpData.imapPort || '')}
                              onChange={(e) => {
                                const val = e.target.value;
                                const portNum = parseInt(val);
                                let newSecure = settingsTab === 'smtp' ? smtpData.secure : (smtpData.imapSecure || true);
                                
                                // Smart Auto-Toggle
                                if (settingsTab === 'smtp') {
                                    if (portNum === 465) newSecure = true;
                                    else if (portNum === 587) newSecure = false;
                                } else {
                                    if (portNum === 993) newSecure = true;
                                    else if (portNum === 143) newSecure = false;
                                }

                                setSmtpData({ 
                                    ...smtpData, 
                                    [settingsTab === 'smtp' ? 'port' : 'imapPort']: val,
                                    [settingsTab === 'smtp' ? 'secure' : 'imapSecure']: newSecure
                                });
                              }}
                              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm hover:border-slate-300"
                              placeholder={settingsTab === 'smtp' ? '587 or 465' : '993'}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[13px] font-semibold text-slate-800 ml-1">Username</label>
                            <input
                              type="text"
                              value={settingsTab === 'smtp' ? smtpData.username : (smtpData.imapUser || '')}
                              onChange={(e) => setSmtpData({ ...smtpData, [settingsTab === 'smtp' ? 'username' : 'imapUser']: e.target.value })}
                              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm hover:border-slate-300"
                              placeholder="your-email@domain.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[13px] font-semibold text-slate-800 ml-1">App Password</label>
                            <div className="relative group/pass">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  value={settingsTab === 'smtp' ? smtpData.password : (smtpData.imapPassword || '')}
                                  onChange={(e) => setSmtpData({ ...smtpData, [settingsTab === 'smtp' ? 'password' : 'imapPassword']: e.target.value })}
                                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none pr-12 transition-all shadow-sm hover:border-slate-300"
                                  placeholder="Your unique app secret"
                                />
                                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-all p-1 hover:bg-purple-50 rounded-lg">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={settingsTab === 'smtp' ? smtpData.secure : (smtpData.imapSecure || true)}
                                  onChange={(e) => setSmtpData({ ...smtpData, [settingsTab === 'smtp' ? 'secure' : 'imapSecure']: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-6 bg-slate-200 peer-checked:bg-purple-600 rounded-full transition-all duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
                           </div>
                           <span className="text-[10px] font-bold text-slate-500 uppercase">Secure Connection</span>
                        </label>
                        <div className="flex gap-3">
                             <button
                               onClick={settingsTab === 'smtp' ? testSmtpConnection : testImapConnection}
                               disabled={isTesting}
                               className="px-6 py-2.5 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-purple-600 transition-all bg-white"
                             >
                               {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Test'}
                             </button>
                             <Button 
                               onClick={handleSmtpSubmit}
                               disabled={isSubmitting || !smtpData.host || !smtpData.password}
                               className="px-8 py-2.5 rounded-lg text-[9px] font-black tracking-widest"
                             >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Save'}
                             </Button>
                        </div>
                    </div>

                    {/* Results Container */}
                    <AnimatePresence>
                        {(smtpTestResult || imapTestResult) && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-3 rounded-lg flex items-center gap-3 ${((settingsTab === 'smtp' ? smtpTestResult : imapTestResult)?.success) ? 'bg-purple-50 border border-purple-100' : 'bg-rose-50 border border-rose-100'}`}
                            >
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${((settingsTab === 'smtp' ? smtpTestResult : imapTestResult)?.success) ? 'bg-purple-600' : 'bg-rose-600'}`}>
                                    {((settingsTab === 'smtp' ? smtpTestResult : imapTestResult)?.success) ? <CheckCircle2 className="w-3 h-3 text-white" /> : <AlertCircle className="w-3 h-3 text-white" />}
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${((settingsTab === 'smtp' ? smtpTestResult : imapTestResult)?.success) ? 'text-purple-800' : 'text-rose-800'}`}>
                                    {(settingsTab === 'smtp' ? smtpTestResult : imapTestResult)?.message}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Branded Footer */}
      <div className="px-8 pb-8 flex items-center gap-8 border-t border-slate-200/60 pt-6 bg-slate-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center border border-purple-100">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-80">256-bit AES Encryption</span>
          </div>
          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-8">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
                <Info className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-80">SOC2 Type II Certified</span>
          </div>
      </div>
    </Modal>
  );
};

export default ShowSender;
