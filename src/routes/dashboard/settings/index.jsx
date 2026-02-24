import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, Box, Settings as SettingsIcon, Bell, CreditCard } from 'lucide-react';

// Components
import ProfileTab from './components/profile-tab';
import SecurityTab from './components/security-tab';
import ResourcesTab from './components/resources-tab';
import Dialog from '../../../components/ui/dialog';

// Hooks
import { useCurrentUser } from '../../../hooks/useAuth';
import { useSenders, useDeleteSender } from '../../../hooks/useSenders';
import { useTemplates, useDeleteTemplate } from '../../../hooks/useTemplate';
import { useBatches } from '../../../hooks/useBatches';
import { useCampaigns } from '../../../hooks/useCampaign';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeMenu, setActiveMenu] = useState('profile');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch Current User
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Fetch Resources Data
  const { data: senderResponse = { data: [] }, isLoading: sendersLoading } = useSenders({
    limit: 1000,
  });
  const senders = senderResponse.data || [];
  const { data: templates = [], isLoading: templatesLoading } = useTemplates();
  const { data: batches = [], isLoading: batchesLoading } = useBatches();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();

  // Resource Mutations
  const deleteSender = useDeleteSender();
  const deleteTemplate = useDeleteTemplate();

  const handleOnDeleteSender = (id) => {
    const sender = senders.find((s) => s.id === id);
    setDeleteTarget(
      sender
        ? { type: 'sender', id, label: sender.displayName || sender.email }
        : { type: 'sender', id, label: 'this sender' },
    );
    setDeleteDialogOpen(true);
  };

  const handleOnDeleteTemplate = (id) => {
    const template = templates.find((t) => t.id === id);
    setDeleteTarget(
      template
        ? { type: 'template', id, label: template.name }
        : { type: 'template', id, label: 'this template' },
    );
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'sender') {
        await deleteSender.mutateAsync({ senderId: deleteTarget.id });
        toast.success('Sender deleted');
      } else if (deleteTarget.type === 'template') {
        await deleteTemplate.mutateAsync(deleteTarget.id);
        toast.success('Template deleted');
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Personal details & avatar',
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Password & authentication',
    },
    {
      id: 'workspace',
      label: 'Resources',
      icon: Box,
      description: 'Senders, lists & templates',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Manage alerts',
      disabled: true,
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: CreditCard,
      description: 'Plans & invoices',
      disabled: true,
    },
  ];

  if (userLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-blue-500/20"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-400 mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <SettingsIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tighter">
              Account <span className="text-blue-600">Settings</span>
            </h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Personal account · Workspace resources · Security controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm shadow-emerald-500/5">
            Account Ready
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:w-80 shrink-0 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white/40 backdrop-blur-2xl border border-slate-200/50 p-2.5 rounded-[2.5rem] shadow-2xl shadow-slate-900/5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveMenu(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center p-3.5 rounded-[1.75rem] transition-all duration-300 group mb-1 last:mb-0 ${
                  activeMenu === item.id
                    ? 'bg-white text-blue-600 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100'
                    : item.disabled
                      ? 'opacity-40 cursor-not-allowed grayscale'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                <div
                  className={`p-2.5 rounded-2xl mr-4 transition-all duration-300 ${
                    activeMenu === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-white group-hover:text-blue-500 group-hover:border-blue-100'
                  }`}
                >
                  <item.icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <p
                    className={`font-black tracking-tight text-xs uppercase ${
                      activeMenu === item.id ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">
                    {item.description}
                  </p>
                </div>
                {item.disabled && (
                  <span className="ml-auto text-[7px] bg-slate-200/50 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-8 rounded-[2.5rem] bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-sm font-black uppercase tracking-widest mb-2">Need help?</h4>
              <p className="text-[10px] text-blue-50/70 mb-6 font-bold uppercase tracking-widest leading-loose">
                Check our documentation or contact support for advanced settings.
              </p>
              <button className="text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white text-white hover:text-blue-600 border border-white/20 px-6 py-2.5 rounded-2xl transition-all duration-300 active:scale-95 shadow-lg">
                Docs & Support
              </button>
            </div>
            <SettingsIcon className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-2000 pointer-events-none" />
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white/40 backdrop-blur-2xl border border-slate-200/50 rounded-[3rem] shadow-2xl shadow-slate-900/5 min-h-125 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeMenu === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProfileTab user={user} />
                </motion.div>
              )}
              {activeMenu === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SecurityTab />
                </motion.div>
              )}
              {activeMenu === 'workspace' && (
                <motion.div
                  key="workspace"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResourcesTab
                    senders={senders}
                    templates={templates}
                    batches={batches}
                    campaigns={campaigns}
                    loading={{
                      senders: sendersLoading,
                      templates: templatesLoading,
                      batches: batchesLoading,
                      campaigns: campaignsLoading,
                    }}
                    onDeleteSender={handleOnDeleteSender}
                    onDeleteTemplate={handleOnDeleteTemplate}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Dialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title={
          deleteTarget?.type === 'sender'
            ? 'Delete Sender'
            : deleteTarget?.type === 'template'
              ? 'Delete Template'
              : 'Delete Item'
        }
        description={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.label}? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={
          deleteTarget?.type === 'sender'
            ? deleteSender.isPending
            : deleteTarget?.type === 'template'
              ? deleteTemplate.isPending
              : false
        }
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Settings;
