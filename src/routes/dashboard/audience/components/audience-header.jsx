import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, Layers, Plus, RefreshCcw, Upload, Users, XCircle, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';
const AudienceHeader = ({
  activeTab,
  setShowUploadModal,
  totalContacts,
  verified,
  invalid,
  risky,
}) => {
  const { t } = useTranslation();
  return (
    <div className="w-full animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center">
            {t('audience.title')} <span className="text-gradient ms-4">{t('audience.subtitle')}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            {t('audience.header_description')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <>
            <button
              onClick={() => window.location.reload()}
              className="w-11 h-11 flex justify-center items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
              title={t('audience.refresh')}
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary h-11 px-6 flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-white font-extrabold uppercase tracking-widest text-[11px] rounded-xl"
            >
              <Upload className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">
                {t('audience.add_contacts')}
              </span>
            </button>
          </>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="premium-card p-6 overflow-hidden relative group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="absolute -inset-inline-end-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] blur-2xl group-hover:opacity-10 transition-opacity bg-linear-to-br from-indigo-500 to-blue-600"></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-500">
              <Layers className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-1.5 transition-colors group-hover:bg-white group-hover:border-blue-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
                {t('dashboard.performance.realtime')}
              </span>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-[0.15em]">
              {t('audience.total_contacts')}
            </p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter tabular-nums leading-none">
                {totalContacts.toLocaleString()}
              </h3>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold mb-0.5 text-blue-600 bg-blue-50">
                <CheckCircle className="w-3 h-3" />
                {t('audience.verified')}
              </div>
            </div>

            <p className="text-xs text-slate-500 font-bold mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
              {t('audience.active_verified')}
            </p>
          </div>


        </motion.div>

        {/* Valid Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="premium-card p-6 overflow-hidden relative group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="absolute -inset-inline-end-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] blur-2xl group-hover:opacity-10 transition-opacity bg-linear-to-br from-emerald-500 to-teal-600"></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-500">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="px-2 py-1 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-center gap-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600">
                {t('audience.valid')}
              </span>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-[0.15em]">
              {t('audience.active_verified')}
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter tabular-nums leading-none">
              {verified.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
              {t('audience.completed')}
            </p>
          </div>


        </motion.div>

        {/* Invalid Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="premium-card p-6 overflow-hidden relative group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="absolute -inset-inline-end-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] blur-2xl group-hover:opacity-10 transition-opacity bg-linear-to-br from-rose-500 to-red-600"></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-500">
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>
            <div className="px-2 py-1 bg-rose-50/50 border border-rose-100 rounded-lg flex items-center gap-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-600">
                {t('audience.invalid')}
              </span>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-[0.15em]">
              {t('audience.bounced_invalid')}
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter tabular-nums leading-none">
              {invalid.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
              {t('audience.failed')}
            </p>
          </div>


        </motion.div>

        {/* Risky Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="premium-card p-6 overflow-hidden relative group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="absolute -inset-inline-end-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] blur-2xl group-hover:opacity-10 transition-opacity bg-linear-to-br from-amber-500 to-orange-600"></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-500">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="px-2 py-1 bg-amber-50/50 border border-amber-100 rounded-lg flex items-center gap-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600">
                {t('audience.risky')}
              </span>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-[0.15em]">
              {t('audience.needs_review')}
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter tabular-nums leading-none">
              {risky.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
              {t('audience.processing')}
            </p>
          </div>


        </motion.div>
      </div>
    </div>
  );
};

export default AudienceHeader;
