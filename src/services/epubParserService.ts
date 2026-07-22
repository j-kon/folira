import JSZip from 'jszip';
import type { ParsedEpubPackage, EpubMetadata, EpubManifestItem, EpubSpineItem, EpubTocItem } from '@/types/epub';

export class EpubParserService {
  /**
   * Unzips and parses an EPUB file into structured metadata, spine items, and TOC.
   */
  public async parseEpub(fileBlob: Blob): Promise<{ zip: JSZip; packageData: ParsedEpubPackage; coverBlobUrl?: string }> {
    const zip = await JSZip.loadAsync(fileBlob);

    // Step 1: Read META-INF/container.xml
    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) {
      throw new Error('Invalid EPUB: missing META-INF/container.xml');
    }

    const containerXml = await containerFile.async('text');
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, 'application/xml');
    const rootfileEl = containerDoc.querySelector('rootfile');
    const opfPath = rootfileEl?.getAttribute('full-path');

    if (!opfPath) {
      throw new Error('Invalid EPUB: container.xml missing rootfile path.');
    }

    // Step 2: Read OPF Package File
    const opfFile = zip.file(opfPath);
    if (!opfFile) {
      throw new Error(`Invalid EPUB: OPF file not found at ${opfPath}`);
    }

    const opfXml = await opfFile.async('text');
    const opfDoc = parser.parseFromString(opfXml, 'application/xml');

    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/')) : '';

    // Step 3: Extract Metadata
    const metadata = this.extractMetadata(opfDoc, opfDir);

    // Step 4: Extract Manifest
    const manifest: Record<string, EpubManifestItem> = {};
    const itemEls = opfDoc.querySelectorAll('manifest > item');
    itemEls.forEach((el) => {
      const id = el.getAttribute('id');
      const href = el.getAttribute('href');
      const mediaType = el.getAttribute('media-type');
      if (id && href) {
        manifest[id] = { id, href, mediaType: mediaType || '' };
      }
    });

    // Step 5: Extract Spine
    const spine: EpubSpineItem[] = [];
    const itemrefEls = opfDoc.querySelectorAll('spine > itemref');
    itemrefEls.forEach((el) => {
      const idref = el.getAttribute('idref');
      if (idref) {
        spine.push({ idref, linear: el.getAttribute('linear') !== 'no' });
      }
    });

    // Step 6: Extract TOC
    const spineTocId = opfDoc.querySelector('spine')?.getAttribute('toc');
    const toc = await this.extractToc(zip, manifest, opfDir, spineTocId);

    // Step 7: Extract Cover Blob URL if available
    let coverBlobUrl: string | undefined = undefined;
    if (metadata.coverPath) {
      const fullCoverPath = opfDir ? `${opfDir}/${metadata.coverPath}` : metadata.coverPath;
      const coverFile = zip.file(fullCoverPath) || zip.file(metadata.coverPath);
      if (coverFile) {
        const coverBuffer = await coverFile.async('arraybuffer');
        const mime = metadata.coverPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const blob = new Blob([coverBuffer], { type: mime });
        coverBlobUrl = URL.createObjectURL(blob);
      }
    }

    return {
      zip,
      packageData: {
        metadata,
        manifest,
        spine,
        toc,
        opfPath,
        opfDir,
      },
      coverBlobUrl,
    };
  }

  private extractMetadata(opfDoc: Document, _opfDir: string): EpubMetadata {
    const getMetaText = (tagName: string) => {
      const el = opfDoc.querySelector(`metadata > ${tagName}`) || opfDoc.querySelector(tagName);
      return el?.textContent?.trim() || '';
    };

    const title = getMetaText('title') || getMetaText('dc\\:title') || 'Untitled Ebook';
    const author = getMetaText('creator') || getMetaText('dc\\:creator') || 'Unknown Author';
    const publisher = getMetaText('publisher') || getMetaText('dc\\:publisher');
    const language = getMetaText('language') || getMetaText('dc\\:language') || 'en';
    const description = getMetaText('description') || getMetaText('dc\\:description');

    // Find cover image ID
    let coverPath: string | undefined = undefined;
    const coverMeta = opfDoc.querySelector('meta[name="cover"]');
    if (coverMeta) {
      const coverId = coverMeta.getAttribute('content');
      if (coverId) {
        const item = opfDoc.querySelector(`item[id="${coverId}"]`);
        coverPath = item?.getAttribute('href') || undefined;
      }
    }

    if (!coverPath) {
      const coverItem = opfDoc.querySelector('item[properties~="cover-image"]');
      if (coverItem) {
        coverPath = coverItem.getAttribute('href') || undefined;
      }
    }

    return {
      title,
      author,
      publisher,
      language,
      description,
      coverPath,
    };
  }

  private async extractToc(
    zip: JSZip,
    manifest: Record<string, EpubManifestItem>,
    opfDir: string,
    spineTocId?: string | null
  ): Promise<EpubTocItem[]> {
    const toc: EpubTocItem[] = [];

    // Try NCX file first if present
    let ncxItem = spineTocId ? manifest[spineTocId] : undefined;
    if (!ncxItem) {
      ncxItem = Object.values(manifest).find((item) => item.mediaType === 'application/x-dtbncx+xml' || item.href.endsWith('.ncx'));
    }

    if (ncxItem) {
      const ncxPath = opfDir ? `${opfDir}/${ncxItem.href}` : ncxItem.href;
      const ncxFile = zip.file(ncxPath) || zip.file(ncxItem.href);
      if (ncxFile) {
        const ncxXml = await ncxFile.async('text');
        const parser = new DOMParser();
        const ncxDoc = parser.parseFromString(ncxXml, 'application/xml');
        const navPoints = ncxDoc.querySelectorAll('navMap > navPoint');
        navPoints.forEach((np, i) => {
          const label = np.querySelector('navLabel > text')?.textContent?.trim() || `Chapter ${i + 1}`;
          const src = np.querySelector('content')?.getAttribute('src') || '';
          toc.push({ id: `toc-${i}`, label, href: src });
        });
        return toc;
      }
    }

    // Fallback: Check for HTML5 Nav item
    const navItem = Object.values(manifest).find((item) => item.mediaType === 'application/xhtml+xml' && item.href.includes('nav'));
    if (navItem) {
      const navPath = opfDir ? `${opfDir}/${navItem.href}` : navItem.href;
      const navFile = zip.file(navPath) || zip.file(navItem.href);
      if (navFile) {
        const navHtml = await navFile.async('text');
        const parser = new DOMParser();
        const navDoc = parser.parseFromString(navHtml, 'text/html');
        const aElements = navDoc.querySelectorAll('nav a');
        aElements.forEach((a, i) => {
          const label = a.textContent?.trim() || `Section ${i + 1}`;
          const href = a.getAttribute('href') || '';
          toc.push({ id: `nav-${i}`, label, href });
        });
      }
    }

    return toc;
  }

  /**
   * Reads and sanitizes an HTML chapter file from the EPUB archive.
   */
  public async getChapterHtml(zip: JSZip, href: string, opfDir: string): Promise<string> {
    const fullPath = opfDir ? `${opfDir}/${href}` : href;
    const file = zip.file(fullPath) || zip.file(href);
    if (!file) {
      return '<p class="text-red-500">Chapter content could not be loaded.</p>';
    }

    const htmlContent = await file.async('text');
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Remove script tags for security
    doc.querySelectorAll('script').forEach((el) => el.remove());

    return doc.body.innerHTML;
  }
}

export const epubParserService = new EpubParserService();
