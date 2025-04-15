import { ToastOptions } from "react-toastify";

// Define common gradients that match our UI theme
const gradients = {
  success: 'linear-gradient(to right, #059669, #10b981)', // Green gradient
  error: 'linear-gradient(to right, #dc2626, #ef4444)', // Red gradient
  info: 'linear-gradient(to right, #2563eb, #3b82f6)', // Blue gradient
  warning: 'linear-gradient(to right, #d97706, #f59e0b)', // Orange gradient
};

export const toastStyles: { [key: string]: ToastOptions } = {
  success: {
    style: {
      background: gradients.success,
      color: 'white',
    },
    className: 'toast-white-icon'
  },
  error: {
    style: {
      background: gradients.error,
      color: 'white',
    },
    className: 'toast-white-icon'
  },
  info: {
    style: {
      background: gradients.info,
      color: 'white',
    },
    className: 'toast-white-icon'
  },
  warning: {
    style: {
      background: gradients.warning,
      color: 'white',
    },
    className: 'toast-white-icon'
  }
}; 