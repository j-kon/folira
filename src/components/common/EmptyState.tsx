import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 my-6 bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] rounded-2xl shadow-sm max-w-lg mx-auto">
      <div className="p-4 bg-[#DDEBE2] dark:bg-[#2E3630] text-[#2F6B4F] dark:text-[#3D8B67] rounded-2xl mb-4">
        {icon}
      </div>
      <h3 className="font-editorial text-xl font-semibold text-[#252A27] dark:text-[#F8F5EE] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#525B56] dark:text-[#C0C8C3] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} leftIcon={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
