import { z } from 'zod';
export type SearchTerms = 'authors' | 'title' | 'publisher' | 'subject';

export type SearchObject = {
  term: SearchTerms;
  value: string;
};

export enum MaturityRating {
  'NOT_MATURE' = 'NOT_MATURE',
  'MATURE' = 'MATURE',
}

export type IndustryIdentifier = {
  type: string;
  identifier: string;
};

export type ReadingMode = {
  text: boolean;
  image: boolean;
};

export type VolumeInfo = {
  title: string;
  authors: string[];
  publishedDate: string; // year
  industryIdentifiers: IndustryIdentifier[];
  description: string;
  readingModes: ReadingMode;
  pageCount: number;
  printType: string;
  categories: string[];
  publisher?: string;
};

export type PanelizationSummary = {
  containsEpubBubbles: boolean;
  containsImageBubbles: boolean;
};

export type ImageLinks = {
  smallThumbnail: string; // encoded URI
  thumbnail: string; // encoded URI
};

export type Book = {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: VolumeInfo;
  saleInfo: unknown;
  accessInfo: unknown;
  searchInfo: unknown;
  maturityRating?: MaturityRating;
  allowAnonLogging?: boolean;
  contentVersion?: string;
  panelizationSummary?: PanelizationSummary;
  imageLinks?: ImageLinks;
  language?: string;
  previewLink?: string; // nice readable preview
  infoLink?: string; // store link
  canonicalVolumeLink?: string;
};

export type SuccessfulGoogleResponse = {
  kind: string;
  totalItems: number;
  items: Book[];
};

export enum Relevance {
  PERFECT = 1,
  VERY_GOOD = 2,
  GOOD = 3,
  MEDIOCRE = 4,
  BAD = 5,
  VERY_BAD = 6,
  NO_SUGGESTION = 7,
}

export type SuggestionResult = {
  relevance: Relevance;
  books: Book[];
};

export const BookSearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  startIndex: z
    .string()
    .transform((val): number => parseInt(val, 10))
    .pipe(z.number().int().min(0))
    .optional(),
  maxResults: z
    .string()
    .transform((val): number => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(40))
    .optional(),
});
