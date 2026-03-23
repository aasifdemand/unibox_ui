import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Clock,
  Settings,
  CheckCircle2,
  Calendar,
  Globe,
  X,
  Plus,
  Check,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import Modal from '../../../../../components/shared/modal';

const SetupStep = ({
  register,
  errors,
  watch,
  setValue,
  senders = [],
  watchSenderId,
  watchSenderIds = [],
}) => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState(null); // 'senders' | 'schedule' | 'settings'

  const selectedSenderList = senders.filter((s) => watchSenderIds.includes(s.id));
  const firstSelectedSender = selectedSenderList[0];

  // Watch scheduling values
  const sendingDays = watch('sendingDays') || [];
  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const sendingInterval = watch('sendingInterval');
  const timezone = watch('timezone');
  const startDate = watch('startDate');
  const maxLeadsPerDay = watch('maxLeadsPerDay');

  const toggleDay = (day) => {
    const currentDays = [...sendingDays];
    if (currentDays.includes(day)) {
      setValue(
        'sendingDays',
        currentDays.filter((d) => d !== day),
      );
    } else {
      setValue('sendingDays', [...currentDays, day]);
    }
  };

  const toggleSender = (sender) => {
    let currentIds = Array.isArray(watchSenderIds) ? [...watchSenderIds] : [];
    if (currentIds.includes(sender.id)) {
      currentIds = currentIds.filter((id) => id !== sender.id);
    } else {
      currentIds.push(sender.id);
    }

    setValue('senderIds', currentIds, { shouldValidate: true });

    // Also set primary senderId and type for transition compatibility
    if (currentIds.length > 0) {
      setValue('senderId', currentIds[0]);
      const firstSender = senders.find((s) => s.id === currentIds[0]);
      if (firstSender) setValue('senderType', firstSender.type || firstSender.senderType);
    } else {
      setValue('senderId', '');
    }
  };

  const days = [
    { id: 'sunday', label: 'Sun' },
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'EST (Eastern Standard Time)' },
    { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
    { value: 'Asia/Kolkata', label: 'IST (India Standard Time)' },
    { value: 'Asia/Dubai', label: 'GST (Gulf Standard Time)' },
    { value: 'Asia/Singapore', label: 'SGT (Singapore Time)' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Sender Accounts */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 flex items-center justify-between group hover:border-orange-100 transition-all shadow-sm">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-orange-50/50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-100/50">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {t('campaigns.sender_accounts')}
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {selectedSenderList.length > 0
                ? t('campaigns.selected_count', { count: selectedSenderList.length }) +
                  ': ' +
                  selectedSenderList
                    .slice(0, 2)
                    .map((s) => s.email)
                    .join(', ') +
                  (selectedSenderList.length > 2 ? '...' : '')
                : t('campaigns.select_accounts_desc')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('senders')}
          className="px-8 py-3 bg-orange-600 text-white rounded-lg text-[11px] font-bold shadow-sm shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-0.5 transition-all uppercase tracking-widest"
        >
          {t('campaigns.choose_senders_btn')}
        </button>
      </div>

      {/* 2. Schedule Campaign */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 flex items-center justify-between group hover:border-orange-100 transition-all shadow-sm">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-orange-50/50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-100/50">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {t('campaigns.schedule_timing')}
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {sendingDays.length > 0
                ? `${sendingDays.length} active days, ${startTime} - ${endTime}`
                : t('campaigns.schedule_sending')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('schedule')}
          className="px-8 py-3 bg-orange-600 text-white rounded-lg text-[11px] font-bold shadow-sm shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-0.5 transition-all uppercase tracking-widest"
        >
          {t('campaigns.configure_schedule_btn')}
        </button>
      </div>

      {/* 3. Campaign Settings */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 flex items-center justify-between group hover:border-orange-100 transition-all shadow-sm">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-orange-50/50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-100/50">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {t('campaigns.advanced_settings')}
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {t('campaigns.tracking_rules')}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-orange-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('campaigns.high_inboxing_enabled')}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('settings')}
          className="px-8 py-3 bg-orange-600 text-white rounded-lg text-[11px] font-bold shadow-sm shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-0.5 transition-all uppercase tracking-widest"
        >
          {t('campaigns.modify_settings_btn')}
        </button>
      </div>

      {/* MODALS */}

      {/* Schedule Modal */}
      <Modal
        isOpen={activeModal === 'schedule'}
        onClose={() => setActiveModal(null)}
        maxWidth="max-w-2xl"
      >
        <div className="p-10 space-y-10">
          <div className="flex items-center justify-between pb-6 border-b border-slate-50">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Schedule Settings
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Control precisely when your emails are delivered
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Timezone */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4" /> Timezone
              </label>
              <div className="relative group">
                <select
                  {...register('timezone')}
                  className="w-full h-14 pl-5 pr-12 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50/30 text-slate-700 font-bold text-sm focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/5 outline-none transition-all appearance-none cursor-pointer"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            {/* Sending Days */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Active Sending Days
              </label>
              <div className="flex flex-wrap gap-2.5">
                {days.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`min-w-[70px] py-3.5 rounded-lg text-xs font-bold transition-all border-2 ${
                      sendingDays.includes(day.id)
                        ? 'bg-orange-600 border-orange-600 text-white shadow-md'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Period */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-50">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Start Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    {...register('startTime')}
                    className="w-full h-14 px-5 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50/30 text-slate-700 font-bold text-sm focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/5 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  End Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    {...register('endTime')}
                    className="w-full h-14 px-5 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50/30 text-slate-700 font-bold text-sm focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/5 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Interval */}
            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Sending Interval
                </label>
                <span className="text-sm font-bold text-orange-600 bg-orange-50/50 px-3 py-1 rounded-lg border border-orange-100/50">
                  Wait {sendingInterval} mins between emails
                </span>
              </div>
              <div className="flex items-center gap-6 px-2">
                <div className="flex-1 bg-slate-100 h-3 rounded-full relative shadow-inner group">
                  <input
                    type="range"
                    min="1"
                    max="60"
                    {...register('sendingInterval', { valueAsNumber: true })}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="h-full bg-orange-600 rounded-full transition-all relative"
                    style={{ width: `${(sendingInterval / 60) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-orange-600 rounded-full shadow-sm group-hover:scale-125 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-50">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Start Date
                </label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full h-14 px-5 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50/30 text-slate-700 font-bold text-sm focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/5 outline-none transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Leads Per Day
                </label>
                <input
                  type="number"
                  {...register('maxLeadsPerDay', { valueAsNumber: true })}
                  className="w-full h-14 px-5 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50/30 text-slate-700 font-bold text-sm focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/5 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-4 bg-orange-600 text-white rounded-lg text-xs font-bold shadow-sm shadow-orange-600/20 hover:bg-orange-700 transition-all uppercase tracking-widest"
            >
              Save Settings
            </button>
          </div>
        </div>
      </Modal>

      {/* Senders Modal */}
      <Modal
        isOpen={activeModal === 'senders'}
        onClose={() => setActiveModal(null)}
        maxWidth="max-w-3xl"
      >
        <div className="p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                {t('campaigns.active_senders')}
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                {t('campaigns.select_accounts_desc')}
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
            {senders.map((sender) => {
              const isSelected = watchSenderIds.includes(sender.id);
              const reputation = sender.stats?.reputationScore || 0;
              const healthStatus = sender.stats?.healthStatus || 'unknown';

              return (
                <div
                  key={sender.id}
                  onClick={() => toggleSender(sender)}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all relative group overflow-hidden ${
                    isSelected
                      ? 'border-orange-600 bg-orange-50/20'
                      : 'border-slate-100 bg-white hover:border-orange-100 hover:bg-slate-50/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600'
                      }`}
                    >
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-bold text-sm truncate ${isSelected ? 'text-orange-900' : 'text-slate-700'}`}
                      >
                        {sender.email}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-orange-400' : 'text-slate-400'}`}
                        >
                          {sender.type || sender.senderType || 'SMTP'}
                        </span>
                        <div
                          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${
                            reputation >= 80
                              ? 'bg-orange-50 text-orange-600 border-orange-100'
                              : reputation >= 50
                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                : 'bg-orange-50 text-orange-600 border-orange-100'
                          }`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${reputation >= 80 ? 'bg-orange-500' : reputation >= 50 ? 'bg-amber-500' : 'bg-orange-500'}`}
                          />
                          {reputation}% {t('campaigns.trust_score')}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-orange-600 animate-in zoom-in duration-300">
                        <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white stroke-[4px]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <button className="p-6 rounded-lg border-2 border-dashed border-slate-200 hover:border-orange-400 hover:bg-orange-50/20 transition-all flex flex-col items-center justify-center gap-3 group min-h-[120px]">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black text-slate-400 group-hover:text-orange-600 transition-all uppercase tracking-widest">
                Add New Sender
              </span>
            </button>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-4.5 bg-orange-600 text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-sm shadow-orange-600/20 hover:bg-orange-700 hover:-translate-y-0.5 transition-all"
            >
              {t('campaigns.confirm_selection')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Settings Modal (Throttle/Tracking) */}
      <Modal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
        maxWidth="max-w-lg"
      >
        <div className="p-10 space-y-10">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Campaign Settings
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Configure global delivery rules
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            <div className="space-y-5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Check className="w-4 h-4" /> Tracking Options
              </h3>

              {[
                { id: 'trackOpens', label: 'Open Tracking', desc: 'Track unique email opens' },
                {
                  id: 'trackClicks',
                  label: 'Click Tracking',
                  desc: 'Monitor link clicks engagement',
                },
                {
                  id: 'unsubscribeLink',
                  label: 'Unsubscribe Footer',
                  desc: 'Mandatory for high deliverability',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-orange-100 transition-all group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-orange-900 transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                  <div
                    onClick={() => setValue(item.id, !watch(item.id))}
                    className={`w-12 h-7 rounded-full relative cursor-pointer transition-all duration-300 shadow-inner ${watch(item.id) ? 'bg-orange-600' : 'bg-slate-200'}`}
                  >
                    <div
                      className={`absolute top-[4.5px] w-4.5 h-4.5 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${watch(item.id) ? 'left-[24px]' : 'left-[5px]'}`}
                    >
                      {watch(item.id) && <div className="w-1 h-1 bg-orange-600 rounded-full" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-5 pt-8 border-t border-slate-50">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Smart Delivery
              </h3>
              <div className="flex items-center gap-5 p-6 bg-orange-50/50 rounded-lg border border-orange-100 group">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs text-orange-700 font-bold leading-relaxed flex-1">
                  AI Optimization is active. We automatically space out emails and use warmed pools
                  for peak inbox rates.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-4 bg-orange-600 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest shadow-sm shadow-orange-600/20 hover:bg-orange-700 transition-all hover:-translate-y-0.5"
            >
              Apply Optimization
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SetupStep;
