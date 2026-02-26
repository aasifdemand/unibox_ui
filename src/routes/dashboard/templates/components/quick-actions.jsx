import { ChevronRight, Sparkles, Download, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const QuickActions = ({ onCreateNew, isPending }) => {
  const { t } = useTranslation();
  const actions = [
    {
      title: t('templates.create_template'),
      description: t('templates.create_template_desc'),
      icon: <Sparkles className="w-5 h-5" />,
      theme: 'blue',
      onClick: onCreateNew,
    },
    {
      title: t('templates.import_template'),
      description: t('templates.import_template_desc'),
      icon: <Download className="w-5 h-5" />,
      theme: 'emerald',
      onClick: () => console.log('Import'),
    },
    {
      title: t('templates.view_analytics'),
      description: t('templates.view_analytics_desc'),
      icon: <Eye className="w-5 h-5" />,
      theme: 'violet',
      onClick: () => console.log('Analytics'),
    },
  ];

  const themes = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
    emerald:
      'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
    violet:
      'bg-violet-50 text-violet-600 border-violet-100 group-hover:bg-violet-600 group-hover:text-white',
  };

  return (
    <div className="premium-card p-8 border-none bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-900/3">
      <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
        {t('templates.quick_actions')}
      </h3>

      <div className="space-y-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={isPending}
            className="w-full p-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group ltr:text-left ltr:text-right rtl:text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${themes[action.theme]}`}
              >
                {action.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-slate-800 tracking-tight text-sm uppercase">
                  {action.title}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-all transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
