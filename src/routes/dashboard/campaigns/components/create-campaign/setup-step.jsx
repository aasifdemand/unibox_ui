import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Clock, Settings, CheckCircle2, ChevronRight,  Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import ScheduleCampaignModal from '../../../../../modals/ScheduleCampaignModal';
import SenderAccountsModal from '../../../../../modals/SenderAccountsModal';
import CampaignSettingsModal from '../../../../../modals/CampaignSettingsModal';
import { getAllTimezones } from '../../campaign-utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const SetupStep = ({
  register,
  watch,
  setValue,
  senders = [],
  watchSenderIds = [],
}) => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState(null);

  const selectedSenderList = senders.filter((s) => watchSenderIds.includes(s.id));
  const sendingDays = watch('sendingDays') || [];
  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const sendingInterval = watch('sendingInterval');

  const toggleDay = (day) => {
    const currentDays = [...sendingDays];
    if (currentDays.includes(day)) {
      setValue('sendingDays', currentDays.filter((d) => d !== day));
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-12 py-12 px-4"
    >
     

      <div className="grid gap-6">
        {/* 1. Sender Accounts */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="group relative bg-white border border-slate-200/60 rounded-2xl p-1 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500"
        >
          <div className="bg-slate-50/50 rounded-xl p-8 flex items-center justify-between group-hover:bg-white transition-colors duration-500">
            <div className="flex items-center gap-8">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-20 h-20 bg-linear-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:rotate-6 transition-transform duration-500">
                  <Mail className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  {t('campaigns.sender_accounts')}
                  {selectedSenderList.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </h3>
                <p className="text-slate-500 font-semibold text-[13px] mt-1 max-w-md line-clamp-1">
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
              onClick={() => setActiveModal('senders')}
              type="button"
              className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-purple-600 hover:text-purple-600 transition-all flex items-center gap-3 active:scale-95 group/btn"
            >
              <span>{t('campaigns.choose_senders_btn')}</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* 2. Schedule Campaign */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="group relative bg-white border border-slate-200/60 rounded-2xl p-1 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500"
        >
          <div className="bg-slate-50/50 rounded-xl p-8 flex items-center justify-between group-hover:bg-white transition-colors duration-500">
            <div className="flex items-center gap-8">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-20 h-20 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:-rotate-6 transition-transform duration-500">
                  <Clock className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  {t('campaigns.schedule_timing')}
                  {(sendingDays.length > 0 && startTime && endTime) && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </h3>
                <p className="text-slate-500 font-semibold text-[13px] mt-1">
                  {(sendingDays.length > 0 && startTime && endTime)
                    ? `${sendingDays.length} active days, ${startTime} - ${endTime}`
                    : t('campaigns.schedule_sending')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('schedule')}
              type="button"
              className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-3 active:scale-95 group/btn"
            >
              <span>{t('campaigns.configure_schedule_btn')}</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* 3. Campaign Settings */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="group relative bg-white border border-slate-200/60 rounded-3xl p-1 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500"
        >
          <div className="bg-slate-50/50 rounded-[1.4rem] p-8 flex items-center justify-between group-hover:bg-white transition-colors duration-500">
            <div className="flex items-center gap-8">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-20 h-20 bg-linear-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform duration-500">
                  <Settings className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  {t('campaigns.advanced_settings')}
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50/50" />
                </h3>
                <p className="text-slate-500 font-semibold text-[13px] mt-1 flex items-center gap-3">
                  {t('campaigns.tracking_rules')}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100/50 text-purple-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-purple-200">
                    <Zap className="w-3 h-3 fill-current" /> {t('campaigns.high_inboxing_enabled')}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('settings')}
              type="button"
              className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-3 active:scale-95 group/btn"
            >
              <span>{t('campaigns.modify_settings_btn')}</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {activeModal === 'schedule' && (
          <ScheduleCampaignModal
            isOpen={true}
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
        )}

        {activeModal === 'senders' && (
          <SenderAccountsModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            senders={senders}
            watchSenderIds={watchSenderIds}
            toggleSender={toggleSender}
          />
        )}

        {activeModal === 'settings' && (
          <CampaignSettingsModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            watch={watch}
            setValue={setValue}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SetupStep;
