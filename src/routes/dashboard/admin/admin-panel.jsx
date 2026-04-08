import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Mail, 
  Info,
  Server,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ShowSender from '../../../modals/showsender';
import { 
  useCreateSmtpSender,
} from '../../../hooks/useSenders';

const AdminPanel = () => {
  const createSmtpSender = useCreateSmtpSender();
  
  const [showSenderModal, setShowSenderModal] = useState(false);
  const [senderType, setSenderType] = useState('gmail');
  const [smtpData, setSmtpData] = useState({
    displayName: '',
    email: '',
    host: '',
    port: '587',
    username: '',
    password: '',
    secure: true,
    imapHost: '',
    imapPort: '993',
    imapSecure: true,
    imapUser: '',
    imapPassword: '',
    provider: 'custom',
    isSystemAccount: true, // Forced for Admin Panel
  });

  const handleGmailOAuth = () => {
    // Note: To support isSystemAccount via OAuth, the backend would need update.
    // For now, alerting the user or just proceeding.
    toast.error("OAuth system account support requires backend session update. Please use SMTP for now.");
    // initiateGmailOAuth(); 
  };

  const handleOutlookOAuth = () => {
    toast.error("OAuth system account support requires backend session update. Please use SMTP for now.");
    // initiateOutlookOAuth();
  };

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSmtpSender.mutateAsync({
        ...smtpData,
        isSystemAccount: true
      });
      setShowSenderModal(false);
      toast.success("System Mailbox added successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to add system mailbox");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck className="w-32 h-32 text-purple-600" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Admin Control Center</h1>
          </div>
          <p className="text-zinc-500 text-sm max-w-md">
            Manage global system assets and configuration. Changes here affect the core infrastructure of the platform.
          </p>
        </div>

        <button
          onClick={() => setShowSenderModal(true)}
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-semibold text-sm hover:bg-zinc-800 transition-all hover:shadow-lg active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add System Mailbox
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Pool Card */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-zinc-400" />
              <h2 className="font-bold text-zinc-900">System Mailbox Pool</h2>
            </div>
            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">
              Active
            </div>
          </div>
          
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 mb-2">
              <Mail className="w-8 h-8 text-zinc-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-zinc-900">No System Accounts Found</h3>
              <p className="text-zinc-500 text-sm max-w-xs">
                Add shared mailboxes that will be used to help &quot;warm up&quot; user accounts across the entire platform.
              </p>
            </div>
          </div>
        </div>

        {/* Global Stats Card */}
        <div className="space-y-6">
          <div className="bg-linear-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-purple-500/20">
            <div className="flex items-center justify-between mb-8">
              <div className="p-2 bg-white/10 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">System Health</span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">99.9%</div>
              <div className="text-purple-100/60 text-xs font-medium uppercase tracking-wider">Uptime Reliability</div>
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-2 mb-4 text-zinc-400">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Help & Info</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              System accounts are used as &quot;verified seeds&quot;. When a user has no one to interact with, the warmup worker picks a system account to ensure deliverability targets are reached.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSenderModal && (
        <ShowSender
          setShowSenderModal={setShowSenderModal}
          setSenderType={setSenderType}
          senderType={senderType}
          handleGmailOAuth={handleGmailOAuth}
          handleOutlookOAuth={handleOutlookOAuth}
          handleSmtpSubmit={handleSmtpSubmit}
          smtpData={smtpData}
          setSmtpData={setSmtpData}
          isSubmitting={createSmtpSender.isPending}
        />
      )}
    </div>
  );
};

export default AdminPanel;
