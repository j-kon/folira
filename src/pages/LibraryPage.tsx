import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  List,
  Clock,
  Star,
  BookOpen,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { useDocumentStore } from '@/stores/useDocumentStore';
import { useUIStore } from '@/stores/useUIStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { WelcomeScreen } from '@/components/library/WelcomeScreen';
import { DocumentGrid } from '@/components/library/DocumentGrid';
import { DocumentList } from '@/components/library/DocumentList';
import { RenameModal } from '@/components/library/RenameModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { SortOption } from '@/types/document';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    documents,
    isLoading,
    loadDocuments,
    searchQuery,
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

  // Continue reading item (the most recently opened document that has progress < 100%)
  const continueReadingDoc = useMemo(() => {
    const opened = documents
      .filter((d) => d.lastOpenedAt !== null)
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
        {/* Continue Reading Featured Banner (if any) */}
        {!searchQuery && filter === 'all' && continueReadingDoc && (
          <section className="bg-gradient-to-r from-[var(--color-emerald-accent)] to-[#1E4D3E] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-xs mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Continue Reading</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight line-clamp-1">
                {continueReadingDoc.name}
              </h2>
              <p className="mt-1 text-sm text-emerald-100/90 font-medium">
                Page {continueReadingDoc.currentPage} of {continueReadingDoc.totalPages} (
                {continueReadingDoc.progressPercentage}%)
              </p>
            </div>

            <button
              onClick={() => navigate(`/reader/${continueReadingDoc.id}`)}
              className="relative z-10 px-6 py-3 rounded-xl bg-white text-[var(--color-emerald-accent)] font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-sm inline-flex items-center gap-2 shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>Resume Reading</span>
            </button>
          </section>
        )}

        {/* Toolbar: Filter Tabs, View Toggle, Sort Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] pb-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filter === 'all'
                  ? 'bg-[var(--color-emerald-accent)] text-white shadow-xs'
                  : 'bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)]'
              }`}
            >
              All ({documents.length})
            </button>

            <button
              onClick={() => setFilter('favourites')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shrink-0 ${
                filter === 'favourites'
                  ? 'bg-[var(--color-emerald-accent)] text-white shadow-xs'
                  : 'bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Favourites</span>
            </button>

            <button
              onClick={() => setFilter('recent')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shrink-0 ${
                filter === 'recent'
                  ? 'bg-[var(--color-emerald-accent)] text-white shadow-xs'
                  : 'bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)] hover:text-[var(--color-charcoal)] dark:hover:text-[var(--color-dark-text)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recently Opened</span>
            </button>
          </div>

          {/* Right Controls: Sort & View Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-emerald-accent)]"
              >
                <option value="lastOpened">Last Opened</option>
                <option value="name">Title (A-Z)</option>
                <option value="createdAt">Date Added</option>
                <option value="progress">Reading Progress</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="flex items-center p-1 bg-[var(--color-warm-subtle)] dark:bg-[var(--color-dark-subtle)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] text-[var(--color-emerald-accent)] shadow-xs font-bold'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('list')}
                aria-label="List View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] text-[var(--color-emerald-accent)] shadow-xs font-bold'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
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
            <h2 className="text-lg font-bold tracking-tight text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
              {searchQuery ? `Search Results for "${searchQuery}"` : filter === 'favourites' ? 'Favourite Documents' : filter === 'recent' ? 'Recently Opened' : 'All Documents'}
            </h2>
            <span className="text-xs font-medium text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
              {filteredAndSortedDocs.length} {filteredAndSortedDocs.length === 1 ? 'document' : 'documents'}
            </span>
          </div>

          {filteredAndSortedDocs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[var(--color-warm-card)] dark:bg-[var(--color-dark-card)] border border-[var(--color-warm-border)] dark:border-[var(--color-dark-border)] rounded-3xl">
              <Filter className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-[var(--color-charcoal)] dark:text-[var(--color-dark-text)]">
                No matching documents found
              </h3>
              <p className="mt-1 text-sm text-[var(--color-charcoal-muted)] dark:text-[var(--color-dark-muted)]">
                Try clearing your search query or changing filters.
              </p>
            </div>
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
