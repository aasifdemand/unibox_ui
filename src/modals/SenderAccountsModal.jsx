import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Shield, Plus, Check, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import Modal from '../components/shared/modal';
import Button from '../components/ui/button';

const SenderAccountsModal = ({
  isOpen,
  onClose,
  senders = [],
  watchSenderIds = [],
  toggleSender,
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl" showCloseButton={true}>
      <div className="overflow-hidden">
        {/* Premium Header */}
        <div className="bg-linear-to-br from-orange-600 to-orange-700 p-8 relative overflow-hidden group">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            className="absolute top-0 right-0 p-8 group-hover:scale-110 transition-transform"
          >
            <Shield className="w-24 h-24 text-white" />
          </motion.div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm"
              >
                <Mail className="w-7 h-7 text-white" />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  {t('campaigns.active_senders', 'Active Accounts')}
                </h2>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">
                  {t('campaigns.select_accounts_desc', 'Connect accounts to this sequence')}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8 relative z-10 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
            {senders.map((sender) => {
              const isSelected = watchSenderIds.includes(sender.id);
              const reputation = sender.stats?.reputationScore || 0;
              const warmupEnabled = sender.stats?.warmupEnabled;
              const warmupStatus = sender.stats?.warmupStatus || 'disabled';

              return (
                <div
                  key={sender.id}
                  onClick={() => toggleSender(sender)}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all relative group overflow-hidden ${
                    isSelected
                      ? 'border-orange-600 bg-orange-50/20'
                      : 'border-slate-100 bg-slate-50/50 hover:border-orange-100 hover:bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-50/20 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600'
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
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-orange-400' : 'text-slate-400'}`}
                        >
                          {sender.type || sender.senderType || 'SMTP'}
                        </span>

                        {/* Warmup Badge */}
                        {warmupEnabled && (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-100 text-[8px] font-black uppercase tracking-tighter">
                              <Activity className="w-2.5 h-2.5 animate-pulse" />
                              Warmup {warmupStatus}
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 tabular-nums">
                              {sender.stats?.warmupCurrentSent || 0} / {sender.stats?.warmupDailyLimit || 20}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider self-start ${
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
                          {reputation}% {t('campaigns.trust_score', 'Trust')}
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

            <button className="p-6 rounded-lg border-2 border-dashed border-slate-100 hover:border-orange-400 hover:bg-orange-50/20 transition-all flex flex-col items-center justify-center gap-3 group min-h-[120px] bg-slate-50/50">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black text-slate-400 group-hover:text-orange-600 transition-all uppercase tracking-widest">
                Add New Sender
              </span>
            </button>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={onClose}
              className="w-full py-4.5 bg-orange-600 text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-sm shadow-orange-600/20 hover:bg-orange-700 hover:-translate-y-0.5 transition-all"
            >
              {t('campaigns.confirm_selection', 'Confirm Selection')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SenderAccountsModal;
