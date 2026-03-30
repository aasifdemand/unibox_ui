import Logo from '../components/shared/logo';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/shared/language-switcher';
import { Zap, Shield, BarChart3, Mail, Lock, UserPlus, KeyRound, MailCheck, RefreshCw } from 'lucide-react';

const AuthLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Dynamic content based on current route
  const getPageConfig = () => {
    const path = location?.pathname

    if (path.includes('login')) {
      return {
        title: t('auth.layout.login_title'),
        subtitle: t('auth.layout.login_subtitle'),
        icon: Lock,
        badgeText: t('auth.layout.login_badge'),
        showIllustration: true,
      };
    }

    if (path.includes('signup')) {
      return {
        title: t('auth.layout.signup_title'),
        subtitle: t('auth.layout.signup_subtitle'),
        icon: UserPlus,
        badgeText: t('auth.layout.signup_badge'),
        showIllustration: true,
      };
    }

    if (path.includes('verify-account')) {
      return {
        title: t('auth.layout.verify_title'),
        subtitle: t('auth.layout.verify_subtitle'),
        icon: MailCheck,
        badgeText: t('auth.layout.verify_badge'),
        showIllustration: false,
      };
    }

    if (path.includes('forgot-password')) {
      return {
        title: t('auth.layout.forgot_title'),
        subtitle: t('auth.layout.forgot_subtitle'),
        icon: KeyRound,
        badgeText: t('auth.layout.forgot_badge'),
        showIllustration: false,
      };
    }

    if (path.includes('reset-password')) {
      return {
        title: t('auth.layout.reset_title'),
        subtitle: t('auth.layout.reset_subtitle'),
        icon: RefreshCw,
        badgeText: t('auth.layout.reset_badge'),
        showIllustration: false,
      };
    }

    // Default fallback
    return {
      title: t('auth.layout.title_main'),
      subtitle: t('auth.layout.subtitle'),
      icon: Zap,
      badgeText: t('auth.layout.platform_live'),
      showIllustration: true,
    };
  };

  const pageConfig = getPageConfig();
  const PageIcon = pageConfig.icon;

  return (
    <div className="h-screen flex w-full overflow-hidden bg-white">

      {/* ── LEFT — Form column (app bg) ── */}
      <div
        className="relative flex flex-col w-full lg:w-1/2 h-full px-8 py-10 md:px-16 overflow-y-auto custom-scrollbar"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {/* Logo + language top */}
        <div className="flex items-center justify-between pb-12">
          <Logo />
          <LanguageSwitcher />
        </div>

        {/* Centered form container */}
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-[420px] bg-white/90 backdrop-blur-sm border border-orange-100/60 p-8 md:p-10 rounded-2xl shadow-[0_20px_50px_rgba(249,115,22,0.08)]"
          >
            <Outlet />
          </motion.div>
        </div>

        {/* Footer */}
        <div className="pt-10 text-center">
          <p className="text-xs text-slate-400">
            {t('auth.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>

      {/* ── RIGHT — Branded cover panel (orange primary) ── */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden flex-col items-center justify-center p-16">

        {/* Orange gradient background */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)' }}
        />

        {/* Orange bloom — top right */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-30 blur-[120px] pointer-events-none"
          style={{ background: '#f97316' }} />

        {/* Subtle amber bloom — bottom left */}
        <div className="absolute bottom-0 -left-20 w-[350px] h-[350px] rounded-full opacity-20 blur-[100px] pointer-events-none"
          style={{ background: '#fb923c' }} />

        {/* Mesh Lines Overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(234, 88, 12, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(234, 88, 12, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)'
          }}
        />

        {/* Diagonal Mesh Grid */}
        <div
          className="absolute inset-0 opacity-[0.05] rotate-12 scale-150"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(234, 88, 12, 0.15) 1px, transparent 1px),
              linear-gradient(-45deg, rgba(234, 88, 12, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '120px 120px'
          }}
        />

        {/* Original Grid overlay - softer for orange theme */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-xl text-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-200/50 rounded-full px-4 py-2 mb-8"
          >
            <PageIcon className="w-3 h-3 text-orange-600" />
            <span className="text-[11px] font-black text-orange-700 uppercase tracking-widest">
              {pageConfig.badgeText}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-5"
          >
            {pageConfig.title}
            {location.pathname === '/auth' && (
              <span className="block text-orange-600 mt-1">{t('auth.layout.title_span')}</span>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-slate-600 text-sm font-medium leading-relaxed mb-12"
          >
            {pageConfig.subtitle}
          </motion.p>

          {/* Conditional illustration - only shown for login/signup */}
          {pageConfig.showIllustration && (
            <div className="mt-16 relative flex items-center justify-center">

              {/* Rotating Outer Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-[500px] h-[500px] border border-orange-200/50 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, rgba(249,115,22,0.1), transparent)',
                }}
              />

              {/* Pulsating Ambient Glow */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[350px] h-[350px] bg-orange-400 blur-[80px] rounded-full"
              />

              {/* The Sphere Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-72 h-72 lg:w-80 lg:h-80 rounded-full bg-white/40 backdrop-blur-sm border border-orange-200/30 shadow-[inset_0_0_80px_rgba(249,115,22,0.05),0_30px_60px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center"
              >
                {/* Internal Refraction Effect */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-50%] bg-linear-to-tr from-transparent via-orange-500/10 to-transparent blur-2xl opacity-40"
                />

                <motion.img
                  animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  src="/illustrations/auth-hero.png"
                  alt="Unibox Platform"
                  className="relative z-10 w-full h-full object-cover rounded-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.1)] transition-transform duration-700"
                />
              </motion.div>

              {/* Floating particles/icons */}
              {[
                { delay: 0, x: -140, y: -100, size: 40, icon: Zap },
                { delay: 1, x: 160, y: -60, size: 32, icon: Shield },
                { delay: 2, x: 120, y: 120, size: 44, icon: BarChart3 },
                { delay: 0.5, x: -25, y: -180, size: 28, icon: Mail },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [p.y, p.y - 20, p.y],
                    x: [p.x, p.x + 10, p.x],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "easeInOut"
                  }}
                  className="absolute z-20 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-md flex items-center justify-center shadow-sm"
                  style={{ width: p.size, height: p.size }}
                >
                  <p.icon className="w-1/2 h-1/2 text-orange-600" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Conditional verification/reset messages */}
          {!pageConfig.showIllustration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 p-6 bg-orange-50/80 backdrop-blur-sm rounded-2xl border border-orange-100"
            >
              <p className="text-slate-700 text-sm leading-relaxed">
                {location.pathname.includes('verify-account') && t('auth.layout.verify_help')}
                {location.pathname.includes('forgot-password') && t('auth.layout.forgot_help')}
                {location.pathname.includes('reset-password') && t('auth.layout.reset_help')}
              </p>
            </motion.div>
          )}
        </div>

        {/* Social proof - only shown on login/signup */}
        {pageConfig.showIllustration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="relative z-10 mt-16 flex items-center gap-5"
          >
            <div className="flex -space-x-2">
              {['#ea580c', '#f97316', '#fb923c', '#fdba74'].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-[10px] font-black"
                  style={{ backgroundColor: c, borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-orange-700 font-medium">
              {t('auth.layout.trusted_by')}{' '}
              <span className="text-orange-900 font-bold">2,400+</span> {t('auth.layout.teams')}
            </p>
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default AuthLayout;