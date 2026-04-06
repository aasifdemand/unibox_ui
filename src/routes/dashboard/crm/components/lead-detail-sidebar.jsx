import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  DollarSign,
  StickyNote,
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
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const updateLead = useUpdateLead();

  useEffect(() => {
    if (lead) {
      setValue(lead.value != null ? String(lead.value) : '');
      setNotes(lead.metadata?.notes || '');
    }
  }, [lead]);

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

  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20  z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-sm shadow-slate-900/20 z-50 flex flex-col border-l border-slate-200 overflow-hidden outline-none focus:outline-none focus:ring-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white text-sm font-black">
                  {contact?.name
                    ? contact.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')
                    : '?'}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm leading-none">
                    {contact?.name || 'Unknown'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {contact?.normalizedEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all outline-none focus:outline-none focus:ring-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Identity info */}
              <div className="space-y-2">
                {meta.job_title && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{meta.job_title}</span>
                  </div>
                )}
                {meta.company && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{meta.company}</span>
                  </div>
                )}
                {meta.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{meta.phone}</span>
                  </div>
                )}
                {meta.linkedin && (
                  <a
                    href={meta.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-700 font-medium"
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    LinkedIn Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Activity */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-md">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Last activity:
                </span>
                <span className="text-[11px] font-bold text-slate-700">
                  {formatDate(lead.lastActivity)}
                </span>
              </div>

              {/* Deal Value */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3" /> Deal Value
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-md text-sm font-bold text-slate-700 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/5 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <StickyNote className="w-3 h-3" /> Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Add notes about this lead..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/5 outline-none transition-all resize-none"
                />
              </div>

              {/* Enrichment metadata */}
              {meta._enrichedAt && (
                <div className="px-3 py-3 bg-purple-50 rounded-md border border-purple-100">
                  <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">
                    ✨ Enriched
                  </p>
                  <p className="text-[11px] text-purple-400 font-medium">
                    via{' '}
                    {Array.isArray(meta._enrichedBy)
                      ? meta._enrichedBy.join(', ')
                      : meta._enrichedBy}{' '}
                    on {formatDate(meta._enrichedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Save */}
            <div className="px-6 py-5 border-t border-slate-100">
              <button
                onClick={handleSave}
                disabled={updateLead.isPending}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm shadow-purple-500/20 disabled:opacity-60"
              >
                {updateLead.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LeadDetailSidebar;
