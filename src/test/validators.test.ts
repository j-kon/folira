import { describe, it, expect } from 'vitest';
import { validatePdfFile, MAX_FILE_SIZE_BYTES } from '@/utils/validators';

describe('validatePdfFile', () => {
  it('should accept a valid PDF file under the size limit', () => {
    const validFile = new File(['dummy pdf content'], 'sample.pdf', {
      type: 'application/pdf',
    });
    const result = validatePdfFile(validFile);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject a non-PDF file', () => {
    const txtFile = new File(['text content'], 'notes.txt', {
      type: 'text/plain',
    });
    const result = validatePdfFile(txtFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('is not a PDF file');
  });

  it('should reject a file exceeding the maximum size limit', () => {
    const oversizedFile = new File(
      [new ArrayBuffer(MAX_FILE_SIZE_BYTES + 1024)],
      'large.pdf',
      { type: 'application/pdf' }
    );
    const result = validatePdfFile(oversizedFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('File size exceeds maximum allowed limit');
  });
});
