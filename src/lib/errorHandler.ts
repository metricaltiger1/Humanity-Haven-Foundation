// errorHandler.ts
import { useState, useEffect } from 'react';

// Types for error handling
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';
export type ErrorSource = 'auth' | 'firestore' | 'payment' | 'network' | 'validation' | 'unknown';

export interface AppError {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  source: ErrorSource;
  originalError?: unknown;
  timestamp: Date;
  userMessage: string;
}

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  showToast?: boolean;
  logToConsole?: boolean;
  severity?: ErrorSeverity;
  source?: ErrorSource;
  customUserMessage?: string;
  onError?: (error: AppError) => void;
}

// Global error listeners
type ErrorListener = (error: AppError) => void;
const errorListeners: ErrorListener[] = [];

export const addErrorListener = (listener: ErrorListener) => {
  errorListeners.push(listener);
  return () => {
    const index = errorListeners.indexOf(listener);
    if (index > -1) errorListeners.splice(index, 1);
  };
};

export const clearErrorListeners = () => {
  errorListeners.length = 0;
};

/**
 * Extract meaningful error message from unknown error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
};

/**
 * Get Firebase error code if available
 */
export const getFirebaseErrorCode = (error: unknown): string | undefined => {
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code);
  }
  return undefined;
};

/**
 * Get user-friendly error message based on error type
 */
export const getUserFriendlyMessage = (error: unknown, source?: ErrorSource): string => {
  const errorMessage = getErrorMessage(error);
  const errorCode = getFirebaseErrorCode(error);

  // Firebase specific errors
  if (errorCode) {
    switch (errorCode) {
      case 'permission-denied':
        return 'Unable to complete action. Please refresh and try again.';
      case 'unavailable':
        return 'Service is temporarily unavailable. Please try again.';
      case 'not-found':
        return 'Information not found.';
      case 'already-exists':
        return 'This item already exists.';
      case 'failed-precondition':
        return 'Operation failed. Please refresh and try again.';
      case 'resource-exhausted':
        return 'Too many requests. Please wait a moment.';
      case 'cancelled':
        return 'Operation was cancelled.';
      case 'data-loss':
        return 'Data error. Please contact support.';
      case 'invalid-argument':
        return 'Invalid information provided. Please check your inputs.';
      case 'deadline-exceeded':
        return 'Request timed out. Please check your connection.';
      default:
        break;
    }
  }

  // Source-specific error messages
  if (source === 'payment') {
    if (errorMessage.toLowerCase().includes('network')) {
      return 'Network error. Please check your connection.';
    }
    if (errorMessage.toLowerCase().includes('timeout')) {
      return 'Payment timed out. Please try again.';
    }
    return `Payment failed. Please try again.`;
  }

  if (source === 'auth') {
    return 'Please refresh the page and try again.';
  }

  if (source === 'firestore') {
    if (errorMessage.toLowerCase().includes('permission')) {
      return 'Unable to save data. Please refresh the page.';
    }
    return 'Database error. Please try again.';
  }

  if (source === 'network') {
    return 'Network error. Please check your internet connection.';
  }

  if (source === 'validation') {
    return errorMessage;
  }

  return 'Something went wrong. Please try again.';
};

/**
 * Determine error severity based on error type
 */
export const getErrorSeverity = (error: unknown, source?: ErrorSource): ErrorSeverity => {
  const errorMessage = getErrorMessage(error);
  const errorCode = getFirebaseErrorCode(error);

  if (errorCode === 'data-loss') return 'critical';
  if (errorCode === 'permission-denied') return 'warning';
  if (errorCode === 'unavailable') return 'warning';
  if (source === 'payment') return 'error';
  if (errorMessage.toLowerCase().includes('timeout')) return 'warning';
  
  return 'error';
};

/**
 * Determine error source
 */
export const getErrorSource = (error: unknown): ErrorSource => {
  const errorMessage = getErrorMessage(error);
  const errorCode = getFirebaseErrorCode(error);

  if (errorCode?.startsWith('auth/')) return 'auth';
  if (errorCode?.startsWith('firestore/')) return 'firestore';
  if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
    return 'network';
  }
  if (errorMessage.toLowerCase().includes('mpesa') || errorMessage.toLowerCase().includes('payment')) {
    return 'payment';
  }
  if (errorMessage.toLowerCase().includes('validation')) {
    return 'validation';
  }
  
  return 'unknown';
};

