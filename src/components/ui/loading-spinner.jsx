import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const LoadingSpinner = ({
  size = 'md',
  text = 'Loading...',
  fullPage = false,
  className = '',
}) => {
 

  const textSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  };

  
  const textSize = textSizeClasses[size] || textSizeClasses.md;

  const content = (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Custom Grid Loader */}
      <div className="loader-grid mb-8" />

      {/* Text Below */}
      {text && (
        <div className="relative z-10 flex items-center justify-center px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-purple-500/10 shadow-sm">
          <p className={`${textSize} text-zinc-900 font-bold uppercase tracking-[0.2em] text-center animate-pulse`}>
            {text}
          </p>
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-[#FAFAFA]/90 backdrop-blur-sm z-9999 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Inline spinner for buttons and small areas
export const InlineSpinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return <Loader2 className={`${sizeClasses[size] || sizeClasses.sm} animate-spin ${className}`} />;
};

// Page loader with optional progress bar
export const PageLoader = ({ progress, text = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-[#FAFAFA] z-9999 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <LoadingSpinner size="lg" text={text} />

        {progress !== undefined && (
          <div className="mt-12 w-64">
            <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              <span>{text}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-purple-600 rounded-full"
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton loader for lists
export const SkeletonLoader = ({ type = 'list', count = 3 }) => {
  if (type === 'list') {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200/50 p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-md ltr:mr-4 rtl:ml-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'message') {
    return (
      <div className="divide-y divide-gray-100">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start p-4 animate-pulse">
            <div className="w-5 h-5 bg-gray-200 rounded ltr:mr-3 rtl:ml-3"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full ltr:mr-4 rtl:ml-4"></div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Default export for convenience
export default LoadingSpinner;
