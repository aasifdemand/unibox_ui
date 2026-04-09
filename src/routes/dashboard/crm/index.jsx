import  { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  LayoutDashboard,
  Zap,
  Target,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';

import { toast } from 'react-hot-toast';

import LeadCard from './components/lead-card';
import LeadDetailSidebar from './components/lead-detail-sidebar';
import Dialog from '../../../components/ui/dialog';

import {
  useCrmPipeline,
  useMoveLead,
  useReplyCategories,
  useDeleteCrmStage,
} from '../../../hooks/useCrm';
import CreateColumn from '../../../modals/createcolumn';
import KanbanColumn from './components/kanban-column';
import Loader from './components/loader';
import Header from './components/header';


// ─── Droppable Column ─────────────────────────────────────────────────────────

// ─── Main CRM Page ────────────────────────────────────────────────────────────
const CRMIntegration = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [stageToDelete, setStageToDelete] = useState(null);
  const [activeLead, setActiveLead] = useState(null);

  const { data: pipeline = [], isLoading, refetch, isRefetching } = useCrmPipeline();
  const { data: categories = [] } = useReplyCategories();
  const moveLeadMutation = useMoveLead();
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
    const stageId = leadStageMap[active.id];
    const stage = pipeline.find((s) => s.id === stageId);
    setActiveLead(stage?.leads.find((l) => l.id === active.id) || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveLead(null);
    if (!over || active.id === over.id) return;

    const fromStageId = leadStageMap[active.id];
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

  if (isLoading && !pipeline.length) {
    return (
     <Loader/>
    );
  }

  return (
    <div tabIndex={-1} className="crm-module w-full mx-auto p-4 space-y-8 outline-none focus:outline-none focus:ring-0">
      {/* Header */}
     <Header isRefetching={isRefetching} refetch={refetch} searchQuery={searchQuery} setIsAddStageOpen={setIsAddStageOpen} setSearchQuery={setSearchQuery}/>

      {/* Kanban Board */}
      <div tabIndex={-1} className="h-[calc(100vh-280px)] flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0">
        {/* Board sub-header */}
        <div className="h-12 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 outline-none focus:outline-none focus:ring-0">
              <Zap className="w-3.5 h-3.5" /> {t('crm.all_campaigns', 'All Campaigns')}
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs font-semibold text-slate-500">
            <span className="text-slate-400">
              {t('crm.total', 'Total')}{' '}
              <span className="text-slate-700 font-bold">
                {pipeline.reduce((a, s) => a + (s.leads?.length || 0), 0)}
              </span>
            </span>
            <span className="w-px h-4 bg-slate-200 block" />
            <span className="text-slate-400">
              {t('crm.value', 'Value')}{' '}
              <span className="text-purple-600 font-bold">
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
                />
              ))}

              {/* Empty state */}
              {pipeline.length === 0 && (
                <div className="w-full flex-1 flex flex-col items-center justify-center gap-8 py-20 px-8 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-purple-50 rounded-[40px] flex items-center justify-center shadow-sm shadow-purple-200/20">
                      <LayoutDashboard className="w-10 h-10 text-purple-600" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center animate-bounce">
                      <Plus className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-3">
                      {t('crm.build_funnel', 'Build your funnel')}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      {t('crm.add_first_col', 'Add your first column to start tracking leads through stages.')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddStageOpen(true)}
                    className="bg-purple-600 text-white px-10 py-4 rounded-lg text-sm font-bold hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-600/20"
                  >
                    {t('crm.create_initial', 'Create First Column')}
                  </button>
                </div>
              )}

              {/* Add column button */}
              {pipeline.length > 0 && (
                <div
                  onClick={() => setIsAddStageOpen(true)}
                  className="w-[260px] shrink-0 h-full border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-purple-300 transition-all cursor-pointer group bg-slate-50/40"
                >
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-slate-300 group-hover:text-purple-600 shadow-sm transition-all border border-slate-100 group-hover:scale-110">
                    <Plus className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
                    {t('crm.add_column', 'Add Column')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Drag overlay — ghost card while dragging */}
          <DragOverlay>
            {activeLead ? (
              <div className="rotate-2 scale-105 pointer-events-none shadow-sm shadow-purple-500/20">
                <LeadCard lead={activeLead} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-3 bg-white/60 px-5 py-3 rounded-lg border border-slate-200/60 shadow-sm">
          <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shadow-inner">
            <Target className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-xs font-bold text-slate-500 leading-relaxed max-w-xs">
            {t('crm.footer_msg1', 'Leads automatically progress when')}{' '}
            <span className="text-purple-600 font-bold">{t('crm.footer_msg2', 'Reply Intents')}</span>{' '}
            {t('crm.footer_msg3', 'are detected')}
          </span>
        </div>
      </div>

      {/* Add Column Modal */}
      <CreateColumn 
        open={isAddStageOpen} 
        setOpen={setIsAddStageOpen} 
        onCreated={() => refetch()} 
      />

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
