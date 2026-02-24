import toast from 'react-hot-toast';

export const useToast = () => {
  const success = (message) => {
    toast.success(message, {
      duration: 3000,
    });
  };

  const error = (message) => {
    toast.error(message, {
      duration: 4000,
    });
  };

  const loading = (message = 'Please wait...') => {
    return toast.loading(message);
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  return {
    success,
    error,
    loading,
    dismiss,
  };
};
