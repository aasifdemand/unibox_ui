import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send } from 'lucide-react';
import Modal from '../components/shared/modal';
import Input from '../components/ui/input';

const QuickCreateCampaignModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Navigate to the full creation page with the name in state
    navigate('/dashboard/campaigns/create', { 
      state: { campaignName: name.trim() } 
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      {/* BRANDED ORANGE HEADER - COMPACT PREMIUM */}
      <div className="bg-linear-to-br from-purple-600 to-purple-700 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
          <Send className="w-20 h-20 text-white" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight leading-none">
              {t('dashboard.quick_actions.create_campaign', 'Create a Campaign')}
            </h3>
            <p className="text-[10px] font-semibold text-purple-100/60 mt-1.5">
              Campaign Configuration
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleContinue} className="space-y-6">
          <div className="space-y-2">
            <div className="px-1">
              <label className="text-xs font-bold text-slate-400">
                {t('campaigns.column_name_label', 'Campaign Name')}
              </label>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                Set up the basic information for your campaign
              </p>
            </div>
            
            <div className="relative group">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Give your campaign a name"
                className="h-12 rounded-xl border-slate-200 bg-white text-sm font-extrabold focus:border-purple-500"
                autoFocus
              />
            </div>
            
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all active:scale-95"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 h-11 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-500/10 hover:bg-purple-500 hover:-translate-y-px transition-all active:scale-95 disabled:opacity-50"
            >
              {t('common.continue', 'Continue')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default QuickCreateCampaignModal;
