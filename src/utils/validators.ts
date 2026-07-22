export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validatePdfFile(
  file: File,
  maxSize: number = MAX_FILE_SIZE_BYTES
): Promise<FileValidationResult> {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  // 1. Check empty / 0-byte file
  if (file.size === 0) {
    return {
      isValid: false,
      error: `"${file.name}" is an empty 0-byte file and cannot be imported.`,
    };
  }

  // 2. Check maximum size
  if (file.size > maxSize) {
    const sizeInMb = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit of ${sizeInMb} MB.`,
    };
  }

  // 3. Check filename extension
  const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');
  const isPdfMime = file.type === 'application/pdf' || file.type === '';

  if (!isPdfExtension && !isPdfMime) {
    return {
      isValid: false,
      error: `"${file.name}" is not a PDF file. Folira currently supports PDF documents only.`,
    };
  }

  // 4. Magic Bytes Inspection (%PDF-)
  try {
    const headerBuffer = await file.slice(0, 1024).arrayBuffer();
    const headerArray = new Uint8Array(headerBuffer);
    const headerString = String.fromCharCode(...headerArray);

    if (!headerString.includes('%PDF-')) {
      return {
        isValid: false,
        error: `"${file.name}" does not appear to be a valid PDF document. File header magic bytes are missing or corrupted.`,
      };
    }
  } catch (err) {
    console.warn('Could not read PDF magic bytes:', err);
  }

  return { isValid: true };
}
