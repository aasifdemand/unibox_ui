import React from "react";
import TemplateCard from "./template-card";
import QuickActions from "./quick-actions";
import Stats from "./stats";

const TemplateGrid = ({
  templates,
  filteredTemplates,
  onEdit,
  onDelete,
  onCreateNew,
  isPending,
  deleteMutation,
  formatDate,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Templates List */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              All Templates
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-blue-100">
                {filteredTemplates.length}
              </span>
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={onEdit}
              onDelete={onDelete}
              isPending={isPending}
              isDeletePending={
                deleteMutation.isPending &&
                deleteMutation.variables === template.id
              }
              formatDate={formatDate}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions & Stats */}
      <div className="lg:col-span-4 space-y-10">
        <QuickActions onCreateNew={onCreateNew} isPending={isPending} />
        <Stats templates={templates} />
      </div>
    </div>
  );
};

export default TemplateGrid;
