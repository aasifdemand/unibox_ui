// src/pages/auth/VerifyAccount.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import OTPInput from 'react-otp-input';
import Input from '../../components/ui/input';
import { Mail } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useVerifyAccount, useResendVerification, useCurrentUser } from '../../hooks/useAuth';
import { motion } from "motion/react"

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
      await resendVerification.mutateAsync({ email });
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
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-12 h-12 bg-purple-50/50  rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm border border-purple-100"
        >
          <Mail className="w-6 h-6 text-purple-600" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Verify <span className="text-gradient leading-relaxed">Email</span>
        </h2>
        <p className="text-[14px] font-medium text-slate-500 mt-1">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          disabled
          icon={Mail}
          className="rounded-lg border-slate-200/60 bg-slate-50"
        />

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1 pb-1">
            <label className="text-[13px] font-semibold text-slate-700">
              Verification Code
            </label>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className="text-[13px] font-semibold text-purple-600 hover:text-purple-700 disabled:text-slate-300 transition-colors"
            >
              {canResend ? 'Resend code' : `Resend in ${formatTime(resendTimer)}`}
            </button>
          </div>

          <OTPInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            containerStyle="flex gap-3 justify-between"
            renderInput={(props) => (
              <input
                {...props}
                disabled={isLoading}
                className="w-full h-14 text-xl font-bold text-center border-2 rounded-lg transition-all outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 disabled:bg-slate-50 disabled:cursor-not-allowed bg-white shadow-sm border-slate-200/60"
              />
            )}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="btn-primary w-full py-3.5 rounded-md text-[14px] font-bold tracking-tight shadow-sm shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Verify Account'
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[13px] font-medium text-slate-500">
          <Link
            to="/auth/signup"
            className="text-purple-600 hover:text-purple-700 font-bold transition-colors"
          >
            Use different email
          </Link>
        </p>
      </div>
    </>
  );
};

export default VerifyAccount;
