import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({
  size = "md",
  text = "Loading...",
  fullPage = false,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizeClasses[size] || textSizeClasses.md;

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2
              className={`${spinnerSize} text-blue-600 animate-spin mx-auto`}
            />
            <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-indigo-600/20 blur-xl rounded-full -z-10"></div>
          </div>
          {text && (
            <p className={`${textSize} text-gray-600 font-medium mt-4`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <Loader2 className={`${spinnerSize} text-blue-600 animate-spin`} />
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-indigo-600/20 blur-xl rounded-full -z-10"></div>
      </div>
      {text && (
        <p className={`${textSize} text-gray-600 font-medium mt-2`}>{text}</p>
      )}
    </div>
  );
};

// Inline spinner for buttons and small areas
export const InlineSpinner = ({ size = "sm", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <Loader2
      className={`${sizeClasses[size] || sizeClasses.sm} animate-spin ${className}`}
    />
  );
};

// Page loader with optional progress bar
export const PageLoader = ({ progress, text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="w-64">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-indigo-600/20 blur-xl rounded-full -z-10"></div>
        </div>
        <p className="text-sm text-gray-600 font-medium text-center mt-4">
          {text}
        </p>

        {progress !== undefined && (
          <div className="mt-6 w-full">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Loading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton loader for lists
export const SkeletonLoader = ({ type = "list", count = 3 }) => {
  if (type === "list") {
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

  if (type === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200/50 p-6 animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4"></div>
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

  if (type === "message") {
    return (
      <div className="divide-y divide-gray-100">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start p-4 animate-pulse">
            <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
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
