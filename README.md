# Folira

> **Read anything. Even offline.**

Folira is a private, personal document reading library built for the web. It allows you to import and read PDF documents directly on your device with complete privacy and zero reliance on cloud servers or internet connectivity.

---

## Key Features

* 📱 **100% Offline-First (PWA)**: Installable as a Progressive Web App on Desktop, Mobile, and Tablet. Reads cached documents seamlessly without an internet connection.
* 🔒 **Private & Local**: All files, thumbnails, reading progress, and bookmarks are stored exclusively on your device using IndexedDB (Dexie.js).
* 📑 **Distraction-Free PDF Reader**: Smooth page navigation, high-DPI canvas rendering, custom reading background modes (Light, Dark, Sepia), and zoom controls (Zoom in/out, Fit-width).
* 🔖 **Bookmarks & Reading Progress**: Remembers your last opened page automatically and returns you right where you left off. Save bookmarks with key labels.
* 📚 **Organized Library View**: Switch between Grid and List views, filter by Favourites or Recently Opened, and sort by Title, Date Added, Progress, or Last Opened.
* 🌙 **Modern Design & Dark Mode**: Modern digital library interface with warm white backgrounds, soft charcoal text, and sage green accents.

---

## Technology Stack

* **Core**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v4, Lucide React icons
* **State Management**: Zustand
* **Local Database**: Dexie.js (IndexedDB wrapper)
* **PDF Engine**: PDF.js (`pdfjs-dist`) with local Web Worker execution
* **PWA & Caching**: `vite-plugin-pwa`, Workbox
* **Routing**: React Router v7
* **Testing**: Vitest, React Testing Library, `fake-indexeddb`

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher)
* `npm` or `yarn` / `pnpm`

### Installation

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/folira.git
   cd folira
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`.

---

## Development & Build Commands

* `npm run dev`: Start Vite development server with HMR.
* `npm test`: Run automated unit test suite with Vitest.
* `npm run build`: Compile TypeScript and build production PWA bundle.
* `npm run preview`: Preview the production build locally.

---

## Offline Storage Architecture

Folira uses IndexedDB through Dexie.js to store documents and metadata locally:

### Database Tables

1. **`documents`**:
   * `id` (UUID)
   * `name` & `originalName`
   * `mimeType` & `fileSize`
   * `fileBlob` (binary file data)
   * `totalPages`, `currentPage`, `progressPercentage`
   * `isFavourite`, `createdAt`, `updatedAt`, `lastOpenedAt`
   * `thumbnailUrl` (cached data URL for instant grid view)

2. **`bookmarks`**:
   * `id` (UUID)
   * `documentId` (foreign key)
   * `pageNumber`
   * `label`
   * `createdAt`

> **Storage Abstraction**: All database calls are abstracted inside `src/services/documentStorage.ts`, allowing future migration to the Origin Private File System (OPFS) or IndexedDB blob streaming without altering application components.

---

## Keyboard Shortcuts inside Reader

| Shortcut | Action |
| :--- | :--- |
| `←` (Left Arrow) | Previous page |
| `→` (Right Arrow) / `Space` | Next page |
| `+` / `=` | Zoom in |
| `-` / `_` | Zoom out |
| `B` | Bookmark current page |
| `Escape` | Exit fullscreen mode or close sidebar |

---

## Current Limitations & Future Roadmap

### Current Limitations
* PDF is the primary supported document format in the MVP.
* Storing large PDF files in IndexedDB works great for browser libraries up to several gigabytes; future versions will adopt OPFS for even faster chunked I/O.

### Planned Future Formats
* 📖 **EPUB**: Reflowable ebook reading experience.
* 📄 **DOCX**: Microsoft Word document viewer.
* 📝 **TXT / Markdown**: Rich plain text reading with custom font size, typography, and line-height controls.
