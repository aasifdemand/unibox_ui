import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
 
  Info,
  Server,
  Activity,
  Zap,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import ShowSender from '../../../modals/showsender';
import { 
  useCreateSmtpSender,
  initiateGmailOAuth,
  initiateOutlookOAuth
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
    initiateGmailOAuth(true); 
  };
 
  const handleOutlookOAuth = () => {
    initiateOutlookOAuth(true);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
 
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
 
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4  w-full space-y-8"
    >
      {/* Header Section - Glassmorphic with subtle pattern */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden group rounded-3xl border border-white bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full scale-110" />
            <div className="w-16 h-16 bg-linear-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Control Center</h1>
              <div className="px-2 py-0.5 bg-purple-50 border border-purple-100 rounded-md">
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Root</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium max-w-md leading-relaxed">
              Manage global system accounts and configuration. Changes here affect the core infrastructure of the platform.
            </p>
          </div>
        </div>
 
        <button
          onClick={() => setShowSenderModal(true)}
          className="relative z-10 flex items-center gap-3 px-8 py-4 bg-linear-to-br from-purple-600 to-indigo-700 text-white rounded-2xl font-bold text-sm hover:shadow-[0_20px_40px_-10px_rgba(139,92,246,0.35)] transition-all active:scale-95 group shadow-xl"
        >
          <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </div>
          Add System Mailbox
          <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </button>
      </motion.div>
 
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* System Pool Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-8 bg-white border border-slate-200/60 rounded-lg shadow-sm overflow-hidden flex flex-col"
        >
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-xs">
                <Server className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-black text-slate-900 text-sm tracking-tight uppercase">System Mailbox Pool</h2>
                <span className="text-[10px] font-bold text-slate-400">SHARED ACCOUNTS</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Operational
            </div>
          </div>
          
          <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-linear-to-b from-white to-slate-50/30">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-slate-200 blur-3xl opacity-20 rounded-full" />
              <div className="relative w-24 h-24 bg-white rounded-lg shadow-2xl border border-slate-100 flex items-center justify-center transform hover:scale-110 transition-transform duration-500">
                <Layers className="w-10 h-10 text-slate-200" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>
            <div className="max-w-xs space-y-3">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">No System Accounts Found</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Add shared mailboxes that will be used to help &quot;warm up&quot; user accounts across the entire platform.
              </p>
            </div>
          </div>
        </motion.div>
 
        {/* Sidebar Stats */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* System Health Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden bg-linear-to-br from-purple-600 to-indigo-700 p-8 rounded-lg text-white shadow-2xl shadow-purple-500/20"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl grow-0 group-hover:bg-white/20 transition-all duration-700" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Live
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-5xl font-black tracking-tighter mb-1">99.9%</div>
                  <div className="text-purple-100/70 text-xs font-bold uppercase tracking-widest">Uptime Reliability</div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-purple-100/50 uppercase tracking-widest">Network Latency</span>
                    <span className="text-white">12ms</span>
                  </div>
                  <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-white rounded-full shadow-[0_0_10px_white]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
 
          {/* Help & Info - Light themed premium glass */}
          <motion.div 
            variants={itemVariants}
            className="relative overflow-hidden bg-purple-50/50 border border-purple-100/60 p-8 rounded-[2.2rem] text-slate-900 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-purple-100 shadow-sm">
                <Info className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Help & Info</span>
            </div>
            <div className="space-y-4">
              <p className="text-slate-700 text-[13px] font-bold leading-relaxed">
                System accounts are used as &quot;verified seeds&quot;. 
              </p>
              <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                When a user has no one to interact with, the warmup worker picks a system account to ensure deliverability targets are reached.
              </p>
            </div>
            
            <div className="mt-8 relative h-32 bg-white/60 border border-purple-100 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]">
                    <Shield className="w-full h-full p-4 text-purple-600" />
                </div>
                <Zap className="w-8 h-8 text-purple-600 blur-[2px] animate-pulse" />
                <Zap className="relative z-10 w-8 h-8 text-purple-500 shadow-sm" />
            </div>
          </motion.div>
        </div>
      </div>
 
      <AnimatePresence>
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
      </AnimatePresence>
    </motion.div>

  );
};

export default AdminPanel;
