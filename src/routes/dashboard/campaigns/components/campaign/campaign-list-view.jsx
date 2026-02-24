import React from 'react';
import { Link } from 'react-router-dom';
import { Pause, Send, Trash2, TrendingUp, Zap, BarChart3, Target } from 'lucide-react';
import { calculateOpenRate, formatDate, getStatusInfo } from '../../campaign-utils';

const CampaignListView = ({
  campaigns,
  selectedCampaigns,
  handleSelectAll,
  handleSelectCampaign,
  isAnyLoading,
  handleActivateCampaign,
  handlePauseCampaign,
  handleViewCampaign,
  handleDeleteClick,
  isLoadingAction,
}) => {
  if (campaigns.length === 0) {
    return (
      <div className="premium-card bg-white border-none p-20 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl shadow-indigo-900/2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-75 bg-indigo-500/5 rounded-full blur-[100px] -mt-40"></div>
        <div className="relative mb-10">
          <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-700 rounded-[28px] flex items-center justify-center rotate-3 shadow-2xl shadow-indigo-500/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-800 tracking-tighter mb-4">
          Empty Operations Log
        </h3>
        <p className="text-sm font-medium text-slate-400 max-w-sm mb-10 leading-relaxed uppercase tracking-widest text-[10px]">
          Matrix scan complete. No campaign assets found.
        </p>
        <Link
          to={'/dashboard/campaigns/create'}
          className="btn-primary py-3 px-8 text-white font-extrabold uppercase tracking-widest text-[10px]"
        >
          Launch Protocol
        </Link>
      </div>
    );
  }

  return (
    <div className="premium-card border-none bg-white p-2 shadow-2xl shadow-slate-900/2 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="py-6 px-6 bg-slate-50/50 first:rounded-tl-2xl border-b border-slate-100">
                <input
                  type="checkbox"
                  checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  disabled={isAnyLoading}
                />
              </th>
              <th className="py-6 px-6 bg-slate-50/50 border-b border-slate-100 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Campaign
                </span>
              </th>
              <th className="py-6 px-6 bg-slate-50/50 border-b border-slate-100 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Status
                </span>
              </th>
              <th className="py-6 px-6 bg-slate-50/50 border-b border-slate-100 text-left">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Recipients
                </span>
              </th>
              <th className="py-6 px-6 bg-slate-50/50 border-b border-slate-100 text-right">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Open Rate
                </span>
              </th>
              <th className="py-6 px-6 bg-slate-50/50 border-b border-slate-100 text-right">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Date
                </span>
              </th>
              <th className="py-6 px-6 bg-slate-50/50 last:rounded-tr-2xl border-b border-slate-100 text-right">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {campaigns.map((campaign) => {
              const { label, color, icon } = getStatusInfo(campaign.status);
              const openRate = calculateOpenRate(campaign);

              return (
                <tr
                  key={campaign.id}
                  className="group hover:bg-slate-50/50 transition-all duration-300"
                >
                  <td className="py-5 px-6">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={() => handleSelectCampaign(campaign.id)}
                      className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      disabled={isAnyLoading}
                    />
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-800 tracking-tight leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                          {campaign.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 max-w-50">
                          {campaign.subject || 'NO SUBJECT'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 border w-fit ${color.replace('bg-', 'text-').replace('-100', '-600').replace('-50', '-100')}`}
                    >
                      {icon}
                      {label}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Target className="w-3 h-3 text-slate-400" />
                        <span className="text-sm font-extrabold text-slate-800 tabular-nums">
                          {campaign.totalRecipients?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Total Recipients
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-extrabold text-indigo-600 tabular-nums">
                          {openRate}
                        </span>
                        {openRate !== '-' && parseFloat(openRate) > 30 && (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-widest">
                        Efficiency
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                        {formatDate(campaign.createdAt)}
                      </span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
                        CREATED
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleActivateCampaign(campaign.id)}
                          disabled={isLoadingAction.activate}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      {campaign.status === 'running' && (
                        <button
                          onClick={() => handlePauseCampaign(campaign.id)}
                          disabled={isLoadingAction.pause}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleViewCampaign(campaign.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(campaign)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignListView;
