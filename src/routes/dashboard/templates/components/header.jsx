import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = ({
  onCreateNew,
  isPending,
}) => {
  const { t } = useTranslation();
  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center">
            {t('templates.title')} <span className="text-gradient ms-4">{t('templates.subtitle')}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            {t('templates.header_description')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCreateNew}
            disabled={isPending}
            className="btn-primary h-11 px-6 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-white font-extrabold uppercase tracking-widest text-[11px] disabled:opacity-50 whitespace-nowrap rounded-xl"
          >
            <Plus className="w-4 h-4 text-white" />
            {t('templates.create_new')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
