import React from 'react'

const Loader = () => {
  return (
     <div className="p-8 space-y-8 h-[calc(100vh-140px)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-4 w-96 bg-slate-100 animate-pulse rounded-lg" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-48 bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-11 w-32 bg-slate-100 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="h-full border border-slate-200 rounded-lg bg-white p-6 overflow-hidden">
          <div className="flex gap-5 h-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[300px] shrink-0 flex flex-col h-full border border-slate-100 rounded-lg overflow-hidden">
                <div className="h-14 bg-slate-50 border-b border-slate-100 p-4 shrink-0" />
                <div className="p-4 space-y-4 flex-1 bg-slate-50/20">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-24 bg-white border border-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  )
}

export default Loader