export class EpubValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EpubValidationError';
  }
}

/**
  * Inspects the first 4 bytes of an ArrayBuffer for PKZIP magic header (0x50 0x4B 0x03 0x04).
  */
export function isZipFileHeader(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const bytes = new Uint8Array(buffer, 0, 4);
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

export async function validateEpubFile(file: File, maxSizeBytes: number = 100 * 1024 * 1024): Promise<void> {
  if (!file) {
    throw new EpubValidationError('No file selected.');
  }

  if (file.size === 0) {
    throw new EpubValidationError('Selected file is 0 bytes.');
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new EpubValidationError(`File size (${sizeMb} MB) exceeds maximum allowed size (100 MB).`);
  }

  // Inspect first 4 bytes for PKZIP header
  const headerSlice = await file.slice(0, 4).arrayBuffer();
  if (!isZipFileHeader(headerSlice)) {
    throw new EpubValidationError('Invalid EPUB archive signature. File is not a valid zip archive.');
  }
}
