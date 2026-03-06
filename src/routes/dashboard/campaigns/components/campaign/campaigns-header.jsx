import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCcw, Search, LayoutGrid, List, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const CampaignsHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center">
            {t('campaigns.title')} <span className="text-gradient ms-4">{t('campaigns.subtitle')}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            {t('campaigns.header_description')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-11 h-11 flex justify-center items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
            title={t('common.refresh')}
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <Link
            to={'/dashboard/campaigns/create'}
            className="btn-primary h-11 px-6 flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-white font-extrabold uppercase tracking-widest text-[11px] rounded-xl"
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
