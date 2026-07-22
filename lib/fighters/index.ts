/**
 * Public API for the fighters feature.
 *
 * Re-exports types, storage helpers, and i18n helpers so call sites only
 * need one import:
 *
 *   import { readFighter, pickLocalized, getHarcosokT } from '@/lib/fighters';
 *
 * Mirrors the convention used by the other lib/ subdirectories in this
 * project (e.g. `@/lib/auth`, `@/lib/i18n`).
 */

export * from './types';
export {
  readAllFighters,
  readFighter,
  readPublishedFighters,
  readFighterSlugs,
  writeAllFighters,
  upsertFighter,
  deleteFighter,
  pickLocalized,
  toSummary,
  slugify,
  isRtl,
} from './storage';
export {
  loadHarcosokMessages,
  makeHarcosokT,
  getHarcosokT,
} from './i18n';
