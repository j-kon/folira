import React, { useEffect, useMemo } from 'react';
import {
  Grid,
  List,
  Clock,
  Star,
  BookOpen,
  SearchX,
  StarOff,
  ArrowUpDown,
  BookX,
} from 'lucide-react';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { useUIStore } from '@/stores/useUIStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { WelcomeScreen } from '@/components/library/WelcomeScreen';
import { ContinueReadingCard } from '@/components/library/ContinueReadingCard';
import { DocumentGrid } from '@/components/library/DocumentGrid';
import { DocumentList } from '@/components/library/DocumentList';
import { RenameModal } from '@/components/library/RenameModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import type { SortOption } from '@/types/document';

export const LibraryPage: React.FC = () => {
  const {
    documents,
    isLoading,
    loadDocuments,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    sortOption,
    setSortOption,
    viewMode,
    setViewMode,
    deleteDocument,
  } = useDocumentStore();

  const { deleteConfirmDocId, closeDeleteConfirm } = useUIStore();

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Document filtering and sorting
  const filteredAndSortedDocs = useMemo(() => {
    let result = [...documents];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) => d.name.toLowerCase().includes(q) || d.originalName.toLowerCase().includes(q)
      );
    }

    // Filter tab
    if (filter === 'favourites') {
      result = result.filter((d) => d.isFavourite);
    } else if (filter === 'recent') {
      result = result.filter((d) => d.lastOpenedAt !== null);
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === 'lastOpened') {
        return (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0);
      }
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'createdAt') {
        return b.createdAt - a.createdAt;
      }
      if (sortOption === 'progress') {
        return b.progressPercentage - a.progressPercentage;
      }
      return 0;
    });

    return result;
  }, [documents, searchQuery, filter, sortOption]);

  // Continue reading item (most recently opened document with progress > 0)
  const continueReadingDoc = useMemo(() => {
    const opened = documents
      .filter((d) => d.lastOpenedAt !== null && d.currentPage > 0)
      .sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0));
    return opened.length > 0 ? opened[0] : null;
  }, [documents]);

  const docToDelete = documents.find((d) => d.id === deleteConfirmDocId);

  const handleDeleteConfirm = () => {
    if (deleteConfirmDocId) {
      deleteDocument(deleteConfirmDocId);
      closeDeleteConfirm();
    }
  };

  if (!isLoading && documents.length === 0) {
    return (
      <MainLayout>
        <WelcomeScreen />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 pb-12">
        {/* Continue Reading Section */}
        {!searchQuery && filter === 'all' && continueReadingDoc && (
          <ContinueReadingCard document={continueReadingDoc} />
        )}

        {/* Toolbar: Filter Tabs, View Toggle, Sort Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DD] dark:border-[#2D3630] pb-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filter === 'all'
                  ? 'bg-[#2F6B4F] text-[#FFFDF8] shadow-sm'
                  : 'bg-[#E8E5DD]/50 dark:bg-[#1E2420] text-[#525B56] dark:text-[#C0C8C3] hover:text-[#252A27] dark:hover:text-[#F8F5EE]'
              }`}
            >
              All Documents ({documents.length})
            </button>

            <button
              onClick={() => setFilter('favourites')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shrink-0 ${
                filter === 'favourites'
                  ? 'bg-[#2F6B4F] text-[#FFFDF8] shadow-sm'
                  : 'bg-[#E8E5DD]/50 dark:bg-[#1E2420] text-[#525B56] dark:text-[#C0C8C3] hover:text-[#252A27] dark:hover:text-[#F8F5EE]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Favourites</span>
            </button>

            <button
              onClick={() => setFilter('recent')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shrink-0 ${
                filter === 'recent'
                  ? 'bg-[#2F6B4F] text-[#FFFDF8] shadow-sm'
                  : 'bg-[#E8E5DD]/50 dark:bg-[#1E2420] text-[#525B56] dark:text-[#C0C8C3] hover:text-[#252A27] dark:hover:text-[#F8F5EE]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recently Opened</span>
            </button>
          </div>

          {/* Right Controls: Sort & View Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-[#7A857F] dark:text-[#8E9992]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-[#FFFDF8] dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] rounded-lg px-2.5 py-1 text-xs font-medium text-[#252A27] dark:text-[#F8F5EE] focus:outline-none focus:ring-1 focus:ring-[#2F6B4F]"
              >
                <option value="lastOpened">Last Opened</option>
                <option value="name">Title (A-Z)</option>
                <option value="createdAt">Date Added</option>
                <option value="progress">Reading Progress</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="flex items-center p-1 bg-[#E8E5DD]/50 dark:bg-[#1E2420] border border-[#E8E5DD] dark:border-[#2D3630] rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#FFFDF8] dark:bg-[#252A27] text-[#2F6B4F] dark:text-[#3D8B67] shadow-xs font-bold'
                    : 'text-[#7A857F] hover:text-[#252A27] dark:hover:text-[#F8F5EE]'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('list')}
                aria-label="List View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#FFFDF8] dark:bg-[#252A27] text-[#2F6B4F] dark:text-[#3D8B67] shadow-xs font-bold'
                    : 'text-[#7A857F] hover:text-[#252A27] dark:hover:text-[#F8F5EE]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Document Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-editorial text-xl font-bold tracking-tight text-[#252A27] dark:text-[#F8F5EE]">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : filter === 'favourites'
                ? 'Favourite Documents'
                : filter === 'recent'
                ? 'Recently Opened'
                : 'All Documents'}
            </h2>
            <span className="text-xs font-medium text-[#7A857F] dark:text-[#8E9992]">
              {filteredAndSortedDocs.length} {filteredAndSortedDocs.length === 1 ? 'document' : 'documents'}
            </span>
          </div>

          {filteredAndSortedDocs.length === 0 ? (
            searchQuery ? (
              <EmptyState
                icon={<SearchX className="w-8 h-8" />}
                title="No documents match your search"
                description={`We couldn't find any documents matching "${searchQuery}". Check for typos or try searching for another title.`}
                actionLabel="Clear Search"
                onAction={() => setSearchQuery('')}
              />
            ) : filter === 'favourites' ? (
              <EmptyState
                icon={<StarOff className="w-8 h-8" />}
                title="No favourite documents yet"
                description="Click the star icon on any document card to add it to your favourites list for quick access."
                actionLabel="View All Documents"
                onAction={() => setFilter('all')}
              />
            ) : filter === 'recent' ? (
              <EmptyState
                icon={<BookX className="w-8 h-8" />}
                title="No recently opened documents"
                description="Documents you open and read will appear here automatically."
                actionLabel="View All Documents"
                onAction={() => setFilter('all')}
              />
            ) : (
              <EmptyState
                icon={<BookOpen className="w-8 h-8" />}
                title="Your library is empty"
                description="Import your first PDF document to begin reading privately on your device."
              />
            )
          ) : viewMode === 'grid' ? (
            <DocumentGrid documents={filteredAndSortedDocs} isLoading={isLoading} />
          ) : (
            <DocumentList documents={filteredAndSortedDocs} isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* Modals */}
      <RenameModal />

      <ConfirmDialog
        isOpen={!!deleteConfirmDocId}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title="Remove Document?"
        description={
          docToDelete
            ? `Are you sure you want to remove "${docToDelete.name}" from your library? This will delete the document file and all stored bookmarks from this device.`
            : 'Are you sure you want to delete this document?'
        }
        confirmText="Remove Document"
      />
    </MainLayout>
  );
};
