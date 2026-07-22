import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Mock crypto.randomUUID for Vitest node/jsdom environment if needed
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = {};
}

if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = () =>
    'f47ac10b-58cc-4372-a567-0e02b2c3d479' as `${string}-${string}-${string}-${string}-${string}`;
}

// Polyfill DOMMatrix for PDF.js in JSDOM environment
if (typeof globalThis.DOMMatrix === 'undefined') {
  // @ts-ignore
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor() {}
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
  };
}

