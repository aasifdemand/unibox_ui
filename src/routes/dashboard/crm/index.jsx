import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  LayoutDashboard,
  RefreshCw,
  Loader2,
  X,
  Palette,
  Globe,
  Zap,
  ChevronDown,
  Target,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Skeleton from '../../../components/ui/skeleton';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import LeadCard from './components/lead-card';
import LeadDetailSidebar from './components/lead-detail-sidebar';
import Dialog from '../../../components/ui/dialog';
import {
  useCrmPipeline,
  useMoveLead,
  useAddCrmStage,
  useReplyCategories,
  useDeleteCrmStage,
} from '../../../hooks/useCrm';
import { toast } from 'react-hot-toast';

// ─── Sortable Lead Card wrapper ───────────────────────────────────────────────
const SortableLeadCard = ({ lead, onOpen }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: 'lead', lead },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
      <LeadCard
        lead={lead}
        onClick={(e) => {
          if (!isDragging) onOpen(lead);
        }}
      />
    </div>
  );
};

// ─── Droppable Column ─────────────────────────────────────────────────────────
const KanbanColumn = ({ stage, onDeleteStage, onOpenLead, categories, activeId }) => {
  const leadIds = stage.leads.map((l) => l.id);
  const { t } = useTranslation()

  return (
    <div tabIndex={-1} className="w-[300px] flex-shrink-0 flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden outline-none focus:outline-none focus:ring-0">
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
          <h3 className="text-[11px] font-black text-slate-800 tracking-[0.1em] uppercase">
            {t(`crm.stages.${stage.name.toLowerCase().replace(/ /g, '_')}`, stage.name)}
          </h3>
          <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm">
            {stage.leads.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {stage.replyCategory && (
            <div className="group relative">
              <Target className="w-3.5 h-3.5 text-slate-400 hover:text-orange-500 cursor-help transition-colors" />
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
          <span className="text-orange-600">
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

// ─── Main CRM Page ────────────────────────────────────────────────────────────
const CRMIntegration = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#e11d48');
  const [newReplyCategory, setNewReplyCategory] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [stageToDelete, setStageToDelete] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activeLead, setActiveLead] = useState(null);

  const { data: pipeline = [], isLoading, refetch, isRefetching } = useCrmPipeline();
  const { data: categories = [] } = useReplyCategories();
  const moveLeadMutation = useMoveLead();
  const addStageMutation = useAddCrmStage();
  const deleteStageMutation = useDeleteCrmStage();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const filteredPipeline = useMemo(
    () =>
      pipeline.map((stage) => ({
        ...stage,
        leads: (stage.leads || []).filter(
          (lead) =>
            lead.contact?.normalizedEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })),
    [pipeline, searchQuery],
  );

  // Build a flat map: leadId → stageId for quick DnD lookup
  const leadStageMap = useMemo(() => {
    const map = {};
    pipeline.forEach((stage) =>
      stage.leads.forEach((lead) => {
        map[lead.id] = stage.id;
      }),
    );
    return map;
  }, [pipeline]);

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    const stageId = leadStageMap[active.id];
    const stage = pipeline.find((s) => s.id === stageId);
    setActiveLead(stage?.leads.find((l) => l.id === active.id) || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    setActiveLead(null);
    if (!over || active.id === over.id) return;

    const fromStageId = leadStageMap[active.id];

    // "over" can be a lead id or a stage id
    let toStageId =
      over.data?.current?.type === 'stage' ? over.id : leadStageMap[over.id] || over.id;

    if (!toStageId || fromStageId === toStageId) return;

    try {
      await moveLeadMutation.mutateAsync({ leadId: active.id, stageId: toStageId });
    } catch (err) {
      toast.error('Failed to move lead: ' + err.message);
    }
  };

  const handleDeleteStage = async () => {
    if (!stageToDelete) return;
    try {
      await deleteStageMutation.mutateAsync(stageToDelete.id);
      toast.success(`"${stageToDelete.name}" deleted — leads reassigned`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setStageToDelete(null);
    }
  };

  const handleAddStage = async (e) => {
    e.preventDefault();
    if (!newStageName.trim()) return toast.error('Please enter a column name');
    try {
      await addStageMutation.mutateAsync({
        name: newStageName,
        color: newStageColor,
        replyCategory: newReplyCategory || null,
      });
      setIsAddStageOpen(false);
      setNewStageName('');
      setNewReplyCategory('');
      toast.success('Column added to your funnel');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[320px] shrink-0 space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-32 w-full rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div tabIndex={-1} className="crm-module w-full mx-auto px-4 md:px-8 pb-8 space-y-8 outline-none focus:outline-none focus:ring-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            {t('crm.title', 'Smart')} {t('crm.subtitle', 'Funnel')} <span className="ml-2">{t('crm.pipeline', 'Pipeline')}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('crm.drag_desc', 'Drag leads between stages. Click any card to view details and set deal value.')}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative group flex items-center bg-white border border-slate-200 rounded-md px-4 h-11 w-full md:w-72 transition-all focus-within:ring-2 focus-within:ring-orange-500/10 focus-within:border-orange-500/40 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-orange-500 shrink-0" />
            <input
              type="text"
              placeholder={t('crm.search_placeholder', 'Search leads...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 h-full bg-transparent text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0 text-slate-700 outline-none"
            />
          </div>
          <button
            onClick={async () => {
              await refetch();
              toast.success('Pipeline updated');
            }}
            disabled={isRefetching}
            className={`w-11 h-11 flex justify-center items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all active:scale-95 shadow-sm outline-none focus:outline-none focus:ring-0 ${isRefetching ? 'opacity-50' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/dashboard/integrations"
            className="h-11 px-5 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-extrabold tracking-widest shadow-sm hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95 outline-none focus:outline-none focus:ring-0"
          >
            <Globe className="w-4 h-4" /> {t('crm.connect_crm', 'Connect CRM')}
          </Link>
          <button
            onClick={() => setIsAddStageOpen(true)}
            className="h-11 px-5 flex items-center justify-center gap-2 bg-orange-600 text-white rounded-md text-[11px] font-extrabold tracking-widest shadow-sm shadow-orange-500/20 hover:bg-orange-700 transition-all active:scale-95 outline-none focus:outline-none focus:ring-0"
          >
            <Plus className="w-4 h-4" /> {t('crm.add_column', 'Add Column')}
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div tabIndex={-1} className="h-[calc(100vh-280px)] flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
        {/* Board sub-header */}
        <div className="h-12 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 tracking-widest bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 outline-none focus:outline-none focus:ring-0">
              <Zap className="w-3.5 h-3.5" /> {t('crm.all_campaigns', 'All Campaigns')}
            </div>
          </div>
          <div className="flex items-center gap-5 text-[10px] font-black tracking-widest text-slate-500">
            <span className="text-slate-400">
              {t('crm.total', 'Total')}{' '}
              <span className="text-slate-700">
                {pipeline.reduce((a, s) => a + (s.leads?.length || 0), 0)}
              </span>
            </span>
            <span className="w-px h-4 bg-slate-200 block" />
            <span className="text-slate-400">
              {t('crm.value', 'Value')}{' '}
              <span className="text-orange-600">
                $
                {(
                  pipeline?.reduce(
                    (a, s) => a + (s.leads?.reduce((sa, l) => sa + (Number(l.value) || 0), 0) || 0),
                    0,
                  ) || 0
                ).toLocaleString()}
              </span>
            </span>
          </div>
        </div>

        {/* DnD board surface */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
            <div className="flex gap-5 h-full min-w-max">
              {filteredPipeline.map((stage) => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  onDeleteStage={setStageToDelete}
                  onOpenLead={setSelectedLead}
                  categories={categories}
                  activeId={activeId}
                />
              ))}

              {/* Empty state */}
              {pipeline.length === 0 && (
                <div className="w-full flex-1 flex flex-col items-center justify-center gap-8 py-20 px-8 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-orange-50 rounded-[40px] flex items-center justify-center shadow-sm shadow-orange-200/20">
                      <LayoutDashboard className="w-10 h-10 text-orange-600" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center animate-bounce">
                      <Plus className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                      {t('crm.build_funnel', 'Build your funnel')}
                    </h3>
                    <p className="text-slate-500 font-bold leading-relaxed text-sm">
                      {t('crm.add_first_col', 'Add your first column to start tracking leads through stages.')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddStageOpen(true)}
                    className="bg-orange-600 text-white px-10 py-5 rounded-[24px] text-xs font-black tracking-widest hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-600/20"
                  >
                    {t('crm.create_initial', 'Create First Column')}
                  </button>
                </div>
              )}

              {/* Add column button */}
              {pipeline.length > 0 && (
                <div
                  onClick={() => setIsAddStageOpen(true)}
                  className="w-[260px] flex-shrink-0 h-full border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-orange-300 transition-all cursor-pointer group bg-slate-50/40"
                >
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-slate-300 group-hover:text-orange-600 shadow-sm transition-all border border-slate-100 group-hover:scale-110">
                    <Plus className="w-8 h-8" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] group-hover:text-orange-600 transition-colors">
                    {t('crm.add_column', 'Add Column')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Drag overlay — ghost card while dragging */}
          <DragOverlay>
            {activeLead ? (
              <div className="rotate-2 scale-105 pointer-events-none shadow-sm shadow-orange-500/20">
                <LeadCard lead={activeLead} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-3 bg-white/60  px-5 py-3 rounded-lg border border-slate-200/60 shadow-sm">
          <div className="w-8 h-8 rounded-md bg-orange-50 flex items-center justify-center shadow-inner">
            <Target className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-[10px] font-black text-slate-500 tracking-widest leading-relaxed max-w-xs">
            {t('crm.footer_msg1', 'Leads automatically progress when')}{' '}
            <span className="text-orange-600">{t('crm.footer_msg2', 'Reply Intents')}</span>{' '}
            {t('crm.footer_msg3', 'are detected')}
          </span>
        </div>
      </div>

      {/* Add Column Modal */}
      <AnimatePresence>
        {isAddStageOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddStageOpen(false)}
              className="absolute inset-0 bg-slate-900/40 "
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[24px] overflow-hidden shadow-[0_24px_48px_-8px_rgba(0,0,0,0.15)] border border-slate-100"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">
                    {t('crm.add_column_modal_title', 'Add New Column')}
                  </h2>
                  <button
                    onClick={() => setIsAddStageOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center transition-all group"
                  >
                    <X className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
                  </button>
                </div>

                <form onSubmit={handleAddStage} className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                      {t('crm.select_color_label', 'Select Column Color')}
                    </label>
                    <p className="text-[11px] font-bold text-slate-400 mb-4 tracking-tight">
                      Name and color help identify this stage in your pipeline.
                    </p>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                      {t('crm.column_name_label', 'Column Name')}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                        placeholder={t('crm.column_name_placeholder', 'e.g., Qualified Leads')}
                        className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-md text-sm font-bold placeholder:text-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
                      />
                      <div className="relative group">
                        <button
                          type="button"
                          className="w-14 h-14 rounded-md border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden"
                          style={{ backgroundColor: newStageColor }}
                        >
                          <Palette
                            className={`w-5 h-5 ${newStageColor === '#ffffff' ? 'text-slate-400' : 'text-white drop-shadow-md'}`}
                          />
                        </button>
                        <div className="absolute top-full right-0 mt-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm hidden group-hover:grid grid-cols-4 gap-2 z-50">
                          {[
                            '#e11d48',
                            '#ef4444',
                            '#10b981',
                            '#f59e0b',
                            '#a855f7',
                            '#e11d48',
                            '#ff4081',
                            '#64748b',
                          ].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setNewStageColor(c)}
                              className="w-6 h-6 rounded-lg shadow-inner ring-2 ring-white"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                      {t('crm.link_intent_label', 'Link to AI Intent (Optional)')}
                    </label>
                    <p className="text-[10px] font-medium text-slate-400 mb-4 tracking-tight">
                      {t('crm.link_intent_desc', 'Leads with this intent will move here automatically')}
                    </p>
                    <div className="relative group/select">
                      <select
                        value={newReplyCategory}
                        onChange={(e) => setNewReplyCategory(e.target.value)}
                        className="w-full h-14 pl-5 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">{t('crm.select_intent_placeholder', 'Select an intent...')}</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsAddStageOpen(false)}
                      className="flex-1 h-14 rounded-2xl text-xs font-black tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      {t('crm.cancel_btn', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={addStageMutation.isPending || !newStageName.trim()}
                      className="flex-2 h-14 px-8 bg-slate-900 text-white rounded-2xl text-xs font-black tracking-widest shadow-sm shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                      {addStageMutation.isPending ? 'Creating...' : t('crm.add_column_btn', 'Add Column')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lead Detail Sidebar */}
      <LeadDetailSidebar lead={selectedLead} onClose={() => setSelectedLead(null)} />

      {/* Delete Stage Dialog */}
      <Dialog
        open={!!stageToDelete}
        setOpen={(v) => !v && setStageToDelete(null)}
        title={`Delete "${stageToDelete?.name}"?`}
        description="All leads in this stage will be moved to the first stage. This cannot be undone."
        confirmText="Delete Stage"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteStageMutation.isPending}
        onConfirm={handleDeleteStage}
        onCancel={() => setStageToDelete(null)}
      />
    </div>
  );
};

export default CRMIntegration;
