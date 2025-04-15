import { useMemo } from 'react';
import { ToastOptions } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

export const useToastConfig = () => {
  const { theme } = useTheme();
  
  const toastConfig = useMemo<ToastOptions>(() => ({
    position: "bottom-left",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: theme === 'dark' ? 'dark' : 'light'
  }), [theme]);

  return toastConfig;
}; 