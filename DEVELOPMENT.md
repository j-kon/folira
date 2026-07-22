# Development Guidelines - Folira

This document provides developer guidelines for contributing to and maintaining the Folira project.

---

## Directory Structure

```text
src/
├── app/
│   ├── router.tsx        # React Router routes definition
│   ├── providers.tsx     # Theme and context initializers
│   └── App.tsx           # Main App entrypoint
├── components/
│   ├── common/           # Generic reusable UI controls (Button, Modal, Toast, Dropzone, Skeleton)
│   ├── layout/           # Global header, layout frame, theme toggle
│   ├── library/          # Library views (WelcomeScreen, DocumentCard, Grid, List, Menus)
│   └── reader/           # PDF Reader components (ReaderToolbar, PdfCanvas, ReaderSidebar)
├── features/
│   ├── documents/        # Feature scoped logic
│   ├── bookmarks/
│   ├── reader/
│   └── settings/
├── pages/
│   ├── LibraryPage.tsx   # Main document library screen
│   ├── ReaderPage.tsx    # Full-screen PDF reader screen
│   └── NotFoundPage.tsx  # 404 page
├── services/
│   ├── database.ts       # Dexie IndexedDB schema
│   ├── documentStorage.ts# Storage service abstraction layer
│   └── pdfService.ts     # PDF.js document loader and renderer
├── stores/
│   ├── useDocumentStore.ts    # Library items, filter, search & CRUD
│   ├── useReaderStore.ts      # Active reading session, zoom, page state
│   ├── useUIStore.ts          # Theme & modal popups
│   └── useNotificationStore.ts# Toast notifications
├── hooks/
│   ├── useOnlineStatus.ts     # Network status listener
│   └── useKeyboardShortcuts.ts# Reader hotkey navigation
├── types/                # TypeScript model definitions
├── utils/                # Date, file size, validation helpers
└── test/                 # Vitest test setup and test suites
```

---

## Architecture Principles

1. **Feature-Based & Scalable**: Keep components focused on single responsibilities. Store actions handle data transformations and database persistent calls.
2. **Offline-First Storage Layer**: Never call IndexedDB directly inside React UI components. Always invoke methods through `documentStorage.ts`.
3. **Blobs Outside State**: PDF binary blobs remain in IndexedDB / `documentStorage` and are fetched on-demand during reader initialization to minimize React memory overhead.
4. **Accessible UI**: All interactive elements include visible focus indicators (`focus-visible:ring-2`), ARIA labels, and full keyboard navigation support.
