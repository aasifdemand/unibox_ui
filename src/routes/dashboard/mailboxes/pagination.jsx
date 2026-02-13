import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
      <div className="text-sm text-gray-500">
        Page {currentPage}
        {totalMessages > 0 &&
          ` • ${startMessageCount}-${endMessageCount} of ${totalMessages}`}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onPrevPage}
          disabled={!hasPreviousPage || isLoadingMessages}
          className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg text-sm font-medium transition flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        <button
          onClick={onNextPage}
          disabled={!hasNextPage || isLoadingMessages}
          className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg text-sm font-medium transition flex items-center"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
