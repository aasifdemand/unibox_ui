import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="premium-card bg-rose-50 border-rose-100 p-8 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 flex items-center justify-center border border-rose-200 shadow-xl shadow-rose-500/10">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-rose-800 tracking-tight mb-2">
              Failed to Load Templates
            </h3>
            <p className="text-sm font-bold text-rose-700 max-w-md leading-relaxed">
              {error?.message ||
                'Something went wrong while loading your templates. Please try again.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRetry}
            className="btn-primary bg-rose-600 hover:bg-rose-700 py-3 px-8 text-white font-extrabold uppercase tracking-widest text-[10px] shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
