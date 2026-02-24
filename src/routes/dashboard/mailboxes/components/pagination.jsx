import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  isLoadingMessages,
  onNextPage,
  onPrevPage,
  startMessageCount,
  endMessageCount,
  totalMessages,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        Page <span className="text-slate-800">{currentPage}</span>
        {totalMessages > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md">
            Showing {startMessageCount} - {endMessageCount}{' '}
            <span className="text-slate-300">/</span> {totalMessages}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onPrevPage}
          disabled={!hasPreviousPage || isLoadingMessages}
          className="btn-secondary py-1.5 px-3 text-[11px] disabled:opacity-30 flex items-center shadow-xs"
        >
          <ChevronLeft className="w-4 h-4 mr-1.5" />
          Prev
        </button>
        <button
          onClick={onNextPage}
          disabled={!hasNextPage || isLoadingMessages}
          className="btn-secondary py-1.5 px-3 text-[11px] disabled:opacity-30 flex items-center shadow-xs"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
