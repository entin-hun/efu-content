import { defineRouting } from 'next-intl/routing';

/**
 * EFU locale configuration.
 *
 * Locales are ordered by strategic priority for the launch:
 *   hu (default) → en → de → ar → sk → ro → hr → sr → sl
 *
 * - hu is the default (EFU's home market: Budapest).
 * - en is the lingua franca for international fans and the contract MVP backer.
 * - de follows because of the substantial German-speaking fight-sport audience.
 * - ar covers the MENA market — the only RTL locale in this set.
 * - The remaining Central European locales (sk, ro, hr, sr, sl) share the
 *   "küzdelem" tradition and complete the regional reach.
 *
 * `localePrefix: 'always'` guarantees `/hu/...` URLs, which keeps every
 * locale routable, shareable, and SEO-indexable independently.
 */
export const routing = defineRouting({
  locales: ['hu', 'en', 'de', 'ar', 'sk', 'ro', 'hr', 'sr', 'sl'],
  defaultLocale: 'hu',
  localePrefix: 'always',
  localeDetection: true,
});

/**
 * Locales whose script reads right-to-left. Used by the layout to set the
 * `dir` attribute on <html> so CSS logical properties and form controls
 * mirror automatically.
 */
export const RTL_LOCALES = new Set<string>(['ar']);

/**
 * Human-readable native names for the language switcher.
 * Keyed by locale code. Sourced from each language's own Wikipedia/ISO
 * conventions; these are the names the speakers themselves use.
 */
export const LOCALE_LABELS: Record<(typeof routing.locales)[number], string> = {
  hu: 'Magyar',
  en: 'English',
  de: 'Deutsch',
  ar: 'العربية',
  sk: 'Slovenčina',
  ro: 'Română',
  hr: 'Hrvatski',
  sr: 'Srpski',
  sl: 'Slovenščina',
};

/**
 * ISO 3166 country codes for the language switcher flag chip.
 * Optional decoration — not a primary identifier.
 */
export const LOCALE_FLAGS: Record<(typeof routing.locales)[number], string> = {
  hu: '🇭🇺',
  en: '🇬🇧',
  de: '🇩🇪',
  ar: '🇸🇦',
  sk: '🇸🇰',
  ro: '🇷🇴',
  hr: '🇭🇷',
  sr: '🇷🇸',
  sl: '🇸🇮',
};