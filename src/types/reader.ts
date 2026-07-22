export type ReaderBackgroundTheme = 'light' | 'dark' | 'sepia' | 'paper' | 'night';

export type ZoomLevelOption = 'fit-width' | 'fit-page' | number;

export interface TocItem {
  title: string;
  pageNumber: number;
  items?: TocItem[];
}
