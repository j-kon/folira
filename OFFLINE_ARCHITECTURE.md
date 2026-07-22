# Offline Storage Architecture - Folira

Folira is designed as a 100% offline-first Progressive Web App (PWA). All document files, metadata, reading progress, and bookmarks are stored directly on the user's browser device.

---

## Storage Layers

### 1. IndexedDB (Dexie.js Engine)

IndexedDB is used to persist binary file Blobs, metadata, and bookmarks.

#### Database Name: `FoliraDatabase`

##### Table 1: `documents`
* Schema: `id, name, isFavourite, lastOpenedAt, createdAt, fingerprint`
* Structure:
  * `id` (string, UUID): Unique document identifier.
  * `name` (string): User-facing document title.
  * `originalName` (string): Original filename.
  * `mimeType` (string): `application/pdf`.
  * `fileSize` (number): File size in bytes.
  * `fileBlob` (Blob): Binary file blob payload stored in IndexedDB.
  * `totalPages` (number): Page count extracted by PDF.js.
  * `currentPage` (number): Last read page (1-indexed).
  * `progressPercentage` (number): Calculated progress `(currentPage / totalPages) * 100`.
  * `isFavourite` (boolean): Favourite status indicator.
  * `createdAt` & `updatedAt` & `lastOpenedAt` (number, timestamps).
  * `fingerprint` (string): SHA-256 hash of file content for duplicate detection.
  * `thumbnailUrl` (optional string): Data URL thumbnail for fast grid rendering.

##### Table 2: `bookmarks`
* Schema: `id, documentId, pageNumber, createdAt`
* Structure:
  * `id` (string, UUID)
  * `documentId` (string, foreign key)
  * `pageNumber` (number)
  * `label` (string)
  * `createdAt` (number, timestamp)

---

## Database Versioning & Safe Migrations

Dexie database schema uses versioning:
* **Version 1**: Initial release schema (`id, name, isFavourite, lastOpenedAt, createdAt`).
* **Version 2**: Adds `fingerprint` index to `documents`. Automatically backfills SHA-256 hashes for pre-existing documents during database upgrade.

---

## Service Worker & App Shell Caching

* Configured with `vite-plugin-pwa` and Workbox (`generateSW`).
* Precaches HTML, CSS, JavaScript chunks, icons, and PDF.js worker files.
* **Excludes PDF document Blobs**: PDF binaries reside exclusively inside IndexedDB (`documents` table) and are never duplicated in the Service Worker cache.

---

## Persistent Storage API

* Uses `navigator.storage.persist()` and `navigator.storage.persisted()`.
* Users can request persistent storage through **Settings & Storage** (`/settings`) to prevent browser eviction under disk pressure.
