import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Components
import ProfileTab from './components/profile-tab';
import SecurityTab from './components/security-tab';
import Dialog from '../../../components/ui/dialog';

// Hooks
import { useCurrentUser } from '../../../hooks/useAuth';
import { useDeleteSender } from '../../../hooks/useSenders';


const Settings = () => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch Current User
  const { data: user, isLoading: userLoading } = useCurrentUser();


  

  // Resource Mutations
  const deleteSender = useDeleteSender();

  

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

  if (userLoading) {
    return (
      <div className="w-full p-4 animate-in fade-in duration-500">
        <div className="max-w-7xl">
          <div className="space-y-8 mt-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-8 space-y-6 animate-pulse">
                <div className="h-6 w-48 bg-slate-100 rounded-md" />
                <div className="h-4 w-full bg-slate-50 rounded-md" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
                  <div className="h-14 bg-slate-50 rounded-lg" />
                  <div className="h-14 bg-slate-50 rounded-lg" />
                  <div className="h-14 bg-slate-50 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4  animate-in fade-in duration-500">
      <div className="max-w-7xl">
        {/* Modular Settings Stack */}
        <div className="space-y-8">
          {/* 1. Core Profile & Identity */}
          <ProfileTab user={user} />

          {/* 2. Security & Assets (Pass-down logic to cards) */}
          <SecurityTab user={user} />
        </div>

        {/* Support Footer - Refined Typography */}
        <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-5 shadow-sm">
            <SettingsIcon className="w-5 h-5 text-purple-600" />
          </div>
          <h4 className="text-base font-extrabold text-slate-800 mb-1.5 font-display">
            {t('settings.help.title', 'Need additional help?')}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-8 font-sans">
            {t('settings.help.desc', 'Technical assistance with custom infrastructure or billing.')}
          </p>
          <button className="h-11 px-10 bg-white text-purple-600 border border-purple-200 hover:border-purple-600 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm hover:shadow-purple-500/5 active:scale-95 font-display">
            {t('settings.help.btn', 'Contact Support')}
          </button>
        </div>
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
