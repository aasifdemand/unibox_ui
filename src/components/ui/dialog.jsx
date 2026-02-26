import React from 'react';

import { AlertCircle, Shield, CheckCircle, Info } from 'lucide-react';
import Modal from '../shared/modal';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

const Dialog = ({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
  setOpen,
}) => {
  const { t } = useTranslation();

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-6 h-6 text-rose-500" />,
          bg: 'bg-rose-50',
          border: 'border-rose-100',
          button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
          gradient: 'from-rose-600 to-red-600',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-6 h-6 text-amber-500" />,
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
          gradient: 'from-amber-600 to-orange-600',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
          gradient: 'from-emerald-600 to-green-600',
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6 text-blue-500" />,
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
          gradient: 'from-blue-600 to-indigo-600',
        };
      default:
        return {
          icon: <AlertCircle className="w-6 h-6 text-rose-500" />,
          bg: 'bg-rose-50',
          border: 'border-rose-100',
          button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
          gradient: 'from-rose-600 to-red-600',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="max-w-md" closeOnBackdrop={true}>
      <div className="bg-inherit rounded-3xl overflow-hidden shadow-2xl">
        {/* Premium Header - Dynamic based on variant */}
        <div className={`bg-linear-to-r ${styles.gradient} p-8 relative overflow-hidden group`}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            className="absolute top-0 ltr:right-0 rtl:left-0 p-8 group-hover:scale-110 transition-transform"
          >
            <Shield className="w-20 h-20 text-white" />
          </motion.div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-sm"
              >
                {styles.icon}
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  {t('dialog.confirmation')}
                </h3>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-0.5">
                  {confirmVariant === 'danger' && t('dialog.danger_desc')}
                  {confirmVariant === 'warning' && t('dialog.warning_desc')}
                  {confirmVariant === 'success' && t('dialog.success_desc')}
                  {confirmVariant === 'info' && t('dialog.info_desc')}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Icon and Title Section */}
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
              className={`w-12 h-12 rounded-2xl ${styles.bg} flex items-center justify-center shrink-0 border ${styles.border}`}
            >
              {styles.icon}
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">
                {title}
              </h4>
              {description && (
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              )}
            </motion.div>
          </div>

          {/* Warning Message for Danger variant */}
          {confirmVariant === 'danger' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 mb-6"
            >
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-rose-700 leading-relaxed">
                  {t('dialog.permanent_warning')}
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-end gap-3 mt-4"
          >
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 ${styles.button}`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('dialog.processing')}
                </>
              ) : (
                confirmText
              )}
            </button>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 pt-4 border-t border-slate-100"
          >
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
              {confirmVariant === 'danger' && t('dialog.danger_footer')}
              {confirmVariant === 'warning' && t('dialog.warning_footer')}
              {confirmVariant === 'success' && t('dialog.success_footer')}
              {confirmVariant === 'info' && t('dialog.info_footer')}
            </p>
          </motion.div>
        </div>
      </div>
    </Modal>
  );
};

export default Dialog;
