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

  // React Query hooks
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
      toast.success("Password reset successful 🔐");
      navigate("/auth/login");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || "Invalid or expired OTP");
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

    const toastId = toast.loading("Resending OTP...");

    try {
      await forgotPassword.mutateAsync(formData.email);
      toast.dismiss(toastId);
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to resend OTP");
    }
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Combined loading state
  const isLoading = resetPassword.isPending || forgotPassword.isPending;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reset Your Password
          </h2>
          <p className="text-gray-600 mt-2">
            Enter your email, OTP, and new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!!initialEmail || isLoading}
            icon={Mail}
            error={errors.email}
          />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Verification Code (OTP)
              </label>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={showResendTimer || isLoading}
                className="text-sm text-blue-600 disabled:text-gray-400"
              >
                {showResendTimer
                  ? `Resend in ${formatTime(resendCountdown)}`
                  : "Resend OTP"}
              </button>
            </div>

            <OTPInput
              value={formData.otp}
              onChange={handleOTPChange}
              numInputs={6}
              containerStyle="flex gap-2"
              renderInput={(props) => (
                <input
                  {...props}
                  disabled={isLoading}
                  className="w-full h-14 text-2xl text-center border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{
                    borderColor: errors.otp ? "#f87171" : "#d1d5db",
                  }}
                />
              )}
            />

            {errors.otp && <p className="text-sm text-red-600">{errors.otp}</p>}
          </div>

          <Input.Password
            label="New Password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            error={errors.newPassword}
            helperText="Must be at least 8 characters"
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Reset Password
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/auth/login"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
