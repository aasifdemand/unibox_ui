import React from "react";
import { FileText, Edit3, Trash2, Loader2, ChevronRight } from "lucide-react";

const TemplateCard = ({
  template,
  onEdit,
  onDelete,
  isPending,
  isDeletePending,
  formatDate,
}) => {
  return (
    <div
      onClick={(e) => onEdit(template, e)}
      className={`group relative overflow-hidden premium-card bg-white border-slate-200/60 p-6 hover:shadow-2xl hover:shadow-blue-500/8 transition-all duration-500 cursor-pointer ${isDeletePending ? "opacity-50 pointer-events-none" : ""
        }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500">
            <FileText className="w-6 h-6 text-blue-600 group-hover:text-white transition-all duration-500" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-800 tracking-tight text-base group-hover:text-blue-600 transition-colors">
              {template.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest ${template.status === "active"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : template.status === "draft"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "bg-slate-50 text-slate-500 border border-slate-100"
                  }`}
              >
                {template.status || "Draft"}
              </span>
              {template.isDefault && (
                <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest bg-violet-50 text-violet-600 border border-violet-100">
                  Default
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(template, e);
            }}
            disabled={isPending}
            className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template, e);
            }}
            disabled={isPending}
            className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
          >
            {isDeletePending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="mb-6 h-12">
        <p className="text-sm font-bold text-slate-500 line-clamp-2 leading-relaxed">
          {template.subject || "No subject line defined"}
        </p>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-slate-100/60">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-widest">
              Updated
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {formatDate(template.updatedAt)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-widest">
              Variables
            </span>
            <span className="text-[10px] font-bold text-slate-800">
              {template.variables?.length || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center text-[10px] font-extrabold uppercase tracking-widest text-blue-600 group-hover:gap-2 transition-all">
          Edit
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
