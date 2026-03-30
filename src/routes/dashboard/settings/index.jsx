import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { User, Shield, Box, Settings as SettingsIcon, Bell, CreditCard } from 'lucide-react';
import { useState } from 'react';
// Components
import ProfileTab from './components/profile-tab';
import SecurityTab from './components/security-tab';
import ResourcesTab from './components/resources-tab';
import Dialog from '../../../components/ui/dialog';

// Hooks
import { useCurrentUser } from '../../../hooks/useAuth';
import { useSenders, useDeleteSender } from '../../../hooks/useSenders';
import { useBatches } from '../../../hooks/useBatches';
import { useCampaigns } from '../../../hooks/useCampaign';
import toast from 'react-hot-toast';

const Settings = () => {
  const { t } = useTranslation();
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
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();

  // Resource Mutations
  const deleteSender = useDeleteSender();

  const handleOnDeleteSender = (id) => {
    const sender = senders.find((s) => s.id === id);
    setDeleteTarget(
      sender
        ? { type: 'sender', id, label: sender.displayName || sender.email }
        : { type: 'sender', id, label: 'this sender' },
    );
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'sender') {
        await deleteSender.mutateAsync({ senderId: deleteTarget.id });
        toast.success(t('settings.delete.msg_sender'));
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || t('settings.delete.msg_error'));
    }
  };

  const menuItems = [
    {
      id: 'profile',
      label: t('settings.menu.profile'),
      icon: User,
      description: t('settings.menu.profile_desc'),
    },
    {
      id: 'security',
      label: t('settings.menu.security'),
      icon: Shield,
      description: t('settings.menu.security_desc'),
    },
    {
      id: 'workspace',
      label: t('settings.menu.workspace'),
      icon: Box,
      description: t('settings.menu.workspace_desc'),
    },
    {
      id: 'notifications',
      label: t('settings.menu.notifications'),
      icon: Bell,
      description: t('settings.menu.notifications_desc'),
      disabled: true,
    },
    {
      id: 'billing',
      label: t('settings.menu.billing'),
      icon: CreditCard,
      description: t('settings.menu.billing_desc'),
      disabled: true,
    },
  ];

  if (userLoading) {
    return (
      <div className="p-8 space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-4 w-96 bg-slate-100 animate-pulse rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-slate-50 animate-pulse rounded-lg border border-slate-100" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="lg:w-80 shrink-0 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
            ))}
          </aside>
          <main className="flex-1 min-w-0 bg-white/40 border border-slate-200/50 rounded-2xl p-8 min-h-[400px]">
            <div className="space-y-6">
              <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-md" />
              <div className="h-4 w-full bg-slate-100 animate-pulse rounded-md" />
              <div className="h-32 w-full bg-slate-50 animate-pulse rounded-xl" />
              <div className="grid grid-cols-2 gap-6">
                <div className="h-12 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-12 bg-slate-100 animate-pulse rounded-lg" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className=" w-full p-6 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            {t('settings.title')} <span className="ml-2">{t('settings.subtitle_short') || 'Account'}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t('settings.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 rounded-lg text-metadata bg-orange-50 text-orange-600 border border-orange-100/50">
            {t('settings.account_ready')}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:w-80 shrink-0 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white/40  border border-slate-200/50 p-2.5 rounded-xl shadow-sm shadow-slate-900/5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveMenu(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center p-3.5 rounded-lg transition-all duration-300 group mb-1 last:mb-0 ${
                  activeMenu === item.id
                    ? 'bg-white text-orange-600 shadow-sm shadow-slate-900/5 ring-1 ring-slate-100'
                    : item.disabled
                      ? 'opacity-40 cursor-not-allowed grayscale'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg ltr:mr-4 rtl:ml-4 transition-all duration-300 ${
                    activeMenu === item.id
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-white group-hover:text-orange-500 group-hover:border-orange-100'
                  }`}
                >
                  <item.icon className="w-4.5 h-4.5" />
                </div>
                <div className="ltr:text-left rtl:text-right">
                  <p
                    className={`text-sender ${
                      activeMenu === item.id ? 'text-slate-900 font-semibold' : 'text-slate-500 font-medium'
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-400 font-normal mt-0.5 opacity-70">
                    {item.description}
                  </p>
                </div>
                {item.disabled && (
                  <span className="ltr:ml-auto rtl:mr-auto text-metadata bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                    {t('settings.menu.soon')}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm relative overflow-hidden group">
            <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
              <SettingsIcon className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1.5">
              {t('settings.help.title')}
            </h4>
            <p className="text-xs text-slate-500 font-normal mb-5 leading-relaxed">
              {t('settings.help.desc')}
            </p>
            <button className="text-metadata text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-4 py-2 rounded-lg transition-all duration-200 active:scale-95">
              {t('settings.help.btn')}
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white/40  border border-slate-200/50 rounded-2xl shadow-sm shadow-slate-900/5 min-h-125 overflow-hidden">
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
                  <SecurityTab user={user} />
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
                    batches={batches}
                    campaigns={campaigns}
                    loading={{
                      senders: sendersLoading,
                      batches: batchesLoading,
                      campaigns: campaignsLoading,
                    }}
                    onDeleteSender={handleOnDeleteSender}
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
          deleteTarget?.type === 'sender' ? t('settings.delete.sender') : t('settings.delete.item')
        }
        description={
          deleteTarget ? t('settings.delete.confirm', { label: deleteTarget.label }) : ''
        }
        confirmText={t('common.delete')}
        confirmVariant="danger"
        isLoading={deleteTarget?.type === 'sender' ? deleteSender.isPending : false}
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
