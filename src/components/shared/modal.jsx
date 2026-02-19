import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-6xl",
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-all duration-500 animate-in fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full ${maxWidth} max-h-[95vh] flex flex-col shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] transition-all duration-300 transform animate-in zoom-in-95 fade-in slide-in-from-bottom-8 rounded-[2.5rem] overflow-hidden bg-white`}
      >
        {/* Close button - more premium style */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition-all z-50 group border border-white/10 hover:scale-110 active:scale-95"
          >
            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
