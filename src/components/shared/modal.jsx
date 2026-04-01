import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  maxWidth = 'max-w-6xl', 
  closeOnBackdrop = true,
  showCloseButton = true 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.4,
              ease: [0.23, 1, 0.32, 1],
            }}
            className={`relative w-full ${maxWidth} max-h-[95vh] flex flex-col shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden bg-white`}
          >
            {/* Close button - Consistently Premium */}
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-200 transition-all active:scale-90 group z-50 hover:shadow-lg hover:shadow-slate-200/50"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Modal;
