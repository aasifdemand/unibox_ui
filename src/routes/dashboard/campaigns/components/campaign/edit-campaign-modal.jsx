import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Modal from '../../../../../components/shared/modal';
import { Edit2, Loader2 } from 'lucide-react';
import { useUpdateCampaign } from '../../../../../hooks/useCampaign';

const EditCampaignModal = ({ isOpen, onClose, campaign }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const updateCampaignMutation = useUpdateCampaign();

  useEffect(() => {
    if (campaign && isOpen) {
      setName(campaign.name || '');
      setSubject(campaign.subject || '');
    }
  }, [campaign, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !subject) return;

    updateCampaignMutation.mutate(
      { campaignId: campaign.id, name, subject },
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
              Campaign Name
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
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-12 px-4 rounded-md border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              required
            />
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
