import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange, className = '' }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

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

      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('ellipsis1');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis2');
      }

      pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (page === 'ellipsis1' || page === 'ellipsis2') {
        return (
          <div
            key={`ellipsis-${index}`}
            className="w-10 h-10 flex items-center justify-center text-slate-400"
          >
            <MoreHorizontal className="w-4 h-4" />
          </div>
        );
      }

      return (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
            currentPage === page
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
    <div
      className={`flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 ${className}`}
    >
      <div className="text-sm text-slate-500 font-medium">
        Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
        <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span>{' '}
        of <span className="text-slate-900">{totalItems}</span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-1">{renderPageNumbers()}</div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
