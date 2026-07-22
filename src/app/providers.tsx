import React, { useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';

export interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const { theme } = useUIStore();

  useEffect(() => {
    // Initialize root HTML dark class based on persisted user preference
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
};
