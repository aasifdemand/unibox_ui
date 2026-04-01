/* eslint-disable react-hooks/set-state-in-effect */
import { Loader2, Globe, Edit3, Shield, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Input from '../../../../components/ui/input';
import { useUpdateProfile } from '../../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useState, useMemo, useEffect } from 'react';
import { DateTime } from 'luxon';
import { getIanaTimezone, getAllTimezones } from '../../campaigns/campaign-utils';

const ProfileTab = ({ user }) => {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    designation: user?.designation || '',
    timezone: user?.timezone || 'UTC',
  });

  const [currentTime, setCurrentTime] = useState('');

  // Live Clock Effect: Updates every second based on selected timezone
  useEffect(() => {
    const updateTime = () => {
      const iana = getIanaTimezone(formData.timezone);
      const time = DateTime.now().setZone(iana).toFormat('hh:mm:ss a');
      setCurrentTime(time);
    };

    updateTime(); // Initial call
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [formData.timezone]);

  // Keep formData in sync with user resource when NOT editing
  useEffect(() => {
    if (!isEditing && user) {
      setFormData({
        name: user.name || '',
        designation: user.designation || '',
        timezone: user.timezone || 'UTC',
      });
    }
  }, [user, isEditing]);

  const timezones = useMemo(() => getAllTimezones(), []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      toast.success(t('settings.profile.update_success'));
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleTimezoneChange = (newTz) => {
    setFormData((prev) => ({ ...prev, timezone: newTz }));
    updateProfile.mutate({ timezone: newTz });
  };

  return (
    <div className="space-y-8">
      {/* Identity Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight font-display">
              {t('settings.profile.personal_info', 'Personal Information')}
            </h3>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1 font-sans">
              {t('settings.profile.personal_subtitle', 'UPDATE YOUR PERSONAL DETAILS AND HOW OTHERS SEE YOU ON THE PLATFORM.')}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 h-9 px-4 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all font-display"
          >
            {isEditing ? (
              <>
                <Globe className="w-3.5 h-3.5" /> {t('settings.profile.view_mode', 'View Mode')}
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" /> {t('settings.profile.edit_mode', 'Edit Profile')}
              </>
            )}
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-50 flex items-center justify-center shadow-inner group">
              <span className="text-2xl font-extrabold text-slate-300 font-display">
                {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'AA'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
                {user?.name || 'Aasif Ali'}
              </h2>
              <p className="text-xs font-semibold text-slate-400 font-sans mt-0.5">
                {user?.email || 'aasifdemand@gmail.com'}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Full Name */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">
                   {t('settings.profile.full_name', 'FULL NAME')}
                </label>
                {isEditing ? (
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-50/50 border-slate-200 rounded-lg h-11 text-xs font-semibold font-sans"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                    {user?.name || 'Aasif Ali'}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">
                   {t('settings.profile.email_address', 'EMAIL ADDRESS')}
                </label>
                <p className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                  {user?.email || 'aasifdemand@gmail.com'}
                </p>
              </div>

              {/* Designation */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">
                   {t('settings.profile.designation', 'DESIGNATION')}
                </label>
                {isEditing ? (
                  <Input
                    name="designation"
                    value={formData.designation}
                    placeholder={"your designation"}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="bg-slate-50/50 border-slate-200 rounded-lg h-11 text-xs font-semibold font-sans"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                    {user?.designation || 'NA'}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: user?.name || '',
                      designation: user?.designation || '',
                      timezone: user?.timezone || 'UTC',
                    });
                    setIsEditing(false);
                  }}
                  className="h-11 px-8 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all font-display shadow-sm active:scale-95"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="h-11 px-10 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-lg shadow-orange-500/20 transition-all font-display text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 disabled:opacity-50"
                >
                  {updateProfile.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t('settings.profile.save_changes', 'SAVE CHANGES')}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* System Settings Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-white">
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5 font-display">
            <Globe className="w-4 h-4 text-orange-600" />
            {t('settings.profile.system_settings', 'System Settings')}
          </h3>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1 font-sans">
             {t('settings.profile.system_subtitle', 'CONFIGURE YOUR SYSTEM LEVEL PREFERENCES.')}
          </p>
        </div>

        <div className="p-8">
          <div className="max-w-md space-y-4">
             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">
                {t('settings.profile.timezone', 'SYSTEM TIMEZONE')} <span className="text-red-500">*</span>
             </label>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-slate-50/50 rounded-xl border border-slate-100 mb-8 group hover:border-orange-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {t('settings.profile.current_time', 'Current Target Time')}
                  </p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter tabular-nums font-mono">
                    {currentTime || '--:--:-- --'}
                  </p>
                </div>
              </div>
              <div className="ltr:md:text-right rtl:md:text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {t('settings.profile.status', 'Clock Status')}
                </p>
                <div className="flex items-center gap-2 md:justify-end">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                    {t('settings.profile.live_sync', 'Live Synchronized')}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative group">
              <select
                value={formData.timezone}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                disabled={updateProfile.isPending}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg h-11 px-4 text-xs font-bold font-sans text-slate-900 focus:bg-white focus:border-orange-50 outline-none transition-all appearance-none disabled:opacity-50"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-orange-500 text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans mt-2">
              {t('settings.profile.timezone_help', 'THIS ENSURES ALL YOUR OUTREACH AND REPORTING IS SYNCHRONIZED WITH YOUR LOCAL TIME.')}
            </p>
          </div>
        </div>
      </div>

     

      {/* Security Hub Section Header Style */}
      <div className="pt-4">
         <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5 font-display ltr:ml-1">
            <Shield className="w-4 h-4 text-orange-600" />
            {t('settings.profile.security_settings', 'Security Settings')}
          </h3>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1 font-sans ltr:ml-1">
            {t('settings.profile.security_subtitle', 'ENSURE YOUR ACCOUNT IS SECURE BY USING A STRONG PASSWORD.')}
          </p>
      </div>
    </div>
  );
};

export default ProfileTab;
