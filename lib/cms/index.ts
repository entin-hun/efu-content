/**
 * CMS Module - Barrel Export
 * 
 * Ez a fájl összegyűjti és exportálja a CMS modul típusait és storage függvényeit.
 * A komponensek a components/cms/ könyvtárban találhatók.
 */

// Types
export type {
  Page,
  Block,
  BlockType,
  BlockLayout,
  Media,
  LocalizedString,
  SeoMetadata,
  CmsStorage,
} from './types';

// Storage
export { pagesStorage, mediaStorage, initializeSeedData, SEED_PAGES } from './storage';
