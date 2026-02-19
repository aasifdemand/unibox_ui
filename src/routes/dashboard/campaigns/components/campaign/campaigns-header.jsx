import React from "react";
import { Plus, RefreshCcw, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const CampaignsHeader = () => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Rocket className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tighter">
                        Campaigns
                    </h1>
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Manage and track your email campaigns
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => window.location.reload()}
                    className="p-3 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
                    title="Refresh"
                >
                    <RefreshCcw className="w-4 h-4" />
                </button>
                <Link
                    to={"/dashboard/campaigns/create"}
                    className="btn-primary py-3 px-8 flex items-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-white font-extrabold uppercase tracking-widest text-[11px]"
                >
                    <Plus className="w-4 h-4 text-white" />
                    Create Campaign
                </Link>
            </div>
        </div>
    );
};

export default CampaignsHeader;
