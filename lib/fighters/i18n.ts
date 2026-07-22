/**
 * i18n helper for the Harcosok (Fighters) feature.
 *
 * Loads `messages/<locale>/harcosok.json` with the same fallback chain
 * the rest of the project uses: requested locale → hu → en → empty.
 * Returns a flat dot-keyed dictionary so call sites read like
 * `t('listing.title')` and `t('profile.bio.born')`.
 *
 * When the L1-I18N card swaps the project-wide i18n to next-intl, this
 * loader becomes a one-liner: `t` is replaced with the library's hook.
 */

import { type Locale, DEFAULT_LOCALE } from '@/lib/i18n';
import { flatten, type MessageDict } from '@/lib/i18n';

const NAMESPACE = 'harcosok';

/** Secondary fallback locale (en) when the requested + hu are missing. */
const FALLBACK_LOCALE: Locale = 'en';

/**
 * Load harcosok messages for a locale. Falls back through hu → en → {}.
 * Uses the L1-I18N loader's signature (locale, namespace) so the swap
 * to next-intl is mechanical.
 */
export async function loadHarcosokMessages(
  locale: Locale,
): Promise<MessageDict> {
  const seen = new Set<Locale>();
  const order: Locale[] = [locale];
  if (locale !== DEFAULT_LOCALE) order.push(DEFAULT_LOCALE);
  if (locale !== FALLBACK_LOCALE && FALLBACK_LOCALE !== DEFAULT_LOCALE) {
    order.push(FALLBACK_LOCALE);
  }

  for (const loc of order) {
    if (seen.has(loc)) continue;
    seen.add(loc);
    try {
      const mod = (await import(
        `@/messages/${loc}/${NAMESPACE}.json`
      )) as { default: Record<string, unknown> };
      return flatten(mod.default as Record<string, unknown>);
    } catch {
      // try the next locale in the chain
    }
  }
  return {};
}

/**
 * Build a `t(key)` function for the harcosok namespace. Mirrors the
 * pattern used by `lib/i18n/index.ts#makeT`.
 */
export function makeHarcosokT(
  messages: MessageDict,
  fallback?: MessageDict,
): (key: string) => string {
  return function t(key: string): string {
    if (key in messages) return messages[key];
    if (fallback && key in fallback) return fallback[key];
    return key;
  };
}

/**
 * Convenience: load messages for the given locale AND a hu fallback,
 * then return a single `t(key)` function. Most server components will
 * use this — call it once at the top of the page.
 */
export async function getHarcosokT(
  locale: Locale,
): Promise<(key: string) => string> {
  const [primary, fallback] = await Promise.all([
    loadHarcosokMessages(locale),
    locale === DEFAULT_LOCALE
      ? Promise.resolve({} as MessageDict)
      : loadHarcosokMessages(DEFAULT_LOCALE),
  ]);
  return makeHarcosokT(primary, fallback);
}
