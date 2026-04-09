import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Activity,
  Gauge,
  Mail,
  Database,
  CheckCircle2,
  BarChart3,
  MousePointer2,
  Trash2,
  Sparkles,
} from 'lucide-react';

const Step3Finalize = ({
  watch,
  setValue,
  selectedBatch,

  watchSenderIds = [],
  senders = [],
}) => {
  const { t } = useTranslation();
  const campaignName = watch('name');
  const subject = watch('subject');

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Launch Readiness Header */}
      <div className="bg-purple-600 rounded-lg p-12 text-white relative overflow-hidden shadow-sm shadow-purple-600/20 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl group-hover:scale-125 transition-transform duration-1000" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
            <div className="w-20 h-20 bg-white/20  rounded-lg flex items-center justify-center border border-white/20 shadow-sm group-hover:rotate-12 transition-transform duration-500">
              <Sparkles className="w-10 h-10 text-white fill-white/20" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {campaignName || 'Untitled Campaign'}
              </h2>
              <p className="text-purple-100 font-medium mt-1 flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle2 className="w-4 h-4 text-white" /> {t('campaigns.ready_to_send')}
              </p>
            </div>
          </div>

          <div className="flex bg-white/10  rounded-lg p-6 border border-white/10 items-center gap-6">
            <div className="text-center">
              <p className="text-xs font-bold text-purple-200">
                Total Leads
              </p>
              <p className="text-2xl font-bold mt-1">
                {(selectedBatch?.verification?.valid ?? selectedBatch?.validRecords) || 0}
              </p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-xs font-bold text-purple-200">
                Avg. Delay
              </p>
              <p className="text-2xl font-black mt-1">{watch('sendingInterval')}m</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border-2 border-slate-100 rounded-lg p-10 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Campaign Infrastructure
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-purple-100 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm border border-slate-50 text-purple-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {t('campaigns.sender_rotation_count', { count: watchSenderIds.length })}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {senders
                    .filter((s) => watchSenderIds.includes(s.id))
                    .slice(0, 3)
                    .map((s) => (
                      <p
                        key={s.id}
                        className="text-[11px] font-bold text-slate-800 truncate flex items-center gap-2"
                      >
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        {s.email}
                      </p>
                    ))}
                  {watchSenderIds.length > 3 && (
                    <p className="text-[10px] text-slate-400 font-bold italic ml-3">
                      {t('campaigns.more_accounts', { count: watchSenderIds.length - 3 })}
                    </p>
                  )}
                  {watchSenderIds.length === 0 && (
                    <p className="text-sm font-bold text-slate-800">
                      {t('campaigns.no_sender_set')}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-purple-100 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm border border-purple-50 text-purple-600">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Lead Database
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {selectedBatch?.originalFilename || 'No list selected'}
                </p>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  {(selectedBatch?.verification?.valid ?? selectedBatch?.validRecords) || 0} Ready
                  Prospects
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm border border-slate-50 text-amber-600">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Primary Email Subject
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 line-clamp-1">
                {subject || '(No Subject)'}
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-lg p-10 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Protocol & Timing
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Days', val: (watch('sendingDays') || []).length, desc: 'Active days' },
                { label: 'Window', val: '9-6', desc: 'Working hours' },
                { label: 'Leads', val: watch('maxLeadsPerDay'), desc: 'Daily max' },
                { label: 'Interval', val: `${watch('sendingInterval')}m`, desc: 'Wait time' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-slate-50/50 rounded-lg border border-slate-100 flex flex-col items-center text-center"
                >
                  <p className="text-[10px] font-bold text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{item.val}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tracking & Engagement */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg p-10 border-2 border-slate-100 shadow-sm space-y-8 h-full">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100/50">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Engagement Tracking
              </h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 'trackOpens',
                  label: 'Open Tracking',
                  icon: BarChart3,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50',
                },
                {
                  id: 'trackClicks',
                  label: 'Click Tracking',
                  icon: MousePointer2,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50',
                },
                {
                  id: 'unsubscribeLink',
                  label: 'Unsubscribe Link',
                  icon: Trash2,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5 bg-slate-50/50 rounded-lg border border-slate-100 group hover:border-purple-100 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-md ${item.bgColor} flex items-center justify-center`}
                    >
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{item.label}</span>
                  </div>
                  <div
                    onClick={() => setValue(item.id, !watch(item.id))}
                    className={`w-12 h-7 rounded-full relative cursor-pointer transition-all duration-300 shadow-inner ${watch(item.id) ? 'bg-purple-600' : 'bg-slate-200'}`}
                  >
                    <div
                      className={`absolute top-[4.5px] w-4.5 h-4.5 bg-white rounded-full shadow-md transition-all duration-300 ${watch(item.id) ? 'left-[24px]' : 'left-[5px]'}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-purple-50/50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm border border-purple-50">
                  <Gauge className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-xs font-bold text-purple-600/60">
                  Deliverability Health
                </span>
              </div>
              <div className="h-2.5 bg-purple-100/50 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-purple-500 rounded-full w-[95%] shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-[10px] font-bold text-purple-600/60">
                  Optimal
                </span>
                <span className="text-[10px] font-bold text-purple-700">95% Health</span>
              </div>
            </div>

            <div className="pt-6">
              <p className="text-[9px] text-slate-400 font-bold uppercase text-center leading-relaxed italic tracking-wider">
                Sequences are encrypted and routed through warmed infrastructure for maximum
                inboxing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Finalize;
