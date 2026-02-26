import { Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SearchFilters = ({ searchTerm, setSearchTerm, filterActive, setFilterActive, isPending }) => {
  const { t } = useTranslation();
  return (
    <div className="premium-card p-6 border-none bg-slate-100/40 backdrop-blur-xl mb-10 shadow-2xl shadow-slate-900/2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 max-w-xl group">
          <div className="relative">
            <Search className="absolute ltr:left-4 ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder={t('templates.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isPending}
              className="w-full ltr:pl-12 ltr:pr-12 rtl:pl-12 ltr:pr-4 rtl:pl-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 outline-none transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ltr:mr-4 rtl:ml-4 hidden sm:block">
              {t('templates.status_filter')}
            </span>
            <div className="flex bg-white/80 p-1 rounded-2xl border border-slate-200/50 shadow-sm transition-all duration-300">
              {['all', 'active', 'draft'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterActive(status)}
                  disabled={isPending}
                  className={`px-5 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all duration-300 ${filterActive === status
                      ? 'bg-blue-600 text-white shadow-xl shadow-slate-900/10'
                      : 'text-slate-400 hover:text-slate-800'
                    } disabled:opacity-50`}
                >
                  {t(`templates.${status}`)}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={isPending}
            className="w-11 h-11 rounded-2xl border border-slate-200/60 bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
