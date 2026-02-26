import Logo from '../components/shared/logo';
import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/shared/language-switcher';

const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[100px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-purple-500/5 blur-[110px] animate-pulse [animation-delay:4s]"></div>
        {/* Subtle Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Language Switcher - top right */}
      <div className="absolute top-6 ltr:right-6 rtl:left-6 z-50">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Logo />
        </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white p-2 shadow-xl rounded-2xl">
          <div className="p-8">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400">
            {t('auth.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
