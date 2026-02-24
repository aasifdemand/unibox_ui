import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ErrorAlert = ({
  error,
  onClear,
  title = 'Error',
  variant = 'error',
  dismissible = true,
  className = '',
}) => {
  if (!error) return null;

  const variants = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      buttonHover: 'hover:text-red-800',
      buttonBg: 'hover:bg-red-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      buttonHover: 'hover:text-yellow-800',
      buttonBg: 'hover:bg-yellow-100',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      buttonHover: 'hover:text-green-800',
      buttonBg: 'hover:bg-green-100',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      buttonHover: 'hover:text-blue-800',
      buttonBg: 'hover:bg-blue-100',
    },
  };

  const styles = variants[variant] || variants.error;

  // Handle different error formats
  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (error?.data?.message) return error.data.message;
    return 'An unexpected error occurred';
  };

  const message = getErrorMessage();

  return (
    <div className={`p-4 m-6 ${styles.bg} border ${styles.border} rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="shrink-0 mr-3 mt-0.5">{styles.icon}</div>
        <div className="flex-1">
          <h3 className={`font-semibold ${styles.text} mb-1`}>{title}</h3>
          <p className={`text-sm ${styles.text} opacity-90`}>{message}</p>
          {error?.stack && import.meta.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className={`text-xs ${styles.text} opacity-70 cursor-pointer`}>
                Stack trace
              </summary>
              <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-x-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        {dismissible && onClear && (
          <button
            onClick={onClear}
            className={`ml-auto p-1.5 rounded-lg transition ${styles.buttonBg} ${styles.buttonHover}`}
            aria-label="Dismiss"
          >
            <X className={`w-4 h-4 ${styles.text}`} />
          </button>
        )}
      </div>
    </div>
  );
};

// Toast-style alert that auto-dismisses
export const ToastAlert = ({ error, onClear, variant = 'error', duration = 5000 }) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration && onClear) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClear();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClear]);

  if (!error || !visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <ErrorAlert
        error={error}
        onClear={() => {
          setVisible(false);
          onClear?.();
        }}
        variant={variant}
        className="shadow-lg max-w-md"
      />
    </div>
  );
};

// Banner alert for important messages
export const BannerAlert = ({ error, onClear, variant = 'error', title, className = '' }) => {
  if (!error) return null;

  const variants = {
    error: {
      bg: 'bg-red-600',
      text: 'text-white',
      icon: <AlertCircle className="w-5 h-5 text-white" />,
    },
    warning: {
      bg: 'bg-yellow-500',
      text: 'text-white',
      icon: <AlertTriangle className="w-5 h-5 text-white" />,
    },
    success: {
      bg: 'bg-green-600',
      text: 'text-white',
      icon: <CheckCircle className="w-5 h-5 text-white" />,
    },
    info: {
      bg: 'bg-blue-600',
      text: 'text-white',
      icon: <Info className="w-5 h-5 text-white" />,
    },
  };

  const styles = variants[variant] || variants.error;
  const message = typeof error === 'string' ? error : error?.message || 'An error occurred';

  return (
    <div className={`${styles.bg} ${styles.text} px-6 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {styles.icon}
          <div>
            {title && <span className="font-semibold mr-2">{title}:</span>}
            <span className="text-sm">{message}</span>
          </div>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="p-1 hover:bg-white/20 rounded-lg transition"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const FieldError = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <p className={`text-xs text-red-600 mt-1 flex items-center ${className}`}>
      <AlertCircle className="w-3 h-3 mr-1" />
      {error}
    </p>
  );
};

export default ErrorAlert;
