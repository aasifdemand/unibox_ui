import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, Send, LayoutGrid, List, Filter } from 'lucide-react';

const CampaignFilters = ({
  selectedCampaigns,
  handleBulkPause,
  handleBulkActivate,
  handleBulkDelete,
  isBulkActionLoading,
}) => {
  const { t } = useTranslation();

  if (selectedCampaigns.length === 0) return null;

  return (
    <div className="premium-card p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center ltr:mr-4 rtl:ml-4 shadow-lg shadow-blue-500/20">
          <Send className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-black text-slate-800 uppercase tracking-widest">
            {t('campaigns.selected_count', { count: selectedCampaigns.length })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleBulkPause}
          disabled={isBulkActionLoading.pause}
          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
        >
          {t('common.pause')}
        </button>
        <button
          onClick={handleBulkActivate}
          disabled={isBulkActionLoading.activate}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {t('common.activate')}
        </button>
        <button
          onClick={handleBulkDelete}
          disabled={isBulkActionLoading.delete}
          className="px-6 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all disabled:opacity-50"
        >
          {t('common.delete')}
        </button>
      </div>
    </div>
  );
};

export default CampaignFilters;
