import { FileText, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = ({ onCreateNew, isPending }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tighter">
            {t('templates.title')}
          </h1>
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          {t('templates.subtitle')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onCreateNew}
          disabled={isPending}
          className="btn-primary py-3 px-8 flex items-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-white font-extrabold uppercase tracking-widest text-[11px] disabled:opacity-50"
        >
          <Plus className="w-4 h-4 text-white" />
          {t('templates.create_new')}
        </button>
      </div>
    </div>
  );
};

export default Header;
