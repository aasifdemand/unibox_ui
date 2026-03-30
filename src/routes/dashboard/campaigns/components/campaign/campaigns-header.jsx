import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCcw, Search, Filter, CheckCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import FilterDropdown from '../../../../../components/ui/filter-dropdown';

const CampaignsHeader = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  statusOptions,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-4 duration-700 pb-4 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            {t('campaigns.title')} <span className="ml-2">{t('campaigns.subtitle')}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-500" />
            {t('campaigns.header_description')}
          </p>
        </div>

        {/* Action Buttons & Filters */}
        <div className="flex items-center gap-3">
          <FilterDropdown
            badgeCount={(searchTerm ? 1 : 0) + (statusFilter !== 'all' && statusFilter ? 1 : 0)}
          >
            {/* Search */}
            <div className="relative group flex items-center bg-white border border-slate-200 rounded-md px-4 h-11 w-full transition-all focus-within:ring-2 focus-within:ring-orange-500/10 focus-within:border-orange-500/40 focus-within:bg-white shadow-sm">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
              <input
                type="text"
                placeholder={t('campaigns.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 h-full bg-transparent text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 focus:outline-none text-slate-700"
              />
            </div>

            {/* Status Filters Dropdown */}
            <div className="flex flex-col gap-1 w-full bg-slate-50 p-2 rounded-md border border-slate-100">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 flex items-center gap-2">
                <Filter className="w-3 h-3" />
                {t('campaigns.status_filter', 'Status')}
              </label>
              <div className="flex flex-col gap-0.5 max-h-[40vh] overflow-y-auto">
                {statusOptions?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (option.value === 'all') {
                        setStatusFilter([]);
                      } else {
                        const currentFilters = Array.isArray(statusFilter) ? statusFilter : [];
                        if (currentFilters.includes(option.value)) {
                          setStatusFilter(currentFilters.filter((v) => v !== option.value));
                        } else {
                          setStatusFilter([...currentFilters, option.value]);
                        }
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left w-full group ${
                      (option.value === 'all' && (!statusFilter || statusFilter.length === 0)) ||
                      (Array.isArray(statusFilter) && statusFilter.includes(option.value))
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all shrink-0 ${
                        (option.value === 'all' && (!statusFilter || statusFilter.length === 0)) ||
                        (Array.isArray(statusFilter) && statusFilter.includes(option.value))
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-slate-300 bg-white group-hover:border-orange-300 text-transparent'
                      }`}
                    >
                      <CheckCircle className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest truncate">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </FilterDropdown>

          <button
            onClick={() => window.location.reload()}
            className="w-11 h-11 flex justify-center items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all active:scale-95 shadow-sm"
            title={t('common.refresh')}
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <Link
            to={'/dashboard/campaigns/create'}
            className="btn-primary h-11 px-6 flex items-center justify-center gap-3 shadow-sm shadow-orange-500/20 active:scale-95 transition-all text-white font-extrabold  tracking-widest text-[11px] rounded-md"
          >
            <Plus className="w-4 h-4 text-white" />
            {t('campaigns.create_campaign')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignsHeader;
