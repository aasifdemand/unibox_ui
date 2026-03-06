import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Shield, Zap, Activity, Gauge, User, Mail, Database } from 'lucide-react';
import Input from '../../../../../components/ui/input';

const Step3Finalize = ({
  register,
  errors,
  watch,
  watchScheduleType,
  selectedBatch,
  selectedSender,
}) => {
  const { t } = useTranslation();
  const campaignName = watch('name');
  const subject = watch('subject');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Campaign Summary */}
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tighter">
                {t('campaigns.campaign_summary')}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {t('campaigns.review_settings')}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest">
              {t('campaigns.ready_to_send')}
            </span>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="group p-5 bg-slate-50/50 rounded-3xl border-2 border-slate-100 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {t('campaigns.campaign_name')}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {campaignName || t('campaigns.untitled_campaign')}
                </p>
              </div>

              <div className="group p-5 bg-slate-50/50 rounded-3xl border-2 border-slate-100 hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Mail className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {t('campaigns.email_subject')}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 line-clamp-1">
                  {subject || t('campaigns.no_subject_set')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="group p-5 bg-slate-50/50 rounded-3xl border-2 border-slate-100 hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Database className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {t('campaigns.recipient_list')}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {selectedBatch?.originalFilename || t('campaigns.no_list_selected')}
                </p>
              </div>

              <div className="group p-5 bg-slate-50/50 rounded-3xl border-2 border-slate-100 hover:border-purple-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {t('campaigns.sender_account')}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {selectedSender?.email || t('campaigns.no_sender_selected')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Campaign Logic Summary */}
        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              Campaign Protocol
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule Plan</span>
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                {watchScheduleType === 'now' ? 'Immediate Execution' : 'Scheduled Release'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sending Throttle</span>
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                {watch('throttlePerMinute')} EMAILS / MIN
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance Status</span>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking & Launch */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl shadow-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest">
              Launch Rules
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Open Tracking</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${watch('trackOpens') ? 'bg-emerald-400' : 'bg-white/10'}`}>
                <div className={`absolute top-[2px] w-3 h-3 bg-white rounded-full transition-all ${watch('trackOpens') ? 'right-[2px]' : 'left-[2px]'}`} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Click Tracking</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${watch('trackClicks') ? 'bg-emerald-400' : 'bg-white/10'}`}>
                <div className={`absolute top-[2px] w-3 h-3 bg-white rounded-full transition-all ${watch('trackClicks') ? 'right-[2px]' : 'left-[2px]'}`} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Unsubscribe Footer</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${watch('unsubscribeLink') ? 'bg-emerald-400' : 'bg-white/10'}`}>
                <div className={`absolute top-[2px] w-3 h-3 bg-white rounded-full transition-all ${watch('unsubscribeLink') ? 'right-[2px]' : 'left-[2px]'}`} />
              </div>
            </div>
          </div>

          <p className="text-[9px] text-white/40 font-medium uppercase text-center leading-relaxed mt-6">
            Clicking the launch button will initiate the campaign sequence across your selected sending infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step3Finalize;
