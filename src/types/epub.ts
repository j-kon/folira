export interface EpubTocItem {
  id: string;
  label: string;
  href: string;
  subitems?: EpubTocItem[];
}

export interface EpubManifestItem {
  id: string;
  href: string;
  mediaType: string;
}

export interface EpubSpineItem {
  idref: string;
  linear?: boolean;
}

export interface EpubMetadata {
  title: string;
  author: string;
  publisher?: string;
  language?: string;
  identifier?: string;
  coverPath?: string;
  description?: string;
}

export interface ParsedEpubPackage {
  metadata: EpubMetadata;
  manifest: Record<string, EpubManifestItem>;
  spine: EpubSpineItem[];
  toc: EpubTocItem[];
  opfPath: string;
  opfDir: string;
}

export interface EpubTypographySettings {
  fontSize: number; // in px, e.g. 18
  fontFamily: 'serif' | 'sans' | 'mono';
  lineHeight: number; // e.g. 1.6
  marginPadding: number; // in px, e.g. 24
}
