import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Calendar, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import Modal from '../components/shared/modal';
import Input from '../components/ui/input';
import Select from '../components/ui/select';
import Button from '../components/ui/button';
import { toast } from 'react-hot-toast';

import { getIanaTimezone } from '../routes/dashboard/campaigns/campaign-utils';
import { DateTime } from 'luxon';

const ScheduleCampaignModal = ({
  isOpen,
  onClose,
  register,
  watch,
  setValue,
  timezones,
  days,
  sendingDays,
  toggleDay,
  sendingInterval,
}) => {
  const { t } = useTranslation();
  const [validationError, setValidationError] = useState('');
  const selectedTimezone = watch('timezone') || 'UTC';

  // Helper to get current date and time in the TARGET timezone
  const getNowInTimezone = (tz) => {
    const iana = getIanaTimezone(tz);
    const dt = DateTime.now().setZone(iana);
    return {
      dateStr: dt.toFormat('yyyy-MM-dd'),
      timeStr: dt.toFormat('HH:mm'),
    };
  };

  const { dateStr: todayStr, timeStr: currentTime } = getNowInTimezone(selectedTimezone);
  const selectedDate = watch('startDate');
  const selectedTime = watch('startTime');

  // One-shot correction: when modal opens or date changes, fix startTime if it's in the past for today
  useEffect(() => {
    if (!isOpen) return;

    if (selectedDate === todayStr) {
      const currentStartTime = watch('startTime');
      if (!currentStartTime || currentStartTime <= currentTime) {
        const [h, m] = currentTime.split(':').map(Number);
        const totalMins = h * 60 + m + 5;
        const newH = String(Math.floor(totalMins / 60) % 24).padStart(2, '0');
        const newM = String(totalMins % 60).padStart(2, '0');
        setValue('startTime', `${newH}:${newM}`, { shouldDirty: true });
      }
    }
    setValidationError('');
    // watch is intentionally omitted — it's a stable function from react-hook-form,
    // and including selectedTime would cause an infinite re-render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedDate, selectedTimezone, currentTime, todayStr, setValue]);


  const selectedEndTime = watch('endTime');

  const handleSave = () => {
    // Validate: endTime must be after startTime (overnight windows not supported —
    // the scheduler uses HH:mm string comparison within the same day)
    if (selectedEndTime && selectedTime && selectedEndTime <= selectedTime) {
      const errorMsg = t(
        'campaigns.error_end_before_start',
        'End time must be after start time. Overnight windows (e.g. 22:00 → 02:00) are not supported — choose a same-day window.'
      );
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (selectedDate === todayStr) {
      // Start time must be in the future
      if (selectedTime <= currentTime) {
        const errorMsg = t('campaigns.error_past_time', 'Start time must be in the future for the selected timezone.');
        setValidationError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      // Warn if the entire sending window closes before end of day usage
      if (selectedEndTime && selectedEndTime <= currentTime) {
        const errorMsg = t('campaigns.error_window_closed', 'End time is already past for today in the selected timezone. Campaign will not send today.');
        setValidationError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    }

    setValidationError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" showCloseButton={true}>
      <div className="overflow-hidden">
        {/* Premium Header */}
        <div className="bg-linear-to-br from-purple-600 to-purple-700 p-8 relative overflow-hidden group">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            className="absolute top-0 right-0 p-8 group-hover:scale-110 transition-transform"
          >
            <Clock className="w-24 h-24 text-white" />
          </motion.div>
          
          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm"
              >
                <Clock className="w-7 h-7" />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                  {t('campaigns.schedule_settings_title', 'Schedule Settings')}
                </h2>
                <div className="flex items-center gap-3 mt-1 underline decoration-white/20 decoration-2 underline-offset-2">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">
                    {t('campaigns.target_clock', 'Target Clock')}:
                  </p>
                  <p className="text-[11px] font-black tracking-widest text-white animate-pulse">
                    {currentTime} <span className="opacity-50 font-medium">({selectedTimezone})</span>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8 relative z-10 bg-white">
          <div className="space-y-8">
            {/* Timezone */}
            <div className="space-y-3">
              <Select
                label="System Timezone"
                {...register('timezone')}
                value={watch('timezone')}
                options={timezones}
                className="h-14 font-bold text-sm"
                containerClassName="space-y-3"
                labelClassName="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"
                icon={Globe}
              />
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
                        ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                        : 'bg-slate-50/50 border-slate-100 text-slate-400 hover:border-slate-300'
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
                <Input
                  type="time"
                  label={t('campaigns.start_time', 'Start Time')}
                  {...register('startTime')}
                  value={watch('startTime')}
                  error={validationError && watch('startDate') === todayStr ? validationError : ''}
                  className="h-14 font-bold text-sm"
                  containerClassName="space-y-3"
                  labelClassName="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                />
              </div>
              <div className="space-y-3">
                <Input
                  type="time"
                  label={t('campaigns.end_time', 'End Time')}
                  {...register('endTime')}
                  value={watch('endTime')}
                  className="h-14 font-bold text-sm"
                  containerClassName="space-y-3"
                  labelClassName="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Interval */}
            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Sending Interval
                </label>
                <span className="text-sm font-bold text-purple-600 bg-purple-50/50 px-3 py-1 rounded-lg border border-purple-100/50">
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
                    className="h-full bg-purple-600 rounded-full transition-all relative"
                    style={{ width: `${(sendingInterval / 60) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-purple-600 rounded-full shadow-sm group-hover:scale-125 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-50">
              <div className="space-y-3">
                <Input
                  type="date"
                  label={t('campaigns.start_date', 'Start Date')}
                  icon={Calendar}
                  min={todayStr}
                  {...register('startDate')}
                  value={watch('startDate')}
                  className="h-14 font-bold text-sm"
                  containerClassName="space-y-3"
                  labelClassName="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"
                />
              </div>
              <div className="space-y-3">
                <Input
                  type="number"
                  label={t('campaigns.leads_per_day', 'Leads Per Day')}
                  {...register('maxLeadsPerDay', { valueAsNumber: true })}
                  className="h-14 font-bold text-sm"
                  containerClassName="space-y-3"
                  labelClassName="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSave}
              className="w-full py-4 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-sm shadow-purple-600/20 hover:bg-purple-700 transition-all uppercase tracking-widest"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleCampaignModal;
