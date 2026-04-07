import React from 'react';
import { SkeletonLoader } from '../../../../components/ui/loading-spinner';

const AnalyticsLoader = () => {
  return (
    <div className="p-8 space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 animate-pulse rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-lg" />
        </div>
      </div>
      <SkeletonLoader type="card" count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px] bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
        <div className="h-[400px] bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
      </div>
    </div>
  );
};

export default AnalyticsLoader;
