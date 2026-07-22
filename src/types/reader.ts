export type ReaderBackgroundTheme = 'light' | 'dark' | 'sepia';

export type ZoomLevelOption = 'fit-width' | 'fit-page' | number;

export interface TocItem {
  title: string;
  pageNumber: number;
  items?: TocItem[];
}
