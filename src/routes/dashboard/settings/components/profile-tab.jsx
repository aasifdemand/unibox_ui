import { User, Mail, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import Input from '../../../../components/ui/input';
import Button from '../../../../components/ui/button';
import { useUpdateProfile } from '../../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useState } from 'react';

const ProfileTab = ({ user }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const updateProfile = useUpdateProfile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      toast.success(t('settings.profile.success'));
    } catch (error) {
      toast.error(error.message || t('settings.profile.error'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="p-10 md:p-12 overflow-y-auto max-h-[70vh]"
    >
      <div className="max-w-4xl">
        <div className="mb-12">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            {t('settings.profile.title')}
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            {t('settings.profile.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ltr:ml-1 ltr:mr-1 rtl:ml-1">
              {t('settings.profile.full_name')}
            </label>
            <Input
              icon={User}
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-white/50 border-slate-200/60 rounded-2xl h-12 text-sm font-bold placeholder:text-slate-300 focus:ring-blue-500/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ltr:ml-1 ltr:mr-1 rtl:ml-1">
              {t('settings.profile.email_address')}
            </label>
            <Input
              icon={Mail}
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              helperText={
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-loose mt-2 block">
                  {t('settings.profile.email_helper')}
                </span>
              }
              className="bg-white/50 border-slate-200/60 rounded-2xl h-12 text-sm font-bold placeholder:text-slate-300 focus:ring-blue-500/10"
            />
          </div>

          <div className="pt-10 mt-6 border-t border-slate-100/50 flex justify-end">
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              className="bg-blue-600 hover:bg-black text-white px-10 py-6 rounded-3xl shadow-xl shadow-blue-500/20 hover:shadow-black/20 transition-all duration-300 active:scale-95 text-[11px] font-black uppercase tracking-widest"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ltr:mr-3 rtl:ml-3 animate-spin" />
                  {t('settings.profile.updating')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ltr:mr-3 rtl:ml-3" />
                  {t('settings.profile.save_changes')}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfileTab;
