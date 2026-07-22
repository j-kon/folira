import { describe, it, expect } from 'vitest';
import { isZipFileHeader, validateEpubFile, EpubValidationError } from '../services/epubValidator';
import { epubParserService } from '../services/epubParserService';
import JSZip from 'jszip';

describe('epubValidator & epubParserService', () => {
  it('should identify valid PKZIP magic header 0x50 0x4B 0x03 0x04', () => {
    const validZipHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]).buffer;
    expect(isZipFileHeader(validZipHeader)).toBe(true);

    const invalidHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer; // PDF header
    expect(isZipFileHeader(invalidHeader)).toBe(false);
  });

  it('should reject non-zip files in validateEpubFile', async () => {
    const dummyFile = new File(['Hello World'], 'test.txt', { type: 'text/plain' });
    await expect(validateEpubFile(dummyFile)).rejects.toThrow(EpubValidationError);
  });

  it('should parse an in-memory test EPUB zip archive', async () => {
    const zip = new JSZip();

    // Add container.xml
    zip.file(
      'META-INF/container.xml',
      `<?xml version="1.0"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
      </container>`
    );

    // Add OPF file
    zip.file(
      'OEBPS/content.opf',
      `<?xml version="1.0"?>
      <package xmlns="http://www.idpf.org/2007/opf" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>Test Ebook</dc:title>
          <dc:creator>Folira Author</dc:creator>
          <dc:language>en</dc:language>
        </metadata>
        <manifest>
          <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
        </manifest>
        <spine>
          <itemref idref="chapter1"/>
        </spine>
      </package>`
    );

    // Add Chapter 1 file
    zip.file('OEBPS/chapter1.xhtml', `<html><body><h1>Chapter 1</h1><p>Hello EPUB World!</p></body></html>`);

    const epubBlob = await zip.generateAsync({ type: 'blob' });
    const { packageData } = await epubParserService.parseEpub(epubBlob);

    expect(packageData.metadata.title).toBe('Test Ebook');
    expect(packageData.metadata.author).toBe('Folira Author');
    expect(packageData.spine.length).toBe(1);
    expect(packageData.spine[0].idref).toBe('chapter1');
  });
});
