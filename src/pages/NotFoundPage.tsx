import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-extrabold text-[var(--color-emerald-accent)]">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] max-w-sm">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => navigate('/')}
          className="mt-6"
        >
          Back to Library
        </Button>
      </div>
    </MainLayout>
  );
};
