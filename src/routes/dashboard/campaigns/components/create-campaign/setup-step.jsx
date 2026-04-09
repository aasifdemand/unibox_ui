import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Clock, Settings, CheckCircle2 } from 'lucide-react';
import Button from '../../../../../components/ui/button';
import ScheduleCampaignModal from '../../../../../modals/ScheduleCampaignModal';
import SenderAccountsModal from '../../../../../modals/SenderAccountsModal';
import CampaignSettingsModal from '../../../../../modals/CampaignSettingsModal';
import { getAllTimezones } from '../../campaign-utils';

const SetupStep = ({
  register,
  watch,
  setValue,
  senders = [],
  watchSenderIds = [],
}) => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState(null); // 'senders' | 'schedule' | 'settings'

  const selectedSenderList = senders.filter((s) => watchSenderIds.includes(s.id));

  // Watch scheduling values
  const sendingDays = watch('sendingDays') || [];
  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const sendingInterval = watch('sendingInterval');

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

  const timezones = useMemo(() => getAllTimezones(), []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Sender Accounts */}
      <div className="bg-white border border-slate-100 rounded-lg p-10 flex items-center justify-between group hover:border-purple-100 transition-all shadow-sm">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-purple-50/50 rounded-lg flex items-center justify-center text-purple-600 border border-purple-100/50">
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
        <Button
          onClick={() => setActiveModal('senders')}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-sm shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 transition-all"
        >
          {t('campaigns.choose_senders_btn')}
        </Button>
      </div>

      {/* 2. Schedule Campaign */}
      <div className="bg-white border border-slate-100 rounded-lg p-10 flex items-center justify-between group hover:border-purple-100 transition-all shadow-sm">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-purple-50/50 rounded-lg flex items-center justify-center text-purple-600 border border-purple-100/50">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {t('campaigns.schedule_timing')}
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {(sendingDays.length > 0 && startTime && endTime)
                ? `${sendingDays.length} active days, ${startTime} - ${endTime}`
                : t('campaigns.schedule_sending')}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setActiveModal('schedule')}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg text-[11px] font-bold shadow-sm shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 transition-all uppercase tracking-widest"
        >
          {t('campaigns.configure_schedule_btn')}
        </Button>
      </div>

      {/* 3. Campaign Settings */}
      <div className="bg-white border border-slate-100 rounded-lg p-10 flex items-center justify-between group hover:border-purple-100 transition-all shadow-sm">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-purple-50/50 rounded-lg flex items-center justify-center text-purple-600 border border-purple-100/50">
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold border border-purple-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('campaigns.high_inboxing_enabled')}
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setActiveModal('settings')}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg text-[11px] font-bold shadow-sm shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 transition-all uppercase tracking-widest"
        >
          {t('campaigns.modify_settings_btn')}
        </Button>
      </div>

      {/* MODALS */}
      <ScheduleCampaignModal
        isOpen={activeModal === 'schedule'}
        onClose={() => setActiveModal(null)}
        register={register}
        watch={watch}
        setValue={setValue}
        timezones={timezones}
        days={days}
        sendingDays={sendingDays}
        toggleDay={toggleDay}
        startTime={startTime}
        endTime={endTime}
        sendingInterval={sendingInterval}
      />

      <SenderAccountsModal
        isOpen={activeModal === 'senders'}
        onClose={() => setActiveModal(null)}
        senders={senders}
        watchSenderIds={watchSenderIds}
        toggleSender={toggleSender}
      />

      <CampaignSettingsModal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
        watch={watch}
        setValue={setValue}
      />
    </div>
  );
};

export default SetupStep;
