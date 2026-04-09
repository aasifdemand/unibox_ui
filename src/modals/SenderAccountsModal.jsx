import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Shield, Plus, Check, Activity, ExternalLink, } from 'lucide-react';
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
                className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm shadow-lg"
              >
                <Mail className="w-7 h-7 text-white" />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-white tracking-tight leading-none">
                  {mode === 'test' ? 'Send Test Email' : t('campaigns.active_senders', 'Active Accounts')}
                </h2>
                <p className="text-xs font-semibold text-white/70 mt-1.5">
                  {mode === 'test' ? 'Pick an account to dispatch a test outreach.' : t('campaigns.select_accounts_desc', 'Connect accounts to this sequence')}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="p-0 relative z-10 bg-white">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 px-6 border-b border-slate-100 text-left w-12">
                    <div className="w-4.5 h-4.5 rounded border border-slate-300 bg-white" />
                  </th>
                  <th className="py-4 px-6 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">
                    {t('campaigns.account_info', 'Account Info')}
                  </th>
                  <th className="py-4 px-6 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">
                    {t('campaigns.status', 'Status')}
                  </th>
                  <th className="py-4 px-6 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left min-w-[160px]">
                    {t('campaigns.daily_limit', 'Limit Usage')}
                  </th>
                  <th className="py-4 px-6 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">
                    {t('campaigns.warmup_status', 'Warmup')}
                  </th>
                  <th className="py-4 px-6 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">
                    {t('campaigns.time_gap', 'Gap')}
                  </th>
                  <th className="py-4 px-6 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">
                   Campaigns
                  </th>
                  <th className="py-4 px-6 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                   Leads
                  </th>
                  <th className="py-4 px-6 border-b border-slate-100 text-right pr-8 uppercase text-xs font-semibold text-slate-500 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {senders.map((sender) => {
                  const isSelected = watchSenderIds.includes(sender.id);
                  const warmupEnabled = sender.stats?.warmupEnabled;
                  const currentUsage = sender.stats?.warmupCurrentSent || 0;
                  const usageLimit = sender.stats?.warmupDailyLimit || sender.stats?.dailyLimit || 50;
                  const usagePercent = Math.min(100, Math.round((currentUsage / usageLimit) * 100));

                  return (
                    <tr
                      key={sender.id}
                      onClick={() => toggleSender && toggleSender(sender)}
                      className={`group hover:bg-slate-50/50 transition-all duration-200 cursor-pointer ${isSelected ? 'bg-purple-50/40' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-5 px-6">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-600 shadow-sm shadow-purple-600/20' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                        </div>
                      </td>

                      {/* Account Info */}
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">
                            {sender.displayName || sender.email.split('@')[0]}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {sender.email}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100/50 w-fit">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                            {sender.isVerified ? 'Active' : 'Error'}
                          </span>
                        </div>
                      </td>

                      {/* Daily Limit Usage */}
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-slate-600 tabular-nums">
                              {currentUsage}/{usageLimit}
                            </span>
                            <span className="text-xs font-medium text-slate-500 tabular-nums">
                              {usagePercent}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                            <div
                              className="h-full bg-purple-600 rounded-full transition-all duration-1000"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Warmup Status */}
                      <td className="py-5 px-6">
                        {warmupEnabled ? (
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            <span className="text-xs font-semibold text-slate-600">
                              {sender.stats?.warmupStatus === 'completed' ? 'Active' : 'Warming'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-300">NA</span>
                        )}
                      </td>

                      {/* Min. Time Gap */}
                      <td className="py-5 px-6">
                        <span className="text-xs font-semibold text-slate-600">
                          {sender.minTimeGap || 1}m
                        </span>
                      </td>

                      {/* Shared Status */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex items-center justify-center">
                            <Plus className="w-1.5 h-1.5 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-slate-600">
                            {sender.campaignCount || 0}
                          </span>
                        </div>
                      </td>

                      {/* Associated Leads */}
                      <td className="py-5 px-6 text-center">
                        <span className="text-xs font-semibold text-slate-600">
                          {sender.leadCount || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 text-right pr-8">
                        <div className="flex items-center justify-end gap-3">
                          {onSendTest && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               onSendTest(sender);
                             }}
                             className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-all shadow-sm group/test"
                           >
                              <Activity className="w-3.5 h-3.5" />
                              {mode === 'test' ? 'Send Test' : 'Test'}
                           </button>
                          )}
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/mailboxes/${sender.id}`);
                            }}
                            className="flex items-center gap-1.5 p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all rounded-lg group/view"
                            title="View Mailbox"
                          >
                            <ExternalLink className="w-4 h-4 group-hover/view:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Add New Row */}
                <tr>
                  <td colSpan={9} className="py-10 px-6 text-center">
                    <button className="inline-flex items-center gap-3 px-8 py-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50/30 transition-all group">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all duration-300">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-500 group-hover:text-purple-600 transition-all">
                        {t('campaigns.add_new_sender', 'Add New Account')}
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-slate-100 bg-white">
            <Button
              onClick={onClose}
              className="w-full py-3.5 bg-purple-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-purple-700 hover:shadow-md transition-all"
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
