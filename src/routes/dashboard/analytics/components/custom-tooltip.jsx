import React from "react";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50 ring-1 ring-slate-900/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
                    {label}
                </p>
                <div className="space-y-2">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full shadow-sm"
                                    style={{ backgroundColor: entry.color || entry.fill }}
                                />
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                                    {entry.name}
                                </span>
                            </div>
                            <span className="text-xs font-black text-slate-900 tabular-nums">
                                {entry.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                {payload.length > 1 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                        <span className="text-[10px] font-black text-blue-600">
                            {Math.round((payload[1].value / payload[0].value) * 100 || 0)}%
                        </span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export default CustomTooltip;
