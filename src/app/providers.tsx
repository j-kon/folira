import React, { useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';

export interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const { theme } = useUIStore();

  useEffect(() => {
    // Synchronize root HTML dark class & data-theme attribute based on persisted user preference
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  return <>{children}</>;
};
