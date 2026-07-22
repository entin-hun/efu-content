/**
 * CMS típusok definíciója
 * 
 * Ez a fájl tartalmazza a CMS rendszer összes típusát:
 * - Page: oldalak
 * - Block: tartalmi blokkok
 * - Media: média fájlok
 */

import type { Locale } from '@/lib/i18n';

/** Localized string - egy szöveg több nyelven */
export type LocalizedString = Partial<Record<Locale, string>>;

/** Block típusok */
export type BlockType = 
  | 'hero'
  | 'text'
  | 'image'
  | 'video'
  | 'gallery'
  | 'cta'
  | 'divider'
  | 'spacer';

/** Block elrendezés */
export type BlockLayout = 'full' | 'wide' | 'narrow' | 'split';

/** Egy tartalmi blokk */
export interface Block {
  id: string;
  type: BlockType;
  layout: BlockLayout;
  content: Record<string, any>;
  settings: {
    className?: string;
    backgroundColor?: string;
    padding?: 'none' | 'small' | 'medium' | 'large';
  };
  order: number;
  visible: boolean;
}

/** SEO metaadatok */
export interface SeoMetadata {
  title: LocalizedString;
  description: LocalizedString;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

/** Egy oldal */
export interface Page {
  id: string;
  slug: string;
  title: LocalizedString;
  blocks: Block[];
  seo: SeoMetadata;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

/** Média fájl */
export interface Media {
  id: string;
  url: string;
  alt: LocalizedString;
  caption?: LocalizedString;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}

/** CMS storage interface */
export interface CmsStorage {
  // Pages
  readAllPages(): Promise<Page[]>;
  readPage(slug: string): Promise<Page | null>;
  readPublishedPages(): Promise<Page[]>;
  upsertPage(page: Page): Promise<void>;
  deletePage(slug: string): Promise<void>;
  
  // Media
  readAllMedia(): Promise<Media[]>;
  readMedia(id: string): Promise<Media | null>;
  upsertMedia(media: Media): Promise<void>;
  deleteMedia(id: string): Promise<void>;
}
