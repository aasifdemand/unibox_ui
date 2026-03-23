import { AlertTriangle, Loader2, Unplug, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import Modal from '../components/shared/modal';

const DisconnectIntegration = ({
  integration,
  isOpen,
  setIsOpen,
  handleDisconnect,
  isDisconnecting,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      maxWidth="max-w-md"
      closeOnBackdrop={true}
    >
      <div className="bg-gradient-to-br from-orange-600 to-red-700 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
          <Unplug className="w-16 h-16 text-white" />
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center border border-white/30 "
            >
              <Unplug className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tighter">
                Disconnect {integration?.name}
              </h3>
              <p className="text-[10px] font-bold text-orange-100/70 uppercase tracking-widest mt-0.5">
                Remove Integration
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight mb-2">
              Confirm Disconnection
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to disconnect <strong>{integration?.name}</strong>? Unibox will
              no longer be able to sync leads or data with this service.
            </p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 mb-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
              Existing mapped fields and historical sync data may remain in the system, but future
              automations will instantly stop.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 bg-white border-2 border-slate-100 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="group relative px-8 py-3 bg-orange-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm shadow-orange-600/20 hover:shadow-orange-600/40 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 overflow-hidden"
          >
            <motion.div layout className="flex items-center gap-3">
              {isDisconnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Unplug className="w-4 h-4" />
                  Disconnect App
                </>
              )}
            </motion.div>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DisconnectIntegration;
