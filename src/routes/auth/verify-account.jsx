// src/pages/auth/VerifyAccount.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import OTPInput from 'react-otp-input';
import Input from '../../components/ui/input';
import { Mail } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useVerifyAccount, useResendVerification, useCurrentUser } from '../../hooks/useAuth';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const verifyAccount = useVerifyAccount();
  const resendVerification = useResendVerification();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Redirect if already verified
  useEffect(() => {
    if (user?.isVerified) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!email) {
      navigate('/auth/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (!canResend && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [canResend, resendTimer]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter 6-digit code');
      return;
    }

    const toastId = toast.loading('Verifying email...');

    try {
      await verifyAccount.mutateAsync({ email, otp });
      toast.dismiss(toastId);
      toast.success('Email verified successfully!');
      // Don't navigate here - let the useEffect handle it
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Invalid or expired code');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    const toastId = toast.loading('Sending new code...');

    try {
      await resendVerification.mutateAsync(email);
      toast.dismiss(toastId);
      toast.success('New verification code sent!');
      setCanResend(false);
      setResendTimer(60);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Failed to resend code');
    }
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const isLoading = verifyAccount.isPending || resendVerification.isPending || userLoading;

  // Don't render if already verified (prevents flash)
  if (user?.isVerified) {
    return null;
  }

  return (
    <>
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
          Verify <span className="text-gradient">Email</span>
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <Input
          label="Email"
          type="email"
          value={email}
          disabled
          icon={Mail}
          className="rounded-2xl border-slate-200/60 bg-slate-50"
        />

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Verification Code
            </label>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 disabled:text-slate-300 transition-colors"
            >
              {canResend ? 'Resend code' : `Resend in ${formatTime(resendTimer)}`}
            </button>
          </div>

          <OTPInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            containerStyle="flex gap-2.5"
            renderInput={(props) => (
              <input
                {...props}
                disabled={isLoading}
                className="w-full h-14 text-xl font-bold text-center border-2 rounded-xl transition-all outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 disabled:bg-slate-50 disabled:cursor-not-allowed bg-slate-50/30"
                style={{
                  borderColor: otp.length === 6 ? '#3b82f6' : 'rgba(226, 232, 240, 0.6)',
                }}
              />
            )}
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Verify Account'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          <Link
            to="/auth/signup"
            className="text-blue-600 hover:text-blue-700 font-extrabold transition-colors"
          >
            Use different email
          </Link>
        </p>
      </div>
    </>
  );
};

export default VerifyAccount;
