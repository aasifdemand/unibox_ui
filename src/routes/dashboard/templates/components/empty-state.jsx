import React from 'react';
import { FileText, Sparkles, Plus } from 'lucide-react';

const EmptyState = ({ onCreateNew, isPending }) => {
  return (
    <div className="premium-card bg-white border-none p-20 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl shadow-blue-500/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-75 bg-blue-500/5 rounded-full blur-[100px] -mt-40"></div>

      <div className="relative mb-10">
        <div className="w-24 h-24 bg-linear-to-br from-blue-600 to-indigo-700 rounded-4xl flex items-center justify-center rotate-3 group hover:rotate-6 transition-transform duration-500 shadow-2xl shadow-indigo-500/20">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      <h3 className="text-3xl font-extrabold text-slate-800 tracking-tighter mb-4">
        No Templates Yet
      </h3>
      <p className="text-sm font-medium text-slate-400 max-w-sm mb-10 leading-relaxed text-balance">
        You haven&apos;t created any templates yet. Get started by creating your first email
        template.
      </p>

      <button
        onClick={onCreateNew}
        disabled={isPending}
        className="btn-primary py-4 px-10 flex items-center gap-4 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all text-white font-extrabold uppercase tracking-widest text-xs disabled:opacity-50"
      >
        <Plus className="w-5 h-5 text-white" />
        Create First Template
      </button>
    </div>
  );
};

export default EmptyState;
