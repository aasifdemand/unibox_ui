import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Play, Pause, Download, Loader2, Rocket } from 'lucide-react';

const CampaignHeader = ({ campaign, previews, actions, setShowDeleteModal, getStatusBadge }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-6">
        <Link
          to="/dashboard/campaigns"
          className="group relative w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:border-orange-500 hover:shadow-sm hover:shadow-orange-500/10 transition-all duration-300 active:scale-95"
          title="Back to Campaigns"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-orange-600 transition-colors" />
        </Link>
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              {previews.campaignName}
            </h1>
            <div className="scale-110 origin-left">{getStatusBadge(campaign.status)}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Subject:
            </span>
            <p className="text-sm font-bold text-slate-500 tracking-tight">{previews.subject}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Action buttons based on status */}
        {campaign.status === 'draft' && (
          <button
            onClick={actions.handleActivate}
            disabled={actions.activate.isPending}
            className="btn-primary py-3 px-8 flex items-center gap-3 shadow-sm shadow-orange-500/20 active:scale-95 transition-all text-white font-black uppercase tracking-widest text-[11px]"
          >
            {actions?.activate?.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            Start Campaign
          </button>
        )}

        {campaign.status === 'running' && (
          <button
            onClick={actions.handlePause}
            disabled={actions.pause.isPending}
            className="py-3 px-8 flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[11px] rounded-lg shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
          >
            {actions.pause.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            Pause
          </button>
        )}

        {campaign.status === 'paused' && (
          <button
            onClick={actions.handleResume}
            // disabled={actions?.resume?.isPending}
            className="btn-primary py-3 px-8 flex items-center gap-3 shadow-sm shadow-orange-500/20 active:scale-95 transition-all text-white font-black uppercase tracking-widest text-[11px]"
          >
            {actions?.resume?.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Resume
          </button>
        )}

        {(campaign.status === 'draft' || campaign.status === 'paused') && (
          <Link
            to={`/dashboard/campaigns/${campaign.id}/edit`}
            className="h-12 px-6 flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50/30 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        )}

        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={actions.delete.isPending}
          className="h-12 px-6 flex items-center gap-2 bg-white border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50/30 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all"
        >
          {actions.delete.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Delete
        </button>

        <button
          onClick={() => {
            const csvContent =
              'data:text/csv;charset=utf-8,' +
              'Campaign Name,Status,Total Recipients,Sent,Opened,Clicked,Replied,Bounced,Unsubscribed\n' +
              `"${previews.campaignName}",${campaign.status},${stats.totalRecipients},${stats.totalSent},${stats.totalOpened},${stats.totalClicked},${stats.totalReplied},${stats.totalBounced || 0},${stats.totalUnsubscribed || 0}`;
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `campaign_stats_${campaign.id}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          title="Export Stats to CSV"
          className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-lg transition-all shadow-sm"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CampaignHeader;
