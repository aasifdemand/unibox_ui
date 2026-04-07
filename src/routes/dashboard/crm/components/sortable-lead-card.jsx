import React from 'react'
import LeadCard from './lead-card';
import { useSortable } from '@dnd-kit/sortable';

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
        onClick={() => {
          if (!isDragging) onOpen(lead);
        }}
      />
    </div>
  );
};


export default SortableLeadCard