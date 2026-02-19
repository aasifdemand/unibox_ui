import React from "react";

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-100 p-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full"></div>
      </div>
      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-[0.2em] mt-8">
        Loading Templates
      </h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
        Please wait while we fetch your templates
      </p>
    </div>
  );
};

export default LoadingState;
