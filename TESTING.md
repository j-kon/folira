# Testing Guidelines - Folira

This document explains how to execute unit tests, end-to-end tests, offline capability verification, and reset local development data.

---

## Test Suites Overview

Folira includes two test suites:
1. **Unit Tests (Vitest)**: Tests file validation, magic byte checks, SHA-256 fingerprint duplicate detection, Dexie IndexedDB v2 operations, reading progress calculation, and keyboard shortcut isolation.
2. **End-to-End Tests (Playwright)**: Tests full browser interactions (import & read, bookmark persistence across reloads, document deletion, and network disconnection offline reading).

---

## Running Unit Tests

To run the Vitest unit test suite:

```bash
npm test
```

To run unit tests in watch mode during development:

```bash
npm run test:watch
```

---

## Running End-to-End Tests (Playwright)

To run the Playwright E2E test suite:

```bash
npm run test:e2e
```

### Headed Mode (Visual Inspection)

To run Playwright tests with a visible browser window:

```bash
npx playwright test --headed
```

---

## How to Test Offline Mode Manually

1. Start local development server:
   ```bash
   npm run dev
   ```
2. Open Chrome DevTools (`F12` or `Cmd + Option + I`).
3. Import a sample PDF document into Folira.
4. Navigate to the **Network** tab in DevTools.
5. Change the network throttling dropdown from **No throttling** to **Offline**.
6. Refresh the page or navigate through pages inside the PDF reader.
7. Confirm that Folira opens instantly, displays your local library, and renders your PDF without any network calls.

---

## How to Reset Local Development Data

To clear all IndexedDB database tables during development:
1. Open Folira -> Navigate to **Settings** (`/settings`).
2. Scroll to **Clear Local Data** -> Click **Delete All Documents & Data**.
3. Alternatively, open DevTools -> Application -> Storage -> Click **Clear site data**.
