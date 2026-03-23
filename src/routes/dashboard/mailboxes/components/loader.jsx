import Skeleton from '../../../../components/ui/skeleton';

const Loader = ({ isLoading, mailboxes }) => {
  if (isLoading && mailboxes.length === 0) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }
  return null;
};

export default Loader;
