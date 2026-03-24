import { SkeletonLoader } from '../../../../components/ui/loading-spinner';

const Loader = ({ isLoading, mailboxes }) => {
  if (isLoading && (mailboxes || []).length === 0) {
    return (
      <div className="p-4 md:p-8 space-y-6 bg-slate-50 h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg" />
        </div>
        <SkeletonLoader type="list" count={8} />
      </div>
    );
  }
  return null;
};

export default Loader;
