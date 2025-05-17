import { createContext, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType>({
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showInfo = (message: string) => {
    toast(message);
  };

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
        showInfo,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};