/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable unused-imports/no-unused-imports */
import React, { useState, useEffect } from 'react';
import { Settings2, Zap, MessageSquare, Gauge, Save } from 'lucide-react';
import { motion } from 'motion/react';
import Button from '../../../../components/ui/button';
import Modal from '../../../../components/shared/modal';
;

const WarmupSettingsModal = ({
  isOpen,
  onClose,
  mailbox,
  onSave,
  isSaving,
}) => {

  const [dailyLimit, setDailyLimit] = useState(20);
  const [replyRate, setReplyRate] = useState(30);

  useEffect(() => {
    if (mailbox) {
      setDailyLimit(mailbox.stats?.warmupDailyLimit || 20);
      setReplyRate(Math.round((mailbox.stats?.warmupReplyRate || 0.3) * 100));
    }
  }, [mailbox, isOpen]);

  const handleSave = () => {
    onSave(mailbox.id, {
      dailyLimit: parseInt(dailyLimit),
      replyRate: parseFloat(replyRate / 100),
    });
    onClose();
  };

  if (!mailbox) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showCloseButton={true}>
      <div className="overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-br from-orange-600 to-orange-700 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <Settings2 className="w-20 h-20 text-white" />
          </div>
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                Warmup Settings
              </h2>
              <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em] mt-1">
                {mailbox.email}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 bg-white">
          {/* Daily Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Gauge className="w-4 h-4 text-orange-600" />
                Daily Send Limit
              </label>
              <span className="text-sm font-black text-slate-900 tabular-nums bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                {dailyLimit}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
            <p className="text-[10px] text-slate-400 font-medium italic">
              Recommended: 20-50 per day for new accounts.
            </p>
          </div>

          {/* Reply Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                AI Reply Rate
              </label>
              <span className="text-sm font-black text-slate-900 tabular-nums bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
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
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
            <p className="text-[10px] text-slate-400 font-medium italic">
              System will auto-respond to this % of warmup emails using local AI (phi2).
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3.5 text-[11px] font-black uppercase tracking-widest border-2 hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="flex-3 py-3.5 bg-orange-600 text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-md shadow-orange-600/20 hover:bg-orange-700 hover:-translate-y-0.5 transition-all"
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
