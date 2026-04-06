import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Shield, Plus, Check, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/shared/modal';
import Button from '../components/ui/button';

const SenderAccountsModal = ({
  isOpen,
  onClose,
  senders = [],
  watchSenderIds = [],
  toggleSender,
  onSendTest, // Callback to trigger test send
  mode = 'select', // 'select' or 'test'
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-6xl" showCloseButton={true}>
      <div className="overflow-hidden">
        {/* Premium Header */}
        <div className="bg-linear-to-br from-purple-600 to-purple-700 p-8 relative overflow-hidden group">
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

        <div className="p-0 relative z-10 bg-white">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="py-5 px-6 border-b border-slate-200/60 text-left w-10">
                    <div className="w-4 h-4 rounded border border-slate-300" />
                  </th>
                  <th className="py-5 px-6 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                    {t('campaigns.account_info', 'Account Info')}
                  </th>
                  <th className="py-5 px-6 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                    {t('campaigns.status', 'Status')}
                  </th>
                  <th className="py-5 px-6 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left w-48">
                    {t('campaigns.daily_limit', 'Daily Limit Usage')}
                  </th>
                  <th className="py-5 px-6 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                    {t('campaigns.warmup_status', 'Warmup Status')}
                  </th>
                  <th className="py-5 px-6 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                    {t('campaigns.time_gap', 'Min. Time Gap')}
                  </th>
                  <th className="py-5 px-6 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                    {t('campaigns.shared_status', 'Shared Status')}
                  </th>
                  <th className="py-5 px-6 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
                    {t('campaigns.associated_leads', 'Associated Leads')}
                  </th>
                  <th className="py-5 px-6 border-b border-slate-200/60 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {senders.map((sender) => {
                  const isSelected = watchSenderIds.includes(sender.id);
                  const warmupEnabled = sender.stats?.warmupEnabled;
                  const currentUsage = sender.stats?.warmupCurrentSent || 0;
                  const usageLimit = sender.stats?.warmupDailyLimit || sender.stats?.dailyLimit || 50;
                  const usagePercent = Math.round((currentUsage / usageLimit) * 100);

                  return (
                    <tr
                      key={sender.id}
                      onClick={() => toggleSender(sender)}
                      className={`group hover:bg-slate-50/50 transition-all duration-300 cursor-pointer ${isSelected ? 'bg-purple-50/30' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-6 border-b border-slate-100">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[4px]" />}
                        </div>
                      </td>

                      {/* Account Info */}
                      <td className="py-4 px-6 border-b border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 tracking-tight group-hover:text-purple-600 transition-colors">
                            {sender.displayName || sender.email.split('@')[0]}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {sender.email}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 border-b border-slate-100">
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100/50 w-fit">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                          <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">
                            {sender.isVerified ? 'Active' : 'Unverified'}
                          </span>
                        </div>
                      </td>

                      {/* Daily Limit Usage */}
                      <td className="py-4 px-6 border-b border-slate-100">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-700 tabular-nums">
                              {currentUsage}/{usageLimit}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 tabular-nums">
                              {usagePercent}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/40">
                            <div
                              className="h-full bg-purple-600 rounded-full transition-all duration-1000"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Warmup Status */}
                      <td className="py-4 px-6 border-b border-slate-100">
                        {warmupEnabled ? (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span className="text-[11px] font-black text-slate-600 tabular-nums">
                              {sender.stats?.warmupStatus === 'completed' ? 'Healthy' : 'Warming'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-black text-slate-300">NA</span>
                        )}
                      </td>

                      {/* Min. Time Gap */}
                      <td className="py-4 px-6 border-b border-slate-100">
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                          {sender.minTimeGap || 1} min
                        </span>
                      </td>

                      {/* Shared Status */}
                      <td className="py-4 px-6 border-b border-slate-100">
                        <div className="flex items-center gap-1 w-fit">
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex items-center justify-center">
                            <Plus className="w-1.5 h-1.5 text-white" />
                          </div>
                          <span className="text-[11px] font-black text-purple-600">
                            {sender.campaignCount || 0} Campaigns
                          </span>
                        </div>
                      </td>

                      {/* Associated Leads */}
                      <td className="py-4 px-6 border-b border-slate-100">
                        <span className="text-[11px] font-black text-slate-600">
                          {sender.leadCount || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 border-b border-slate-100 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {onSendTest && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               onSendTest(sender);
                             }}
                             className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all group/test"
                           >
                              <Activity className="w-3.5 h-3.5 group-hover/test:scale-110 transition-transform" />
                              {mode === 'test' ? 'Send Test' : 'Test Account'}
                           </button>
                          )}
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/mailboxes/${sender.id}`);
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-purple-600 transition-colors group/btn"
                          >
                            <Activity className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform text-slate-300" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Add New Row */}
                <tr className="bg-slate-50/30">
                  <td colSpan={9} className="py-8 px-6 text-center border-b border-slate-100">
                    <button className="inline-flex items-center gap-3 px-6 py-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-purple-400 hover:bg-purple-50/20 transition-all group">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-black text-slate-400 group-hover:text-purple-600 transition-all uppercase tracking-widest">
                        {t('campaigns.add_new_sender', 'Add New Sender')}
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-slate-100 bg-slate-50/20">
            <Button
              onClick={onClose}
              className="w-full py-4.5 bg-purple-600 text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-sm shadow-purple-600/20 hover:bg-purple-700 hover:-translate-y-0.5 transition-all"
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
