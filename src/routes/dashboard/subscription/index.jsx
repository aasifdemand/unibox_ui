import { CheckCircle2, Zap, Shield, Sparkles, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Subscription = () => {
  const { t } = useTranslation();
  const plans = [
    {
      id: 'starter',
      name: t('subscription.plans.starter.name'),
      handle: t('subscription.plans.starter.desc'),
      price: 29,
      billing: t('subscription.billing_suffix'),
      icon: <Zap className="w-6 h-6 text-emerald-500" />,
      features: [
        t('subscription.features.mailboxes_5'),
        t('subscription.features.emails_1k'),
        t('subscription.features.basic_analytics'),
        t('subscription.features.standard_templates'),
        t('subscription.features.email_support'),
      ],
      buttonText: t('subscription.current_plan'),
      popular: false,
      color: 'emerald',
    },
    {
      id: 'professional',
      name: t('subscription.plans.professional.name'),
      handle: t('subscription.plans.professional.desc'),
      price: 99,
      billing: t('subscription.billing_suffix'),
      icon: <Sparkles className="w-6 h-6 text-blue-500" />,
      features: [
        t('subscription.features.unlimited_mailboxes'),
        t('subscription.features.emails_50k'),
        t('subscription.features.adv_ai'),
        t('subscription.features.premium_templates'),
        t('subscription.features.sequence_builder'),
        t('subscription.features.priority_support'),
      ],
      buttonText: t('subscription.upgrade'),
      popular: true,
      color: 'blue',
    },
    {
      id: 'enterprise',
      name: t('subscription.plans.enterprise.name'),
      handle: t('subscription.plans.enterprise.desc'),
      price: 'Custom',
      billing: t('subscription.custom_billing'),
      icon: <Shield className="w-6 h-6 text-violet-500" />,
      features: [
        t('subscription.features.everything_pro'),
        t('subscription.features.unlimited_volume'),
        t('subscription.features.dedicated_manager'),
        t('subscription.features.custom_warming'),
        t('subscription.features.sso_security'),
        t('subscription.features.sla'),
      ],
      buttonText: t('subscription.contact_sales'),
      popular: false,
      color: 'violet',
    },
  ];

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] ltr:left-[-10%] ltr:right-[-10%] rtl:left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] ltr:right-[-5%] rtl:left-[-5%] w-[35%] h-[35%] bg-indigo-500/5 rounded-full blur-[100px] animate-delay-700"></div>
      </div>

      {/* Header Section */}
      <div className="text-center mb-24 pt-12 relative">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-blue-50/50 border border-blue-100/50 rounded-full mb-8 shadow-sm backdrop-blur-md animate-in zoom-in duration-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600/80">
            {t('subscription.badge')}
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tighter mb-6 leading-tight">
          {t('subscription.title')}
        </h1>
        <p className="text-slate-500 font-bold max-w-2xl mx-auto text-lg leading-relaxed opacity-80">
          {t('subscription.subtitle')}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`group relative flex flex-col rounded-[3rem] border border-slate-200/60 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden ${plan.popular
              ? 'bg-white/80 ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/10'
              : 'bg-white/40 backdrop-blur-xl'
              }`}
          >
            {plan.popular && (
              <div className="absolute top-0 ltr:right-0 rtl:left-0 ltr:left-0 ltr:right-0 rtl:left-0 h-2 bg-linear-to-r from-blue-600 to-indigo-600"></div>
            )}

            {plan.popular && (
              <div className="absolute top-6 ltr:right-8 rtl:left-8">
                <div className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-full shadow-lg shadow-blue-500/40 border border-blue-400/20">
                  {t('subscription.popular')}
                </div>
              </div>
            )}

            <div className="p-10 pb-0">
              <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                {plan.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                {plan.name}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                {plan.handle}
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">
                  {typeof plan.price === 'number'
                    ? t('subscription.price_monthly', { price: plan.price })
                    : t('subscription.custom_price')}
                </span>
                {plan.price !== 'Custom' && (
                  <span className="text-slate-400 text-base font-bold">{t('subscription.per_user')}</span>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-400 mb-10 italic uppercase tracking-widest">
                {plan.billing}
              </p>

              <button
                className={`w-full py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 ${plan.popular
                  ? 'bg-blue-600 hover:bg-black text-white shadow-xl shadow-blue-600/20 hover:shadow-black/20'
                  : plan.id === 'starter'
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-blue-500/50 hover:bg-slate-50'
                  }`}
              >
                {plan.buttonText}
              </button>
            </div>

            <div className="p-10 mt-auto bg-slate-50/30">
              <ul className="space-y-5">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-blue-100' : 'bg-emerald-100'}`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ${plan.popular ? 'text-blue-600' : 'text-emerald-600'
                          }`}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-600/80 leading-snug">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ or Footer snippet */}
      <div className="mt-32 pt-16 border-t border-slate-200/60 text-center relative">
        <div className="absolute top-0 ltr:left-1/2 ltr:right-1/2 rtl:left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-8">
          <div className="w-16 h-16 rounded-4xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
            <CreditCard className="w-6 h-6 text-slate-400" />
          </div>
        </div>

        <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
          {t('subscription.help_title')}
        </h4>
        <p className="text-sm font-bold text-slate-500/70 max-w-lg mx-auto leading-relaxed">
          {t('subscription.help_desc')}
          <br />
          {t('subscription.contact_us')}{' '}
          <span className="text-blue-600 font-extrabold cursor-pointer hover:text-black transition-all">
            billing@unibox.co
          </span>
        </p>
      </div>
    </div >
  );
};

export default Subscription;
