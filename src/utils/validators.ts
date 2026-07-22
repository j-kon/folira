export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePdfFile(file: File, maxSize: number = MAX_FILE_SIZE_BYTES): FileValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  // Check type
  const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfType) {
    return {
      isValid: false,
      error: `"${file.name}" is not a PDF file. Folira currently supports PDF documents only.`,
    };
  }

  // Check size
  if (file.size > maxSize) {
    const sizeInMb = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `File size exceeds maximum allowed limit of ${sizeInMb}MB.`,
    };
  }

  return { isValid: true };
}
