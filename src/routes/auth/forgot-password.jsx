import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema } from "../../validators/forgot-password.schema";
import { useAuthStore } from "../../store/auth.store";
import { useToast } from "../../hooks/useToast";
import { mapZodErrors } from "../../utils/map-zod";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const { forgotPassword, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Zod validation
    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return;
    }

    const toastId = toast.loading("Sending reset instructions...");

    const success = await forgotPassword(email);

    toast.dismiss(toastId);

    if (success) {
      toast.success("Reset instructions sent 📩");
      setIsSubmitted(true);
      setErrors({});
    } else {
      toast.error("Failed to send reset email");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Forgot your password?
          </h2>
          <p className="text-gray-600 mt-2">
            {isSubmitted
              ? "Check your email for reset instructions"
              : "Enter your email to receive reset instructions"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({});
                }
              }}
              placeholder="you@example.com"
              required
              icon={Mail}
              error={errors.email}
              helperText="We'll send a password reset link to this email"
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              isLoading={loading}
              disabled={loading}
            >
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-green-800">
                Password reset link has been sent to <strong>{email}</strong>
              </p>
              <p className="text-sm text-green-700 mt-2">
                Check your inbox and click the link to reset your password.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setIsSubmitted(false);
                  }}
                >
                  Try Again
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => navigate("/auth/login")}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="font-semibold text-blue-600 hover:text-blue-500"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
