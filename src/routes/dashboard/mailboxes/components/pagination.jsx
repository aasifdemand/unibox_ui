import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  isLoadingMessages,
  onNextPage,
  onPrevPage,
  onPageChange,
  startMessageCount,
  endMessageCount,
  totalMessages,
  itemsPerPage = 10,
}) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalMessages / itemsPerPage);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) end = 4;
      else if (currentPage >= totalPages - 1) start = totalPages - 3;

      if (start > 2) pages.push('ellipsis1');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('ellipsis2');
      pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (typeof page === 'string') {
        return (
          <div key={`ellipsis-${index}`} className="px-2 text-slate-300">
            <MoreHorizontal className="w-4 h-4" />
          </div>
        );
      }
      return (
        <button
          key={page}
          onClick={() => onPageChange?.(page)}
          className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${currentPage === page
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="flex items-center justify-between py-4 px-4">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">

        {totalMessages > 0 && (
          <span className="mx-2 font-bold text-slate-500">
            {t('mailboxes.showing')} {startMessageCount} - {endMessageCount}{' '}
            <span className="text-slate-300">/</span> {totalMessages}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevPage}
            disabled={!hasPreviousPage || isLoadingMessages}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-xs"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>

          <div className="flex items-center gap-1 mx-1">
            {totalPages > 1 && renderPageNumbers()}
          </div>

          <button
            onClick={onNextPage}
            disabled={!hasNextPage || isLoadingMessages}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-xs"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
