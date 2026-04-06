import { useTranslation } from 'react-i18next';
import { CheckCircle, RefreshCcw, Upload, Search, SlidersHorizontal, Users, Download } from 'lucide-react';
import FilterDropdown from '../../../../components/ui/filter-dropdown';
import { ColumnSelector } from './contacts-table';
import Dialog from '../../../../components/ui/dialog';
import { useState } from 'react';

const AudienceHeader = ({
  activeTab,
  setActiveTab,
  setShowUploadModal,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  visibleCols,
  toggleCol,
  setAllCols,
  setNoCols,
}) => {
  const { t } = useTranslation();
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const handleExportCSV = () => {
    const filters = Array.isArray(filterStatus) && filterStatus.length > 0 
      ? filterStatus.join(',') 
      : 'all';
    
    const baseUrl = import.meta.env.VITE_API_URL;
    const query = new URLSearchParams({
      searchTerm: searchTerm || '',
      filterStatus: filters,
      format: 'csv'
    });

    const exportUrl = `${baseUrl}/lists/contacts/export?${query.toString()}`;
    window.open(exportUrl, '_blank');
    setShowExportConfirm(false);
  };

  const tabs = [
    { id: 'contacts', label: t('audience.title', 'Contacts') },
    { id: 'batches', label: t('audience.import_batches', 'Import Batches') },
  ];

  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || tabs[0].label;

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            {activeTabLabel}
            {activeTab === 'contacts' && (
              <span className="ml-2">{t('audience.subtitle')}</span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            {t('audience.header_description')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <FilterDropdown
            badgeCount={
              (searchTerm ? 1 : 0) + (filterStatus !== 'all' && filterStatus?.length > 0 ? 1 : 0)
            }
          >
            {/* View/Tab Filter */}
            <div className="flex flex-col gap-2 w-full mb-1 ">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                <SlidersHorizontal className="w-3 h-3" />
                {t('audience.view_type', 'View')}
              </label>
              <div className="flex flex-col gap-1 px-1">
                {tabs.map((tab) => (
                  <label
                    key={tab.id}
                    className="flex items-center gap-3 px-2 py-1.5 cursor-pointer group"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                        activeTab === tab.id
                          ? 'border-purple-500'
                          : 'border-slate-300 group-hover:border-purple-300'
                      }`}
                    >
                      {activeTab === tab.id && (
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                        activeTab === tab.id
                          ? 'text-slate-800'
                          : 'text-slate-500 group-hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </label>
                ))}
              </div>
              <div className="h-px w-full bg-slate-100 my-1" />
            </div>

            {activeTab === 'contacts' && (
              <>
                {/* Search */}
                <div className="relative group flex items-center bg-white border border-slate-200 rounded-md px-4 h-11 w-full transition-all focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:border-purple-500/40 shadow-sm mt-2">
                  <Search className="w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors shrink-0" />
                  <input
                    type="text"
                    placeholder={
                      t('audience.search_contacts_placeholder') || 'Search by email or name...'
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 h-full bg-transparent text-xs font-semibold placeholder:font-medium placeholder:text-slate-400 focus:outline-none text-slate-700"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1 w-full bg-slate-50 p-2 rounded-md border border-slate-100 mt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 flex items-center gap-2">
                    <SlidersHorizontal className="w-3 h-3" />
                    {t('audience.status_filter', 'Status Filter')}
                  </label>
                  <div className="flex flex-col gap-0.5 max-h-[40vh] overflow-y-auto">
                    {[
                      { value: 'all', label: t('audience.all_status') },
                      { value: 'valid', label: t('audience.valid') },
                      { value: 'risky', label: t('audience.risky') },
                      { value: 'invalid', label: t('audience.invalid') },
                      { value: 'unverified', label: t('audience.unverified') },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          if (option.value === 'all') {
                            setFilterStatus([]);
                          } else {
                            const currentFilters = Array.isArray(filterStatus) ? filterStatus : [];
                            if (currentFilters.includes(option.value)) {
                              setFilterStatus(currentFilters.filter((v) => v !== option.value));
                            } else {
                              setFilterStatus([...currentFilters, option.value]);
                            }
                          }
                        }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left w-full group ${
                          (option.value === 'all' &&
                            (!filterStatus || filterStatus.length === 0)) ||
                          (Array.isArray(filterStatus) && filterStatus.includes(option.value))
                            ? 'bg-purple-50 text-purple-700'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all shrink-0 ${
                            (option.value === 'all' &&
                              (!filterStatus || filterStatus.length === 0)) ||
                            (Array.isArray(filterStatus) && filterStatus.includes(option.value))
                              ? 'bg-purple-500 border-purple-500 text-white'
                              : 'border-slate-300 bg-white group-hover:border-purple-300 text-transparent'
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
              </>
            )}
          </FilterDropdown>

          {activeTab === 'contacts' && (
            <ColumnSelector
              visibleCols={visibleCols}
              onToggle={toggleCol}
              onSetAll={setAllCols}
              onSetNone={setNoCols}
            />
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-11 h-11 flex justify-center items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-purple-600 hover:border-purple-200 transition-all active:scale-95 shadow-sm shrink-0"
            title={t('audience.refresh')}
          >
            <RefreshCcw className="w-4 h-4" />
          </button>

          {activeTab === 'contacts' && (
            <button
              onClick={() => setShowExportConfirm(true)}
              className="flex items-center gap-2 px-4 h-11 rounded-md border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:border-purple-200 hover:text-purple-600 transition-all shadow-sm shrink-0"
              title="Export filtered contacts to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}

          <Dialog
            open={showExportConfirm}
            setOpen={setShowExportConfirm}
            title={t('audience.confirm_export_title', 'Confirm Full Export')}
            description={t('audience.confirm_export_description', 'Are you sure you want to export all contacts matching your current search and filters? This will generate a CSV file with all visible columns and metadata fields.')}
            confirmText={t('common.export', 'Yes, Export')}
            cancelText={t('common.cancel', 'No, Cancel')}
            confirmVariant="info"
            onConfirm={handleExportCSV}
            onCancel={() => setShowExportConfirm(false)}
          />
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary h-11 px-6 flex items-center justify-center gap-3 shadow-sm shadow-purple-500/20 active:scale-95 transition-all text-white font-black  tracking-widest text-[11px] rounded-md shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span className="text-[11px] font-semibold  tracking-widest text-white">
              {t('audience.add_contacts')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudienceHeader;
