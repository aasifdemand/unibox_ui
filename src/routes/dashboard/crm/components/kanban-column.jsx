import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Target, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import SortableLeadCard from './sortable-lead-card';

const KanbanColumn = ({ stage, onDeleteStage, onOpenLead, categories }) => {
  const leadIds = stage.leads.map((l) => l.id);
  const { t } = useTranslation()

  return (
    <div tabIndex={-1} className="w-[300px] shrink-0 flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden outline-none focus:outline-none focus:ring-0">
      {/* Stage Header */}
      <div
        className="p-4 flex items-center justify-between bg-slate-50 border-b border-slate-200"
        style={{ borderTop: `3px solid ${stage.color || '#e11d48'}` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full shadow-sm"
            style={{ backgroundColor: stage.color || '#e11d48' }}
          />
          <h3 className="text-[11px] font-black text-slate-800 tracking-widest uppercase">
            {t(`crm.stages.${stage.name.toLowerCase().replace(/ /g, '_')}`, stage.name)}
          </h3>
          <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm">
            {stage.leads.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {stage.replyCategory && (
            <div className="group relative">
              <Target className="w-3.5 h-3.5 text-slate-400 hover:text-purple-500 cursor-help transition-colors" />
              <div className="absolute top-full right-0 mt-2 p-2 bg-white text-slate-900 rounded-lg text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-100 whitespace-nowrap z-50">
                {categories.find((c) => c.id === stage.replyCategory)?.name || stage.replyCategory}
              </div>
            </div>
          )}
          <button
            onClick={() => onDeleteStage(stage)}
            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Sub-header */}
      <div className="px-4 py-2.5 flex items-center justify-between text-[10px] font-black text-slate-400 tracking-widest bg-white border-b border-slate-50">
        <div className="flex gap-1.5">
          <span className="text-slate-700">{stage.leads.length} Leads</span>
          <span>•</span>
          <span className="text-purple-600">
            ${(stage.leads?.reduce((a, l) => a + (Number(l.value) || 0), 0) || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Lead Cards — sortable drop zone */}
      <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50/30 custom-scrollbar min-h-[80px]">
          <AnimatePresence mode="popLayout">
            {stage.leads.map((lead) => (
              <SortableLeadCard key={lead.id} lead={lead} onOpen={onOpenLead} />
            ))}
          </AnimatePresence>

          {stage.leads.length === 0 && (
            <div className="h-28 border-2 border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center gap-2 bg-white/50">
              <Target className="w-6 h-6 text-slate-200" />
              <p className="text-[10px] font-black text-slate-300 tracking-widest">
                Drop leads here
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};


export default KanbanColumn