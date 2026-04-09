import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { motion } from 'motion/react';
import Modal from '../components/shared/modal';
import Button from '../components/ui/button';

const CampaignSettingsModal = ({
  isOpen,
  onClose,
  watch,
  setValue,
}) => {
  const { t } = useTranslation();

  const trackingOptions = [
    { id: 'trackOpens', label: t('campaigns.open_tracking', 'Open Tracking'), desc: t('campaigns.open_tracking_desc', 'Track unique email opens') },
    { id: 'trackClicks', label: t('campaigns.click_tracking', 'Click Tracking'), desc: t('campaigns.click_tracking_desc', 'Monitor link clicks engagement') },
    { id: 'unsubscribeLink', label: t('campaigns.unsubscribe_footer', 'Unsubscribe Footer'), desc: t('campaigns.unsubscribe_footer_desc', 'Mandatory for high deliverability') },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl" showCloseButton={true}>
      <div className="overflow-hidden">
        {/* Premium Header */}
        <div className="bg-linear-to-br from-purple-600 to-purple-700 p-8 relative overflow-hidden group">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            className="absolute top-0 right-0 p-8 group-hover:scale-110 transition-transform"
          >
            <Settings className="w-24 h-24 text-white" />
          </motion.div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm"
              >
                <Settings className="w-7 h-7 text-white" />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-white tracking-tight leading-none">
                  {t('campaigns.campaign_settings_title', 'Campaign Settings')}
                </h2>
                <p className="text-xs font-semibold text-white/70 mt-1">
                  {t('campaigns.campaign_settings_subtitle', 'Configure global delivery rules')}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10 relative z-10 bg-white">
          <div className="space-y-8">
            <div className="space-y-5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Check className="w-4 h-4" /> {t('campaigns.tracking_options', 'Tracking Options')}
              </h3>

              {trackingOptions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-purple-100 transition-all group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-purple-900 transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                  <div
                    onClick={() => setValue(item.id, !watch(item.id))}
                    className={`w-12 h-7 rounded-full relative cursor-pointer transition-all duration-300 shadow-inner ${watch(item.id) ? 'bg-purple-600' : 'bg-slate-200'}`}
                  >
                    <div
                      className={`absolute top-[4.5px] w-4.5 h-4.5 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${watch(item.id) ? 'left-[24px]' : 'left-[5px]'}`}
                    >
                      {watch(item.id) && <div className="w-1 h-1 bg-purple-600 rounded-full" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-5 pt-8 border-t border-slate-50">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {t('campaigns.smart_delivery', 'Smart Delivery')}
              </h3>
              <div className="flex items-center gap-5 p-6 bg-purple-50/50 rounded-lg border border-purple-100 group">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs text-purple-700 font-bold leading-relaxed flex-1">
                  {t('campaigns.ai_optimization_desc', 'AI Optimization is active. We automatically space out emails and use warmed pools for peak inbox rates.')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button
              onClick={onClose}
              className="w-full py-4 bg-purple-600 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest shadow-sm shadow-purple-600/20 hover:bg-purple-700 transition-all hover:-translate-y-0.5"
            >
              {t('campaigns.apply_optimization', 'Apply Optimization')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CampaignSettingsModal;
