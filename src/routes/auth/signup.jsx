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
import SocialAuth from '../../components/auth/SocialAuth';

const Signup = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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
        <SocialAuth isLoading={isLoading} />
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
