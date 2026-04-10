import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/input';
import { Mail } from 'lucide-react';
import { useForgotPassword } from '../../hooks/useAuth';
import { forgotPasswordSchema } from '../../validators/forgot-password.schema';
import { useToast } from '../../hooks/useToast';
import { mapZodErrors } from '../../utils/map-zod';
import { motion } from "motion/react"

const ForgotPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const forgotPassword = useForgotPassword();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return;
    }

    const toastId = toast.loading('Sending reset instructions...');

    try {
      await forgotPassword.mutateAsync({ email });
      toast.dismiss(toastId);
      toast.success('Reset instructions sent!');
      setIsSubmitted(true);
      setErrors({});
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  return (
    <>
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-12 h-12 bg-purple-50/50  rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm border border-purple-100"
        >
          <Mail className="w-6 h-6 text-purple-600" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Reset <span className="text-gradient leading-relaxed">Password</span>
        </h2>
        <p className="text-[14px] font-medium text-slate-500 mt-1">
          We&apos;ll send you instructions
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors({});
              }
            }}
            placeholder="name@example.com"
            required
            icon={Mail}
            error={errors.email}
            disabled={forgotPassword.isPending}
            className="rounded-lg border-slate-200/60"
          />

          <div className="pt-2">
            <button
              type="submit"
              className="btn-primary w-full py-3.5 rounded-md text-[14px] font-bold tracking-tight shadow-sm shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Send Instructions'
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="p-6 bg-purple-50/50  rounded-lg border border-purple-100/50">
            <p className="text-[14px] font-bold text-purple-800 leading-relaxed">
              Check your email
            </p>
            <p className="text-xs text-purple-700 mt-2 font-medium">
              We&apos;ve sent reset instructions to <br />
              <strong className="text-purple-900">{email}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[13px] font-medium text-slate-500">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>

          <div className="space-y-3 pt-4">
            <button
              type="button"
              className="w-full py-3.5 bg-white border border-slate-200 rounded-md text-[14px] font-bold text-slate-700 tracking-tight hover:bg-slate-50 transition-all border-dashed shadow-xs active:scale-95"
              onClick={() => setIsSubmitted(false)}
            >
              Try again
            </button>

            <button
              type="button"
              className="w-full py-2 text-[13px] font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              onClick={() => navigate('/auth/login')}
            >
              Back to sign in
            </button>
          </div>
          </div>
        </div>
      )}

      {!isSubmitted && (
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
      )}
    </>
  );
};

export default ForgotPassword;
