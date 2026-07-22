import React from 'react';
import { Header } from './Header';
import { ToastContainer } from '../common/ToastContainer';

export interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showHeader = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-warm-bg)] dark:bg-[var(--color-dark-bg)] text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] transition-colors">
      {showHeader && <Header />}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
};
