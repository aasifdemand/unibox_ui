import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Modal from '../../../../../components/shared/modal';
import { Edit2, Loader2 } from 'lucide-react';
import { useUpdateCampaign } from '../../../../../hooks/useCampaign';

const EditCampaignModal = ({ isOpen, onClose, campaign }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(campaign?.name || '');
  const [subject, setSubject] = useState(campaign?.subject || '');
  const [trackOpens, setTrackOpens] = useState(campaign?.trackOpens !== undefined ? campaign.trackOpens : true);
  const [trackClicks, setTrackClicks] = useState(campaign?.trackClicks !== undefined ? campaign.trackClicks : true);
  const [unsubscribeLink, setUnsubscribeLink] = useState(campaign?.unsubscribeLink !== undefined ? campaign.unsubscribeLink : true);
  const updateCampaignMutation = useUpdateCampaign();



  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !subject) return;

    updateCampaignMutation.mutate(
      { 
        campaignId: campaign.id, 
        name, 
        subject,
        trackOpens,
        trackClicks,
        unsubscribeLink
      },
      {
        onSuccess: () => {
          toast.success('Campaign updated successfully');
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update campaign');
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" closeOnBackdrop={true}>
      <form onSubmit={handleSubmit}>
        <div className="bg-orange-600 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Edit2 className="w-16 h-16 text-white" />
          </div>
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center border border-white/30 ">
              <Edit2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Edit Campaign</h3>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t('campaigns.edit.name', 'Campaign Name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-md border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t('campaigns.edit.subject', 'Subject')}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-12 px-4 rounded-md border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              required
            />
          </div>

          <div className="pt-4 space-y-4 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {t('campaigns.edit.tracking_title', 'Tracking & Compliance')}
            </h4>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-xs font-bold text-slate-600">{t('campaigns.edit.track_opens', 'Open Tracking')}</span>
              <button
                type="button"
                onClick={() => setTrackOpens(!trackOpens)}
                className={`w-10 h-5 rounded-full relative transition-colors ${trackOpens ? 'bg-orange-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${trackOpens ? 'left-[22px]' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-xs font-bold text-slate-600">{t('campaigns.edit.track_clicks', 'Click Tracking')}</span>
              <button
                type="button"
                onClick={() => setTrackClicks(!trackClicks)}
                className={`w-10 h-5 rounded-full relative transition-colors ${trackClicks ? 'bg-orange-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${trackClicks ? 'left-[22px]' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-xs font-bold text-slate-600">{t('campaigns.edit.unsub_link', 'Unsubscribe Footer')}</span>
              <button
                type="button"
                onClick={() => setUnsubscribeLink(!unsubscribeLink)}
                className={`w-10 h-5 rounded-full relative transition-colors ${unsubscribeLink ? 'bg-orange-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${unsubscribeLink ? 'left-[22px]' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white border-2 border-slate-100 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateCampaignMutation.isPending}
              className="px-8 py-3 bg-orange-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm shadow-orange-600/20 hover:shadow-orange-600/40 transition-all flex items-center gap-2"
            >
              {updateCampaignMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit2 className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditCampaignModal;
