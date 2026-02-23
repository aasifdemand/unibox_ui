import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Input from "../../components/ui/input";
import Checkbox from "../../components/ui/checkbox";
import { Mail } from "lucide-react";
import { useLogin, useCurrentUser } from "../../hooks/useAuth";
import { loginSchema } from "../../validators/login.schema";
import { useToast } from "../../hooks/useToast";
import { mapZodErrors } from "../../utils/map-zod";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});

  const login = useLogin();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Handle OAuth errors from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error) {
      // Decode the error message (in case it's encoded)
      const errorMessage = decodeURIComponent(error);

      // Show appropriate toast message based on error
      switch (errorMessage) {
        case "google_auth_failed":
          toast.error("Google authentication failed. Please try again.");
          break;
        case "oauth_failed":
          toast.error("OAuth authentication failed. Please try again.");
          break;
        case "LOCAL_ACCOUNT_EXISTS":
          toast.error(
            "An account with this email already exists. Please login with your password.",
          );
          break;
        default:
          toast.error(
            errorMessage || "Authentication failed. Please try again.",
          );
      }

      // Clean up the URL by removing the error parameter
      navigate("/auth/login", { replace: true });
    }
  }, [location.search, navigate, toast]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return;
    }

    const toastId = toast.loading("Signing you in...");

    try {
      await login.mutateAsync({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      toast.dismiss(toastId);
      toast.success("Welcome back!");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || "Invalid email or password");
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/auth/forgot-password");
  };

  const isLoading = login.isPending || userLoading;

  return (
    <>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
          Welcome <span className="text-gradient">Back</span>
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="name@example.com"
          required
          icon={Mail}
          error={errors.email}
          disabled={isLoading}
          className="rounded-2xl border-slate-200/60"
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Password
            </label>
            <button
              onClick={handleForgotPassword}
              className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
              type="button"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          <Input.Password
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
            error={errors.password}
            disabled={isLoading}
            className="rounded-2xl border-slate-200/60"
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <Checkbox
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleCheckboxChange}
            label={
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Remember me
              </span>
            }
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="mt-10">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="px-4 bg-white/70 backdrop-blur-md text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login */}
        <div className="mt-8">
          <button
            type="button"
            className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all border-dashed shadow-xs active:scale-95 disabled:opacity-50"
            onClick={() =>
              (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)
            }
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Don't have an account?{" "}
          <Link
            to="/auth/signup"
            className="text-blue-600 hover:text-blue-700 font-extrabold transition-colors ml-1"
          >
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
};

export default Login;
