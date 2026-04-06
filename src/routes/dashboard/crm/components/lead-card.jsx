import { Mail, Clock, ExternalLink, MessageSquare, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

const LeadCard = ({ lead, onClick }) => {
  const { contact, value, lastActivity } = lead;

  const initials = contact?.name
    ? contact.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : contact?.normalizedEmail?.slice(0, 2).toUpperCase() || '??';

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={onClick}
      className="bg-white rounded-lg border border-slate-200/60 p-5 shadow-sm hover:shadow-sm hover:shadow-purple-500/5 hover:border-purple-100 transition-all cursor-pointer group overflow-hidden relative focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-500 transition-all duration-300">
            {initials}
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none truncate max-w-[140px]">
              {contact?.name || contact?.normalizedEmail?.split('@')[0]}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider truncate max-w-[100px] mt-1">
              {contact?.metadata?.company || 'Personal'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button className="text-slate-300 hover:text-slate-600 transition-colors p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {lead.metadata?.lastIntent && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 border border-purple-100/50 rounded-full shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
              <span className="text-[9px] font-black text-purple-600 tracking-tighter">
                {lead.metadata.lastIntent.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3 relative z-10">
        <div className="flex items-center gap-2 text-slate-500">
          <Mail className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-400 transition-colors" />
          <span className="text-[11px] font-medium truncate">{contact?.normalizedEmail}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 tracking-widest">
              {formatDate(lastActivity)}
            </span>
          </div>
          <div
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${value > 0 ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
          >
            ${Number(value).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400 group-hover:text-purple-600 transition-colors relative z-10">
        <div className="flex items-center gap-3">
          <Mail className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
          <MessageSquare className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
        </div>
        <button className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.15em] hover:underline decoration-2 underline-offset-4">
          View Profile <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default LeadCard;
