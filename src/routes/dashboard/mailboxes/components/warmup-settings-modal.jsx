/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable unused-imports/no-unused-imports */
import React, { useState, useEffect } from 'react';
import { Settings2, Zap, MessageSquare, Gauge, Save, LineChart, Target, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import Button from '../../../../components/ui/button';
import Modal from '../../../../components/shared/modal';

const WarmupSettingsModal = ({
  isOpen,
  onClose,
  mailbox,
  onSave,
  isSaving,
}) => {
  const [dailyLimit, setDailyLimit] = useState(20);
  const [replyRate, setReplyRate] = useState(30);
  const [initialLimit, setInitialLimit] = useState(2);
  const [incrementBy, setIncrementBy] = useState(2);
  const [maxLimit, setMaxLimit] = useState(50);

  useEffect(() => {
    if (mailbox) {
      setDailyLimit(mailbox.stats?.warmupDailyLimit || 20);
      setReplyRate(Math.round((mailbox.stats?.warmupReplyRate || 0.3) * 100));
      setInitialLimit(mailbox.stats?.warmupInitialLimit || 2);
      setIncrementBy(mailbox.stats?.warmupIncrementBy || 2);
      setMaxLimit(mailbox.stats?.warmupMaxLimit || 50);
    }
  }, [mailbox, isOpen]);

  const handleSave = () => {
    onSave(mailbox.id, {
      dailyLimit: parseInt(dailyLimit),
      replyRate: parseFloat(replyRate / 100),
      initialLimit: parseInt(initialLimit),
      incrementBy: parseInt(incrementBy),
      maxLimit: parseInt(maxLimit),
    });
    onClose();
  };

  if (!mailbox) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showCloseButton={true}>
      <div className="overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-br from-purple-600 to-purple-700 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <Settings2 className="w-20 h-20 text-white" />
          </div>
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Warmup Settings
              </h2>
              <p className="text-xs font-semibold text-white/80 mt-1">
                {mailbox.email}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 bg-white max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Section: Warmup Curve (Auto-Step) */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-50">
               <LineChart className="w-4 h-4 text-purple-600" />
               <h3 className="text-xs font-bold text-slate-900">Warmup Curve</h3>
            </div>
            
            {/* Initial Limit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  Starting Limit (Day 1)
                </label>
                <span className="text-xs font-bold text-slate-900 tabular-nums bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  {initialLimit}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={initialLimit}
                onChange={(e) => setInitialLimit(e.target.value)}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Daily Increase */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  Daily Increase
                </label>
                <div className="flex items-center gap-1.5 text-xs font-black text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+{incrementBy}/day</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={incrementBy}
                onChange={(e) => setIncrementBy(e.target.value)}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Max Limit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  Maximum Limit
                </label>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                   <Target className="w-3 h-3 text-slate-400" />
                   <span>{maxLimit}</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={maxLimit}
                onChange={(e) => setMaxLimit(e.target.value)}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>

          {/* Section: AI Interaction */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-50">
               <MessageSquare className="w-4 h-4 text-purple-600" />
               <h3 className="text-xs font-bold text-slate-900">AI Interaction</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  AI Reply Rate
                </label>
                <span className="text-xs font-bold text-slate-900 tabular-nums bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  {replyRate}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={replyRate}
                onChange={(e) => setReplyRate(e.target.value)}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                System auto-responds to this % of emails using local AI (phi2) or hardcoded fallbacks if AI is offline.
              </p>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3.5 text-xs font-bold border-2 hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="flex-2 py-3.5 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-600/20 hover:bg-purple-700 hover:-translate-y-0.5 transition-all"
            >
              <Save className="w-4 h-4 me-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WarmupSettingsModal;
