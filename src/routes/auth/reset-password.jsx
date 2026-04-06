import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../../components/ui/input';
import { KeyRound } from 'lucide-react';
import { useResetPassword } from '../../hooks/useAuth';
import { resetPasswordSchema } from '../../validators/reset-password.schema';
import { useToast } from '../../hooks/useToast';
import { motion } from 'motion/react';
import TurnstileWidget from '../../components/auth/TurnstileWidget';

const mapZodErrors = (zodError) => {
  if (!zodError || !Array.isArray(zodError.issues)) return {};
  const errors = {};
  zodError.issues.forEach((issue) => {
    const field = issue.path?.[0];
    if (field) errors[field] = issue.message;
  });
  return errors;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const resetPassword = useResetPassword();

  const queryToken = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    token: queryToken,
    newPassword: '',
    confirmPassword: '',
  });

  const [turnstileToken, setTurnstileToken] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return;
    }

    if (!formData.token) {
      setErrors({ token: 'Invalid reset link. Token is missing.' });
      return;
    }

    if (!turnstileToken) {
      toast.error('Please complete the security check.');
      return;
    }

    const toastId = toast.loading('Resetting password...');

    try {
      await resetPassword.mutateAsync({
        token: formData.token,
        newPassword: formData.newPassword,
        turnstileToken,
      });

      toast.dismiss(toastId);
      toast.success('Password reset successful!');
      navigate('/auth/login');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Invalid or expired link. Please request a new one.');
      setTurnstileToken(null);
    }
  };

  const isLoading = resetPassword.isPending;

  return (
    <>
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-12 h-12 bg-purple-50/50  rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm border border-purple-100"
        >
          <KeyRound className="w-6 h-6 text-purple-600" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Reset <span className="text-gradient leading-relaxed">Password</span>
        </h2>
        <p className="text-[14px] font-medium text-slate-500 mt-1">
          Enter your new password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input.Password
          label="New Password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          error={errors.newPassword}
          disabled={isLoading}
          placeholder="••••••••"
          className="rounded-lg border-slate-200/60"
        />

        <Input.Password
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          disabled={isLoading}
          placeholder="••••••••"
          className="rounded-lg border-slate-200/60"
        />

        {errors.token && (
          <p className="text-[12px] font-medium text-red-500 mt-2 px-1 text-center leading-relaxed">
            {errors.token}
          </p>
        )}

        <div className="flex justify-center -mt-2">
           <TurnstileWidget onSuccess={(token) => setTurnstileToken(token)} />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="btn-primary w-full py-3.5 rounded-md text-[14px] font-bold tracking-tight shadow-sm shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            disabled={isLoading || !turnstileToken}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Reset Password'
            )}
          </button>
        </div>
      </form>

      <div className="mt-10 text-center">
        <p className="text-[13px] font-medium text-slate-500">
          <Link
            to="/auth/login"
            className="text-purple-600 hover:text-purple-700 font-bold transition-colors ml-1"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </>
  );
};

export default ResetPassword;
