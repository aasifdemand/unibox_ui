import { Lock, ShieldCheck, Save, Loader2, CheckCircle, XCircle, Chrome } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Input from '../../../../components/ui/input';
import { useChangePassword } from '../../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useState } from 'react';

const SecurityTab = ({ user }) => {
  const { t } = useTranslation();
  const isGoogleUser = !!user?.googleId;
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const changePassword = useChangePassword();

  // Password strength validation
  const passwordChecks = {
    minLength: formData.newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.newPassword),
    hasLowerCase: /[a-z]/.test(formData.newPassword),
    hasNumber: /[0-9]/.test(formData.newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
  const strengthPercentage = (passwordStrength / 5) * 100;

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-purple-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return t('settings.security.levels.weak');
    if (passwordStrength <= 3) return t('settings.security.levels.fair');
    if (passwordStrength <= 4) return t('settings.security.levels.good');
    return t('settings.security.levels.strong');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t('settings.security.err_match'));
      return;
    }

    if (passwordStrength < 3) {
      toast.error(t('settings.security.err_strong'));
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success(t('settings.security.success'));
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.message || t('settings.security.error'));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-6 border-b border-slate-50 bg-white">
        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5 font-display">
          <Lock className="w-4 h-4 text-purple-600" />
          {t('settings.security.title', 'Security Settings')}
        </h3>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1 font-sans">
          {t('settings.security.subtitle', 'MANAGE YOUR ACCOUNT CREDENTIALS AND SECURITY PREFERENCES.')}
        </p>
      </div>

      <div className="p-8">
        <div className="max-w-4xl">
          {/* Google Auth Banner - High Density */}
          {isGoogleUser && (
            <div className="mb-10 flex items-start gap-4 p-5 rounded-lg bg-purple-50 border border-purple-100/50 border-dashed">
              <div className="w-10 h-10 rounded-lg bg-white border border-purple-200 flex items-center justify-center shrink-0 shadow-sm">
                <Chrome className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest font-display">
                  {t('settings.security.google_auth_title', 'Signed in with Google')}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 font-sans mt-0.5 leading-relaxed">
                  {t('settings.security.google_auth_desc', 'YOUR PASSWORD MANAGEMENT IS HANDLED THROUGH YOUR CONNECTED GOOGLE ACCOUNT.')}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <fieldset
              disabled={isGoogleUser}
              className={isGoogleUser ? 'opacity-40 pointer-events-none select-none' : ''}
            >
              <div className="grid gap-10">
                {/* Current Password */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">
                    {t('settings.security.current_password', 'CURRENT PASSWORD')}
                  </label>
                  <Input.Password
                    icon={Lock}
                    placeholder="••••••••"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    required
                    className="bg-slate-50/50 border-slate-200 rounded-lg h-11 text-xs font-semibold font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* New Password */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">
                      {t('settings.security.new_password', 'NEW PASSWORD')}
                    </label>
                    <Input.Password
                      icon={ShieldCheck}
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      required
                      className="bg-slate-50/50 border-slate-200 rounded-lg h-11 text-xs font-semibold font-sans"
                    />

                    {/* Password Strength Indicator - Tighter */}
                    {formData.newPassword && (
                      <div className="mt-6 space-y-4 bg-slate-50/80 p-5 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 font-display">
                            {t('settings.security.strength', { level: getStrengthText() })}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 opacity-70 font-sans">
                            {passwordStrength}/5
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white border border-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full ${getStrengthColor()} transition-all duration-300 shadow-sm`}
                            style={{ width: `${strengthPercentage}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 mt-4">
                          {[
                            { key: 'minLength', label: 'min_chars' },
                            { key: 'hasUpperCase', label: 'upper' },
                            { key: 'hasLowerCase', label: 'lower' },
                            { key: 'hasNumber', label: 'number' }
                          ].map((check) => (
                             <div key={check.key} className="flex items-center gap-3">
                               {passwordChecks[check.key] ? (
                                 <CheckCircle className="w-4 h-4 text-purple-600" />
                               ) : (
                                 <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                               )}
                               <span className={`text-[10px] font-bold uppercase tracking-widest font-display ${passwordChecks[check.key] ? 'text-slate-800' : 'text-slate-400 opacity-60'}`}>
                                 {t(`settings.security.checks.${check.label}`)}
                               </span>
                             </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">
                      {t('settings.security.confirm_password', 'CONFIRM NEW PASSWORD')}
                    </label>
                    <Input.Password
                      icon={ShieldCheck}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="bg-slate-50/50 border-slate-200 rounded-lg h-11 text-xs font-semibold font-sans"
                    />

                    {/* Password Match Indicator - Compact */}
                    {formData.confirmPassword && (
                      <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50/50 border border-purple-100">
                        {formData.newPassword === formData.confirmPassword ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-purple-600" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 font-display">
                              {t('settings.security.match', 'PASSWORDS MATCH')}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 font-display">
                              {t('settings.security.mismatch', 'PASSWORDS DO NOT MATCH')}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-8 mt-4 border-t border-slate-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={changePassword.isPending || isGoogleUser}
                    className="h-11 px-10 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed font-display"
                  >
                    {changePassword.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('settings.security.updating')}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {t('settings.security.change_password', 'UPDATE PASSWORD')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
