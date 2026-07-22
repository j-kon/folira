import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Settings, BarChart3 } from 'lucide-react';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { ThemeToggle } from './ThemeToggle';
import { OfflineBadge } from '../common/OfflineBadge';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { IconButton } from '../common/IconButton';
import { DuplicateModal } from '../library/DuplicateModal';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    importDocument,
    isUploading,
    duplicateDoc,
    dismissDuplicateModal,
    resolveDuplicateImportCopy,
  } = useDocumentStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importDocument(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleOpenExisting = () => {
    if (duplicateDoc) {
      const docId = duplicateDoc.id;
      dismissDuplicateModal();
      navigate(`/reader/${docId}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF8F5]/90 dark:bg-[#151A17]/90 backdrop-blur-md border-b border-[#E8E5DD] dark:border-[#2D3630] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-[#252A27] dark:text-[#F8F5EE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] rounded-lg px-1 shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden drop-shadow-xs transition-transform group-hover:scale-105">
            <img src="/favicon.svg" alt="Folira Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-editorial text-2xl font-bold tracking-tight text-[#252A27] dark:text-[#F8F5EE]">
            Folira
          </span>
        </Link>

        {/* Search Field */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <SearchInput
            value={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search documents by title..."
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <OfflineBadge />

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf,application/epub+zip,.epub"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="hidden sm:inline">Import</span> Document
          </Button>

          <Link to="/analytics" tabIndex={-1}>
            <IconButton
              aria-label="Reading Analytics and Goals"
              icon={<BarChart3 className="w-5 h-5" />}
              variant="ghost"
              size="sm"
            />
          </Link>

          <Link to="/settings" tabIndex={-1}>
            <IconButton
              aria-label="Settings and Storage"
              icon={<Settings className="w-5 h-5" />}
              variant="ghost"
              size="sm"
            />
          </Link>

          <ThemeToggle />
        </div>
      </div>

      <DuplicateModal
        isOpen={!!duplicateDoc}
        onClose={dismissDuplicateModal}
        existingDoc={duplicateDoc}
        onOpenExisting={handleOpenExisting}
        onImportCopy={resolveDuplicateImportCopy}
      />
    </header>
  );
};
