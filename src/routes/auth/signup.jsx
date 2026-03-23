import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/input';
import Checkbox from '../../components/ui/checkbox';
import { User, Mail } from 'lucide-react';
import { useSignup, useCurrentUser } from '../../hooks/useAuth';
import { signupSchema } from '../../validators/signup.schema';
import { useToast } from '../../hooks/useToast';
import { mapZodErrors } from '../../utils/map-zod';
import { useTranslation } from 'react-i18next';
import { motion } from "motion/react"

const Signup = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    marketingEmails: true,
  });

  const [errors, setErrors] = useState({});

  const signup = useSignup();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return;
    }

    const toastId = toast.loading(t('auth.signup.creating_account'));
    try {
      await signup.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.dismiss(toastId);
      toast.success(t('auth.signup.account_created_toast'));
      navigate('/auth/verify-account', { state: { email: formData.email } });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || t('auth.signup.error_signup_failed'));
    }
  };

  const isLoading = signup.isPending || userLoading;

  return (
    <>
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-12 h-12 bg-orange-50/50  rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100"
        >
          <User className="w-6 h-6 text-orange-600" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {t('auth.signup.title')}{' '}
          <span className="text-gradient leading-relaxed">{t('auth.signup.title_span')}</span>
        </h2>
        <p className="text-[14px] font-medium text-slate-500 mt-1">
          {t('auth.signup.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.signup.full_name_label')}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder={t('auth.signup.full_name_placeholder')}
          required
          icon={User}
          error={errors.name}
          disabled={isLoading}
          className="rounded-lg border-slate-200/60"
        />

        <Input
          label={t('auth.signup.email_label')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder={t('auth.signup.email_placeholder')}
          required
          icon={Mail}
          error={errors.email}
          disabled={isLoading}
          className="rounded-lg border-slate-200/60"
        />

        <div className="space-y-4">
          <Input.Password
            label={t('auth.signup.password_label')}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
            minLength={8}
            error={errors.password}
            disabled={isLoading}
            className="rounded-lg border-slate-200/60"
          />
          <Input.Password
            label={t('auth.signup.confirm_password_label')}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
            error={errors.confirmPassword}
            disabled={isLoading}
            className="rounded-lg border-slate-200/60"
          />
        </div>

        <div className="px-1">
          <Checkbox
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleCheckboxChange}
            label={
              <span className="text-[13px] font-semibold text-slate-700 leading-relaxed">
                {t('auth.signup.terms_agree')}{' '}
                <Link to="/terms" className="text-orange-600 hover:text-orange-700 font-bold transition-colors">
                  {t('auth.signup.terms_link')}
                </Link>{' '}
                {t('auth.signup.and')}{' '}
                <Link to="/privacy" className="text-orange-600 hover:text-orange-700 font-bold transition-colors">
                  {t('auth.signup.privacy_link')}
                </Link>
              </span>
            }
            required
            error={errors.acceptTerms}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="submit"
            className="btn-primary w-full py-3.5 rounded-md text-[14px] font-bold tracking-tight shadow-sm shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              t('auth.signup.sign_up_btn')
            )}
          </button>
          <button
            type="button"
            className="w-full py-3 bg-white  rounded-md text-[14px] font-bold text-slate-700 tracking-tight flex items-center justify-center gap-3 hover:bg-slate-50 transition-all border-dashed shadow-xs active:scale-95 disabled:opacity-50"
            onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)}
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
      </form>



      <div className="mt-10 text-center">
        <p className="text-[13px] font-medium text-slate-500">
          {t('auth.signup.already_account')}{' '}
          <Link
            to="/auth/login"
            className="text-orange-600 hover:text-orange-700 font-bold transition-colors ltr:ml-1 rtl:mr-1"
          >
            {t('auth.signup.sign_in_link')}
          </Link>
        </p>
      </div>
    </>
  );
};

export default Signup;
