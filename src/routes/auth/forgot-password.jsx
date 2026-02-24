import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/input';
import { Mail } from 'lucide-react';
import { useForgotPassword } from '../../hooks/useAuth';
import { forgotPasswordSchema } from '../../validators/forgot-password.schema';
import { useToast } from '../../hooks/useToast';
import { mapZodErrors } from '../../utils/map-zod';

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
      await forgotPassword.mutateAsync(email);
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
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
          Reset <span className="text-gradient">Password</span>
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
          We&apos;ll send you instructions
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
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
            className="rounded-2xl border-slate-200/60"
          />

          <button
            type="submit"
            className="btn-primary w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            disabled={forgotPassword.isPending}
          >
            {forgotPassword.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Send Instructions'
            )}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="p-6 bg-emerald-50/50 backdrop-blur-sm rounded-3xl border border-emerald-100/50">
            <p className="text-sm font-bold text-emerald-800 leading-relaxed uppercase tracking-wider">
              Check your email
            </p>
            <p className="text-xs text-emerald-700 mt-2 font-medium">
              We&apos;ve sent reset instructions to <br />
              <strong className="text-emerald-900">{email}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 uppercase tracking-widest hover:bg-slate-50 transition-all border-dashed shadow-xs active:scale-95"
                onClick={() => setIsSubmitted(false)}
              >
                Try again
              </button>

              <button
                type="button"
                className="w-full py-3 text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
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
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Link
              to="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-extrabold transition-colors ml-1"
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
