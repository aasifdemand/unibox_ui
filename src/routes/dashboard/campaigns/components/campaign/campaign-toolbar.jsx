import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, LayoutGrid, List, Filter, ChevronDown } from 'lucide-react';

const CampaignToolbar = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    statusOptions,
    viewMode,
    setViewMode,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2 mb-2 border-b border-slate-100">
            {/* Search */}
            <div className="relative group flex items-center bg-white border border-slate-200 rounded-xl px-4 h-10 w-full lg:w-96 transition-all focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500/40 focus-within:bg-white shadow-xs">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors shrink-0" />
                <input
                    type="text"
                    placeholder={t('campaigns.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 h-full bg-transparent text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 focus:outline-none text-slate-700"
                />
            </div>

            <div className="flex w-full md:w-auto items-center gap-3">
                {/* View Mode Switcher */}
                <div className="flex bg-slate-50 p-1 h-10 rounded-xl border border-slate-200 shadow-xs items-center">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`h-full px-3 rounded-md flex items-center justify-center transition-all ${viewMode === 'grid'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-400 hover:text-slate-800'
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`h-full px-3 rounded-md flex items-center justify-center transition-all ${viewMode === 'list'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-400 hover:text-slate-800'
                            }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
                {/* Status Filters Dropdown */}
                <div className="relative group min-w-44 flex-1 md:flex-none">
                    <Filter className="absolute ltr:left-4 ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setsetStatusFilter(e.target.value)}
                        className="w-full h-10 ltr:pl-10 ltr:pr-10 rtl:pl-10 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none appearance-none cursor-pointer shadow-xs transition-all"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                </div>


            </div>
        </div>
    );
};

export default CampaignToolbar;
