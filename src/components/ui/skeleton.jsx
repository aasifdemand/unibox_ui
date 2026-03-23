import React from 'react';

const Skeleton = ({ className = '', variant = 'rect', ...props }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full';
      case 'text':
        return 'rounded-md h-4 w-3/4';
      case 'card':
        return 'rounded-xl h-48 w-full';
      default:
        return 'rounded-lg';
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-100/80  ${getVariantClasses()} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/40 to-transparent"></div>
    </div>
  );
};

export default Skeleton;
