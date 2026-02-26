import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, Send, LayoutGrid, List, Filter } from 'lucide-react';

const CampaignFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  statusOptions,
  selectedCampaigns,
  handleBulkPause,
  handleBulkActivate,
  handleBulkDelete,
  isBulkActionLoading,
  viewMode,
  setViewMode,
  filteredCount,
}) => {
  const { t } = useTranslation();
  return (
    <div className="premium-card p-6 border-none bg-slate-100/40 backdrop-blur-xl mb-10 shadow-2xl shadow-slate-900/2">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 max-w-xl group">
          <div className="relative">
            <Search className="absolute ltr:left-4 ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('campaigns.search_placeholder')}
              className="w-full ltr:pl-12 ltr:pr-12 rtl:pl-12 ltr:pr-4 rtl:pl-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <span className="text-xs font-medium text-slate-500 ltr:mr-4 rtl:ml-4 hidden sm:block">{t('common.view')}</span>
            <div className="flex bg-white/80 p-1 rounded-2xl border border-slate-200/50 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-800'
                  }`}
                title={t('campaigns.grid_view')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-800'
                  }`}
                title={t('campaigns.list_view')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Filter className="absolute ltr:left-4 ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ltr:pl-10 ltr:pr-10 rtl:pl-10 ltr:pr-10 rtl:pl-10 py-2.5 bg-white border border-slate-200/60 rounded-2xl text-sm text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 outline-none appearance-none cursor-pointer shadow-sm min-w-40"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <div className="ltr:text-right rtl:text-left">
            <span className="text-lg font-semibold text-indigo-600">{filteredCount}</span>
            <span className="text-sm text-slate-500 ltr:ml-1 ltr:mr-1 rtl:ml-1">{t('common.campaigns')}</span>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCampaigns.length > 0 && (
        <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center ltr:mr-4 rtl:ml-4">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-indigo-900">
                {t('campaigns.selected_count', { count: selectedCampaigns.length })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkPause}
              disabled={isBulkActionLoading.pause}
              className="px-5 py-2.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-all disabled:opacity-50"
            >
              {t('common.pause')}
            </button>
            <button
              onClick={handleBulkActivate}
              disabled={isBulkActionLoading.activate}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {t('common.activate')}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkActionLoading.delete}
              className="px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-medium hover:bg-rose-100 transition-all disabled:opacity-50"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignFilters;