/**
 * Main error handling function
 */
export const handleError = (
  error: unknown,
  options: ErrorHandlerOptions = {}
): AppError => {
  const {
    showAlert = false,
    showToast = true,
    logToConsole = false, 
    severity,
    source,
    customUserMessage,
    onError
  } = options;

  // Determine error properties
  const errorSource = source || getErrorSource(error);
  const errorSeverity = severity || getErrorSeverity(error, errorSource);
  const technicalMessage = getErrorMessage(error);
  const userMessage = customUserMessage || getUserFriendlyMessage(error, errorSource);
  const errorCode = getFirebaseErrorCode(error);

  const appError: AppError = {
    message: technicalMessage,
    code: errorCode,
    severity: errorSeverity,
    source: errorSource,
    originalError: error,
    timestamp: new Date(),
    userMessage
  };

  // Only log to console in development if explicitly enabled
  if (logToConsole && process.env.NODE_ENV === 'development') {
    const logMethod = errorSeverity === 'critical' || errorSeverity === 'error' 
      ? console.error 
      : errorSeverity === 'warning' 
        ? console.warn 
        : console.log;
    
    logMethod(`[${errorSeverity.toUpperCase()}] ${errorSource}:`, userMessage);
  }

  // Show alert if enabled (only for critical errors)
  if (showAlert && errorSeverity === 'critical') {
    alert(userMessage);
  }

  // Notify all listeners
  if (showToast) {
    errorListeners.forEach(listener => listener(appError));
  }

  // Call custom error handler if provided
  if (onError) {
    onError(appError);
  }

  return appError;
};

/**
 * Async wrapper for handling errors in async functions
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleError(error, { ...options, showToast: false });
    return null;
  }
};

/**
 * React hook for error handling in components
 */
export const useErrorHandler = () => {
  const [currentError, setCurrentError] = useState<AppError | null>(null);

  useEffect(() => {
    const unsubscribe = addErrorListener((error) => {
      setCurrentError(error);
      // Auto clear after 5 seconds
      setTimeout(() => {
        setCurrentError(null);
      }, 5000);
    });
    return unsubscribe;
  }, []);

  const clearError = () => setCurrentError(null);

  const handleAsyncError = async <T>(
    fn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      handleError(error, { ...options, showToast: true });
      return null;
    }
  };

  const handleSyncError = (error: unknown, options: ErrorHandlerOptions = {}): void => {
    handleError(error, { ...options, showToast: true });
  };

  return { currentError, clearError, handleAsyncError, handleSyncError };
};

/**
 * Specific error handlers for common scenarios
 */
export const ErrorHandlers = {
  payment: (error: unknown, customMessage?: string) => 
    handleError(error, { 
      source: 'payment', 
      severity: 'error', 
      showAlert: false,
      showToast: true,
      logToConsole: false,
      customUserMessage: customMessage 
    }),
  
  auth: (error: unknown) => 
    handleError(error, { 
      source: 'auth', 
      severity: 'warning', 
      showAlert: false,
      showToast: true,
      logToConsole: false
    }),
  
  database: (error: unknown) => 
    handleError(error, { 
      source: 'firestore', 
      severity: 'warning', 
      showAlert: false,
      showToast: true,
      logToConsole: false
    }),
  
  network: (error: unknown) => 
    handleError(error, { 
      source: 'network', 
      severity: 'warning', 
      showAlert: false,
      showToast: true,
      logToConsole: false
    }),
  
  validation: (error: unknown, customMessage?: string) => 
    handleError(error, { 
      source: 'validation', 
      severity: 'warning', 
      showAlert: false,
      showToast: true,
      logToConsole: false,
      customUserMessage: customMessage 
    }),
  
  silent: (error: unknown) => 
    handleError(error, { 
      showAlert: false, 
      showToast: false, 
      logToConsole: false 
    })
};

export default handleError;