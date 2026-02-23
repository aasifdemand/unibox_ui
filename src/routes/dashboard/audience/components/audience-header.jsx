import React from "react";
import Button from "../../../../components/ui/button";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Plus,
  RefreshCcw,
  Upload,
  Users,
  XCircle,
} from "lucide-react";

const AudienceHeader = ({
  activeTab,
  setShowUploadModal,
  setShowSenderModal,
  totalContacts,
  verified,
  invalid,
  risky,
}) => {
  return (
    <div className="premium-card p-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tighter">
              Recipients & Senders
            </h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Manage your mailing lists and sending accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "contacts" ? (
            <>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary py-2.5 px-5 flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">
                  Refresh
                </span>
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary py-2.5 px-5 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">
                  Add Contacts
                </span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowSenderModal(true)}
              className="btn-primary py-2.5 px-5 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">
                Add Sender
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Stats Card */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-linear-to-br from-indigo-600 to-blue-700 text-white border-none shadow-2xl shadow-indigo-500/20 group cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
          <p className="text-[10px] font-extrabold text-indigo-100/60 uppercase tracking-[0.2em] mb-4">
            Total Contacts
          </p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold tracking-tight tabular-nums">
              {totalContacts.toLocaleString()}
            </span>
            <span className="text-[10px] font-extrabold text-white/60 mb-1.5">
              RECIPIENTS
            </span>
          </div>
          <div className="mt-6 w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/40 w-full"></div>
          </div>
        </div>

        {/* Valid Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest">
              Valid
            </div>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
            Active & Verified
          </p>
          <h3 className="text-2xl font-extrabold text-slate-800 tabular-nums leading-none">
            {verified.toLocaleString()}
          </h3>
        </div>

        {/* Invalid Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm group hover:border-rose-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest">
              Invalid
            </div>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
            Bounced or Invalid
          </p>
          <h3 className="text-2xl font-extrabold text-slate-800 tabular-nums leading-none">
            {invalid.toLocaleString()}
          </h3>
        </div>

        {/* Risky Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm group hover:border-amber-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-extrabold uppercase tracking-widest">
              Risky
            </div>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
            Needs Review
          </p>
          <h3 className="text-2xl font-extrabold text-slate-800 tabular-nums leading-none">
            {risky.toLocaleString()}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AudienceHeader;
