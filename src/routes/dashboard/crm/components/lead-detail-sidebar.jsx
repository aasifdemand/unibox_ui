import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  DollarSign,
  Clock,
  Briefcase,
  Building2,
  Phone,
  Globe,
  Save,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useUpdateLead } from '../../../../hooks/useCrm';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../../../utils/message-parser';

const LeadDetailSidebar = ({ lead, onClose }) => {
  const [prevLeadId, setPrevLeadId] = useState(lead?.id);
  const [value, setValue] = useState(lead?.value != null ? String(lead.value) : '');
  const [notes, setNotes] = useState(lead?.metadata?.notes || '');

  useEffect(() => {
    if (lead) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lead]);

  if (lead?.id !== prevLeadId) {
    setPrevLeadId(lead?.id);
    setValue(lead?.value != null ? String(lead.value) : '');
    setNotes(lead?.metadata?.notes || '');
  }

  const updateLead = useUpdateLead();

  const handleSave = async () => {
    try {
      await updateLead.mutateAsync({ leadId: lead.id, value, notes });
      toast.success('Lead updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const contact = lead?.contact;
  const meta = contact?.metadata || {};

  return ReactDOM.createPortal(
    <AnimatePresence>
      {lead && (
        <div className="fixed inset-0 z-9999 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-0"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.9 }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              mass: 0.8
            }}
            className="relative w-full max-w-[480px] bg-white shadow-2xl h-full flex flex-col border-l border-slate-200 z-10 overflow-hidden outline-none focus:outline-none focus:ring-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-7 border-b border-slate-100 bg-white/80 backdrop-blur-xs sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-base font-black shadow-lg shadow-purple-500/20">
                  {contact?.name
                    ? contact.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')
                    : '?'}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight tracking-tight">
                    {contact?.name || 'Unknown Lead'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {contact?.normalizedEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100 transition-all active:scale-90 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
              {/* Identity info */}
              <div className="grid grid-cols-1 gap-4">
                {meta.job_title && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                    <Briefcase className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="font-bold text-slate-700 text-sm">{meta.job_title}</span>
                  </div>
                )}
                {meta.company && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                    <Building2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="font-bold text-slate-700 text-sm">{meta.company}</span>
                  </div>
                )}
                {meta.phone && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                    <Phone className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="font-bold text-slate-700 text-sm">{meta.phone}</span>
                  </div>
                )}
                {meta.linkedin && (
                  <a
                    href={meta.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100 group hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="font-bold text-purple-700 text-sm">LinkedIn Profile</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                )}
              </div>

              {/* Activity Info Card */}
              <div className="relative p-6 bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Clock className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                    Engagement Timeline
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-xs font-bold">Last Activity:</span>
                    <span className="text-purple-400 text-base font-black tracking-tight">
                      {formatDate(lead.lastActivity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deal Value Input */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  Estimated Deal Value
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg transition-colors group-focus-within:text-purple-600">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-black text-slate-900 focus:border-purple-500 focus:ring-8 focus:ring-purple-500/5 outline-none transition-all placeholder:text-slate-200"
                  />
                </div>
              </div>

              {/* Notes Area */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  Strategic Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  placeholder="Capture key insights about this lead..."
                  className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:border-purple-500 focus:ring-8 focus:ring-purple-500/5 outline-none transition-all resize-none shadow-inner"
                />
              </div>

              {/* Enrichment metadata */}
              {meta._enrichedAt && (
                <div className="p-6 bg-linear-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 relative overflow-hidden">
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center text-white shadow-sm">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs font-black text-purple-900 uppercase tracking-tight">
                        AI Data Enrichment
                      </p>
                    </div>
                    <p className="text-xs text-purple-600/80 font-bold leading-relaxed">
                      Intelligence sourced via{' '}
                      <span className="text-purple-700 underline decoration-2 underline-offset-2">
                        {Array.isArray(meta._enrichedBy)
                          ? meta._enrichedBy.join(', ')
                          : meta._enrichedBy}
                      </span>{' '}
                      on {formatDate(meta._enrichedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="px-8 py-6 border-t border-slate-100 bg-white/80 backdrop-blur-md sticky bottom-0 z-20">
                <button
                  onClick={handleSave}
                  disabled={updateLead.isPending}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.97] flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 disabled:opacity-50 group"
                >
                  {updateLead.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Save Intelligence
                    </>
                  )}
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LeadDetailSidebar;


