export type ReaderBackgroundTheme = 'light' | 'dark' | 'sepia' | 'paper' | 'night';

export type ZoomLevelOption = 'fit-width' | 'fit-page' | number;

export type SidebarTab = 'info' | 'thumbnails' | 'bookmarks' | 'toc' | 'annotations';

export interface TocItem {
  title: string;
  pageNumber: number;
  items?: TocItem[];
}
