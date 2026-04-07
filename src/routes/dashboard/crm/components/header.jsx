import { Plus, RefreshCw, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const Header = ({searchQuery,setSearchQuery,refetch,isRefetching,setIsAddStageOpen}) => {
    const {t} = useTranslation()
  return (
     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            {t('crm.title', 'Smart')} {t('crm.subtitle', 'Funnel')} <span className="ml-2">{t('crm.pipeline', 'Pipeline')}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('crm.drag_desc', 'Drag leads between stages. Click any card to view details and set deal value.')}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative group flex items-center bg-white border border-slate-200 rounded-md px-4 h-11 w-full md:w-72 transition-all focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:border-purple-500/40 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-purple-500 shrink-0" />
            <input
              type="text"
              placeholder={t('crm.search_placeholder', 'Search leads...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 h-full bg-transparent text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0 text-slate-700 outline-none"
            />
          </div>
          <button
            onClick={async () => {
              await refetch();
              toast.success('Pipeline updated');
            }}
            disabled={isRefetching}
            className={`w-11 h-11 flex justify-center items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-purple-600 hover:border-purple-200 transition-all active:scale-95 shadow-sm outline-none focus:outline-none focus:ring-0 ${isRefetching ? 'opacity-50' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsAddStageOpen(true)}
            className="h-11 px-5 flex items-center justify-center gap-2 bg-purple-600 text-white rounded-md text-[11px] font-extrabold tracking-widest shadow-sm shadow-purple-500/20 hover:bg-purple-700 transition-all active:scale-95 outline-none focus:outline-none focus:ring-0"
          >
            <Plus className="w-4 h-4" /> {t('crm.add_column', 'Add Column')}
          </button>
        </div>
      </div>
  )
}

export default Header