import React, { useState } from 'react';
import { Lock, ShieldCheck, Save, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Input from '../../../../components/ui/input';
import Button from '../../../../components/ui/button';
import { useChangePassword } from '../../../../hooks/useAuth';
import toast from 'react-hot-toast';

const SecurityTab = () => {
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
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      toast.error('Please choose a stronger password');
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
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
            Security Settings
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Ensure your account is secure by using a strong password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-10">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Current Password
            </label>
            <Input.Password
              icon={Lock}
              placeholder="••••••••"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
              className="bg-white/50 border-slate-200/60 rounded-2xl h-12 text-sm font-bold placeholder:text-slate-300 focus:ring-blue-500/10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                New Password
              </label>
              <Input.Password
                icon={ShieldCheck}
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                className="bg-white/50 border-slate-200/60 rounded-2xl h-12 text-sm font-bold placeholder:text-slate-300 focus:ring-blue-500/10"
              />

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-6 space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Strength: {getStrengthText()}
                    </span>
                    <span className="text-[10px] font-black text-slate-400">
                      {passwordStrength}/5
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-300 shadow-sm`}
                      style={{ width: `${strengthPercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 mt-4">
                    <div className="flex items-center gap-3">
                      {passwordChecks.minLength ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-200" />
                      )}
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Min 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {passwordChecks.hasUpperCase ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-200" />
                      )}
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {passwordChecks.hasLowerCase ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-200" />
                      )}
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {passwordChecks.hasNumber ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-200" />
                      )}
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        A number
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Confirm New Password
              </label>
              <Input.Password
                icon={ShieldCheck}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="bg-white/50 border-slate-200/60 rounded-2xl h-12 text-sm font-bold placeholder:text-slate-300 focus:ring-blue-500/10"
              />

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-4 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-100/50">
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                        Passwords do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-10 mt-6 border-t border-slate-100/50 flex justify-end">
            <Button
              type="submit"
              disabled={changePassword.isPending}
              className="bg-blue-600 hover:bg-black text-white px-10 py-6 rounded-3xl shadow-xl shadow-blue-500/20 hover:shadow-black/20 transition-all duration-300 active:scale-95 text-[11px] font-black uppercase tracking-widest"
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-3" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SecurityTab;
