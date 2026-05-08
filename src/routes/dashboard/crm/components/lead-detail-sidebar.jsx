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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              mass: 1
            }}
            className="relative w-full max-w-[420px] bg-white shadow-2xl h-full flex flex-col border-l border-slate-200 z-10 overflow-hidden outline-none"
          >
            {/* Header */}
            <div className="bg-linear-to-br from-purple-600 to-purple-700 p-6 relative overflow-hidden group shrink-0">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Briefcase className="w-20 h-20 text-white" />
              </div>
              <div className="relative flex items-center gap-4 pr-12">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 text-white text-lg font-black shadow-inner">
                  {contact?.name
                    ? contact.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')
                    : '?'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none truncate">
                    {contact?.name || 'Unknown Lead'}
                  </h3>
                  <p className="text-[9px] font-bold text-purple-100/60 uppercase tracking-widest mt-2 truncate">
                    {contact?.normalizedEmail}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/10 transition-all active:scale-90 z-20 group/btn"
              >
                <X className="w-4 h-4 text-white/80 group-hover/btn:text-white" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Identity info */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                  Lead Information
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {(meta.job_title || meta.company) && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                        <Building2 className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Organization</p>
                        <p className="text-xs font-bold text-slate-700 truncate">
                          {meta.job_title ? `${meta.job_title} @ ` : ''}{meta.company || 'Unknown Co.'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {meta.phone && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                        <Phone className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Contact</p>
                        <p className="text-xs font-bold text-slate-700">{meta.phone}</p>
                      </div>
                    </div>
                  )}

                  {meta.linkedin && (
                    <a
                      href={meta.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-purple-50 border border-purple-100 rounded-lg group hover:bg-purple-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-white border border-purple-100 flex items-center justify-center shadow-xs">
                          <Globe className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <span className="text-xs font-bold text-purple-700">LinkedIn Profile</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-600 transition-colors" />
                    </a>
                  )}
                </div>
              </div>

              {/* Engagement Timeline */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                  Engagement
                </label>
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                    <Clock className="w-16 h-16 text-purple-600" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">Last Interaction</p>
                    <p className="text-base font-black text-purple-600 tracking-tight">
                      {formatDate(lead.lastActivity)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deal Value Input */}
              <div className="space-y-3">
                <div className="px-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Deal Value
                  </label>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                    Estimated monetary value of this lead.
                  </p>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-purple-500">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 pl-8 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:border-purple-500/50 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* Notes Area */}
              <div className="space-y-3">
                <div className="px-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Strategic Notes
                  </label>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                  placeholder="Capture key insights about this lead..."
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:border-purple-500/50 focus:bg-white transition-all outline-none resize-none min-h-[160px]"
                />
              </div>

              {/* Enrichment metadata */}
              {meta._enrichedAt && (
                <div className="p-4 bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-lg relative overflow-hidden">
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-500/5 rounded-full blur-xl"></div>
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-8 h-8 bg-white border border-purple-100 rounded-md flex items-center justify-center text-purple-600 shrink-0 shadow-xs">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-purple-900 uppercase tracking-tight">AI Data Enrichment</p>
                      <p className="text-[9px] text-purple-600/70 font-bold leading-relaxed mt-0.5">
                        Sourced via {Array.isArray(meta._enrichedBy) ? meta._enrichedBy.join(', ') : meta._enrichedBy} on {formatDate(meta._enrichedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
                <button
                  onClick={handleSave}
                  disabled={updateLead.isPending}
                  className="w-full h-11 bg-purple-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/10 hover:bg-purple-500 hover:-translate-y-px transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {updateLead.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
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
