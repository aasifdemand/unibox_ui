import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/ui/input';
import { Mail } from 'lucide-react';
import { useLogin, useCurrentUser } from '../../hooks/useAuth';
import { loginSchema } from '../../validators/login.schema';
import { useToast } from '../../hooks/useToast';
import { mapZodErrors } from '../../utils/map-zod';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import SocialAuth from '../../components/auth/SocialAuth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});

  const login = useLogin();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Handle OAuth errors from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');

    if (error) {
      const errorMessage = decodeURIComponent(error);

      switch (errorMessage) {
        case 'google_auth_failed':
          toast.error(t('auth.login.error_google_failed'));
          break;
        case 'oauth_failed':
          toast.error(t('auth.login.error_oauth_failed'));
          break;
        case 'LOCAL_ACCOUNT_EXISTS':
          toast.error(t('auth.login.error_account_exists'));
          break;
        default:
          toast.error(errorMessage || t('auth.login.error_auth_failed'));
      }

      navigate('/auth/login', { replace: true });
    }
  }, [location.search, navigate, toast, t]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return;
    }

    const toastId = toast.loading(t('auth.login.signing_in'));
    try {
      await login.mutateAsync({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      toast.dismiss(toastId);
      toast.success(t('auth.login.welcome_back_toast'));
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || t('auth.login.error_invalid'));
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/auth/forgot-password');
  };

  const isLoading = login.isPending || userLoading;

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
          {t('auth.login.title')}{' '}
          <span className="text-gradient leading-relaxed">{t('auth.login.title_span')}</span>
        </h2>
        <p className="text-[14px] font-medium text-slate-500 mt-1">
          {t('auth.login.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.login.email_label')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder={t('auth.login.email_placeholder')}
          required
          icon={Mail}
          error={errors.email}
          disabled={isLoading}
          className="rounded-lg border-slate-200/60"
        />

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-slate-700 px-1">
            {t('auth.login.password_label')}
          </label>

          <Input.Password
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
            error={errors.password}
            disabled={isLoading}
            className="rounded-lg border-slate-200/60"
          />

          <div className="flex justify-end px-1 pt-0.5">
            <button
              onClick={handleForgotPassword}
              className="text-[13px] font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              type="button"
              disabled={isLoading}
            >
              {t('auth.login.forgot_password')}
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="submit"
            className="btn-primary w-full py-3.5 rounded-md text-[14px] font-bold tracking-tight shadow-sm shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              t('auth.login.sign_in_btn')
            )}
          </button>
        <SocialAuth isLoading={isLoading} />
        </div>
      </form>

      <div className="mt-10 text-center">
        <p className="text-[13px] font-medium text-slate-500">
          {t('auth.login.no_account')}{' '}
          <Link
            to="/auth/signup"
            className="text-purple-600 hover:text-purple-700 font-bold transition-colors ltr:ml-1 rtl:mr-1"
          >
            {t('auth.login.sign_up_link')}
          </Link>
        </p>
      </div>
    </>
  );
};

export default Login;
