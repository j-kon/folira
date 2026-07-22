export interface SearchBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SearchMatch {
  id: string;
  pageNumber: number;
  textSnippet: string;
  matchIndex: number;
  totalMatchesOnPage: number;
  boundingBoxes?: SearchBoundingBox[];
}

export interface TocOutlineItem {
  id: string;
  title: string;
  pageNumber: number;
  dest?: any;
  items?: TocOutlineItem[];
}
