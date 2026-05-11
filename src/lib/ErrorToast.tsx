// ErrorToast.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { AppError, addErrorListener, handleError } from './errorHandler';

interface ErrorToastProps {
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ onClose, position = 'top-right' }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  useEffect(() => {
    const unsubscribe = addErrorListener((error) => {
      console.log('🔔 ErrorToast received:', error.userMessage);
      setErrors(prev => [...prev, error]);
      setTimeout(() => {
        setErrors(prev => prev.filter(e => e !== error));
      }, 5000);
    });
    return unsubscribe;
  }, []);

  const removeError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
    if (onClose && errors.length === 1) onClose();
  };

  const getIcon = (severity: AppError['severity']) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getColors = (severity: AppError['severity']) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (errors.length === 0) return null;

  return (
    <div className={`fixed z-50 space-y-2 ${getPositionClasses()}`}>
      <AnimatePresence>
        {errors.map((error, index) => (
          <motion.div
            key={error.timestamp.getTime() + index}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`rounded-lg border p-4 shadow-lg w-80 ${getColors(error.severity)}`}
          >
            <div className="flex items-start gap-3">
              {getIcon(error.severity)}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {error.userMessage}
                </p>
                {process.env.NODE_ENV === 'development' && error.message && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    {error.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeError(index)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Custom hook to show errors from any component
export const useErrorToast = () => {
  const showError = (message: string) => {
    console.log('📢 showError called:', message);
    const error = new Error(message);
    handleError(error, {
      source: 'validation',
      severity: 'warning',
      showAlert: false,
      showToast: true,
      customUserMessage: message
    });
  };

  const showSuccess = (message: string) => {
    console.log('✅ showSuccess called:', message);
    const successError = new Error(message);
    handleError(successError, {
      source: 'validation',
      severity: 'info',
      showAlert: false,
      showToast: true,
      customUserMessage: message
    });
  };

  const showWarning = (message: string) => {
    console.log('⚠️ showWarning called:', message);
    const warningError = new Error(message);
    handleError(warningError, {
      source: 'validation',
      severity: 'warning',
      showAlert: false,
      showToast: true,
      customUserMessage: message
    });
  };

  return { showError, showSuccess, showWarning };
};