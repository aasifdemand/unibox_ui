import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ChevronDown } from 'lucide-react';

const TemplateToolbar = ({
    searchTerm,
    setSearchTerm,
    filterActive,
    setFilterActive,
    isPending,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2 mb-2 border-b border-slate-100">
            {/* Search */}
            <div className="relative group flex items-center bg-white border border-slate-200 rounded-xl px-4 h-10 w-full lg:w-96 transition-all focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500/40 shadow-xs">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors shrink-0" />
                <input
                    type="text"
                    placeholder={t('templates.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isPending}
                    className="w-full px-3 h-full bg-transparent text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 focus:outline-none text-slate-700 disabled:opacity-50"
                />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative group min-w-44 flex-1 md:flex-none">
                <Filter className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    disabled={isPending}
                    className="w-full h-10 ltr:pl-10 ltr:pr-10 rtl:pl-10 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none appearance-none cursor-pointer shadow-xs transition-all disabled:opacity-50"
                >
                    <option value="all">{t('templates.all')}</option>
                    <option value="active">{t('templates.active')}</option>
                    <option value="draft">{t('templates.draft')}</option>
                </select>
                <ChevronDown className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-colors" />
            </div>
        </div>
    );
};

export default TemplateToolbar;
