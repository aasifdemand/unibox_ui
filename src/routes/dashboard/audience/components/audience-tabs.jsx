import {
  Download,
  Eye,
  FileSpreadsheet,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useExportBatch } from '../../../../hooks/useBatches';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

const AudienceTabs = ({
  isLoadingBatches,
  filteredBatches,
  setShowUploadModal,
  handleDeleteBatch,
  openBatchDetails,
  pagination,
  currentPage,
  onPageChange,
}) => {
  const { t } = useTranslation();
  const exportBatch = useExportBatch();
  return (
    <div className="w-full">
      {/* Contact Lists Grid */}
      {isLoadingBatches ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            {t('audience.loading_contacts')}
          </p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="premium-card bg-white border-dashed border-2 border-slate-200 p-20 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
            <FileSpreadsheet className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">
            {t('audience.no_contacts_title')}
          </h3>
          <p className="text-sm font-medium text-slate-400 max-w-xs mb-8">
            {t('audience.no_contacts_description')}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary py-3 px-8 flex items-center gap-3"
          >
            <Upload className="w-4 h-4 text-white" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">
              {t('audience.upload_contacts_btn')}
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="premium-card bg-white border-slate-200/60 p-6 hover:shadow-2xl hover:shadow-blue-500/8 group transition-all duration-500"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-800 truncate tracking-tight text-sm">
                      {batch.originalFilename}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${batch.status === 'completed'
                          ? 'bg-emerald-500'
                          : batch.status === 'processing'
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-rose-500'
                          }`}
                      ></div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                        {t(`audience.${batch.status}`)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openBatchDetails(batch)}
                    className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBatch(batch.id)}
                    className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-8 mt-2">
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    {t('audience.valid')}
                  </p>
                  <p className="text-lg font-extrabold text-emerald-600 tabular-nums leading-none">
                    {batch.verification?.valid ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    {t('audience.risky')}
                  </p>
                  <p className="text-lg font-extrabold text-amber-600 tabular-nums leading-none">
                    {batch.verification?.risky ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    {t('audience.invalid')}
                  </p>
                  <p className="text-lg font-extrabold text-rose-600 tabular-nums leading-none">
                    {batch.verification?.invalid ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    {t('audience.unverified')}
                  </p>
                  <p className="text-lg font-extrabold text-slate-600 tabular-nums leading-none">
                    {batch.verification?.unverified ?? 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-widest">
                    {t('audience.uploaded_on')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openBatchDetails(batch)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 transition-all"
                  >
                    {t('audience.view_details')}
                  </button>
                  <button
                    onClick={() => exportBatch.mutate({ batchId: batch.id })}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-blue-600 transition-all flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('audience.export')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoadingBatches && pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 mt-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {pagination.total?.toLocaleString()} {t('audience.total_batches') || 'Total Batches'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="px-4 flex items-center gap-2">
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">{currentPage}</span>
              <span className="text-[10px] font-black text-slate-300 uppercase">of</span>
              <span className="text-xs font-black text-slate-600">{pagination.pages}</span>
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudienceTabs;
