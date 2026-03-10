import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Input from '../../components/ui/input';
import { KeyRound } from 'lucide-react';
import { useResetPassword } from '../../hooks/useAuth';
import { resetPasswordSchema } from '../../validators/reset-password.schema';
import { useToast } from '../../hooks/useToast';

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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const resetPassword = useResetPassword();

  const queryToken = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    token: queryToken,
    newPassword: '',
    confirmPassword: '',
  });

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

    const toastId = toast.loading('Resetting password...');

    try {
      await resetPassword.mutateAsync({
        token: formData.token,
        newPassword: formData.newPassword,
      });

      toast.dismiss(toastId);
      toast.success('Password reset successful!');
      navigate('/auth/login');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Invalid or expired link. Please request a new one.');
    }
  };

  const isLoading = resetPassword.isPending;

  return (
    <>
      <div className="text-center mb-8 md:mb-10">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
          <KeyRound className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
          Reset <span className="text-gradient">Password</span>
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
          Enter your new password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input.Password
          label="New Password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          error={errors.newPassword}
          disabled={isLoading}
          placeholder="••••••••"
          className="rounded-2xl border-slate-200/60"
        />

        <Input.Password
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          disabled={isLoading}
          placeholder="••••••••"
          className="rounded-2xl border-slate-200/60"
        />

        {errors.token && (
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2 px-1 text-center">
            {errors.token}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          <Link
            to="/auth/login"
            className="text-blue-600 hover:text-blue-700 font-extrabold transition-colors ml-1"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </>
  );
};

export default ResetPassword;
