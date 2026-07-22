import React from 'react';
import { Search, X } from 'lucide-react';
import { Input, type InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onSearchChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onSearchChange,
  onClear,
  placeholder = 'Search library...',
  ...props
}) => {
  return (
    <Input
      value={value}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder={placeholder}
      leftIcon={<Search className="w-4 h-4" />}
      rightIcon={
        value ? (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              if (onClear) onClear();
            }}
            aria-label="Clear search"
            className="p-1 text-[#7A857F] hover:text-[#252A27] dark:hover:text-[#F8F5EE] rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
};
