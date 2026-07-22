import { describe, it, expect } from 'vitest';
import { validatePdfFile, MAX_FILE_SIZE_BYTES } from '@/utils/validators';

describe('validatePdfFile', () => {
  it('should accept a valid PDF file with %PDF- header magic bytes', async () => {
    const validFile = new File(['%PDF-1.7 sample pdf content'], 'sample.pdf', {
      type: 'application/pdf',
    });
    const result = await validatePdfFile(validFile);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject a 0-byte file', async () => {
    const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
    const result = await validatePdfFile(emptyFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('0-byte file');
  });

  it('should reject a non-PDF file', async () => {
    const txtFile = new File(['text content'], 'notes.txt', {
      type: 'text/plain',
    });
    const result = await validatePdfFile(txtFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('is not a PDF file');
  });

  it('should reject a file lacking %PDF- magic bytes header', async () => {
    const fakePdf = new File(['This is plain text with pdf extension'], 'fake.pdf', {
      type: 'application/pdf',
    });
    const result = await validatePdfFile(fakePdf);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('header magic bytes are missing');
  });

  it('should reject a file exceeding the maximum size limit', async () => {
    const oversizedFile = new File(
      [new ArrayBuffer(MAX_FILE_SIZE_BYTES + 1024)],
      'large.pdf',
      { type: 'application/pdf' }
    );
    const result = await validatePdfFile(oversizedFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('File size');
  });
});
