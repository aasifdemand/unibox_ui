import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import OTPInput from "react-otp-input";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import { Mail, KeyRound } from "lucide-react";
import { useResetPassword, useForgotPassword } from "../../hooks/useAuth";
import { resetPasswordSchema } from "../../validators/reset-password.schema";
import { useToast } from "../../hooks/useToast";

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
  const toast = useToast();
  const intervalRef = useRef(null);

  const resetPassword = useResetPassword();
  const forgotPassword = useForgotPassword();

  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: "",
    newPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showResendTimer, setShowResendTimer] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  const handleOTPChange = (otp) => {
    setFormData((prev) => ({ ...prev, otp }));
    if (errors.otp) setErrors((p) => ({ ...p, otp: null }));
  };

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

    const toastId = toast.loading("Resetting password...");

    try {
      await resetPassword.mutateAsync({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      toast.dismiss(toastId);
      toast.success("Password reset successful!");
      navigate("/auth/login");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || "Invalid or expired code");
    }
  };

  const startResendTimer = () => {
    clearInterval(intervalRef.current);
    setShowResendTimer(true);
    setResendCountdown(60);

    intervalRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setShowResendTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (!formData.email) {
      setErrors({ email: "Email is required" });
      return;
    }

    startResendTimer();

    const toastId = toast.loading("Resending code...");

    try {
      await forgotPassword.mutateAsync(formData.email);
      toast.dismiss(toastId);
      toast.success("Code resent successfully");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to resend code");
    }
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const isLoading = resetPassword.isPending || forgotPassword.isPending;

  return (
    <>
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
          <KeyRound className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
          Reset <span className="text-gradient">Password</span>
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
          Enter the code sent to your email
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={!!initialEmail || isLoading}
          icon={Mail}
          error={errors.email}
          className="rounded-2xl border-slate-200/60"
        />

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Verification Code
            </label>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={showResendTimer || isLoading}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 disabled:text-slate-300 transition-colors"
            >
              {showResendTimer
                ? `Resend in ${formatTime(resendCountdown)}`
                : "Resend code"}
            </button>
          </div>

          <OTPInput
            value={formData.otp}
            onChange={handleOTPChange}
            numInputs={6}
            containerStyle="flex gap-2.5"
            renderInput={(props) => (
              <input
                {...props}
                disabled={isLoading}
                className="w-full h-14 text-xl font-bold text-center border-2 rounded-xl transition-all outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 disabled:bg-slate-50 disabled:cursor-not-allowed bg-slate-50/30"
                style={{
                  borderColor: errors.otp
                    ? "#f87171"
                    : "rgba(226, 232, 240, 0.6)",
                }}
              />
            )}
          />

          {errors.otp && (
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2 px-1">
              {errors.otp}
            </p>
          )}
        </div>

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

        <button
          type="submit"
          className="btn-primary w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            "Reset Password"
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
