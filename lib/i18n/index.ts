/**
 * i18n layer — lightweight, dependency-free message loader.
 *
 * Today: reads JSON from /messages/{locale}/application.json.
 * Tomorrow (when L1-I18N lands at t_b4af2893): swap the `loadMessages`
 * implementation to whatever next-intl / next-i18next exposes; the
 * components keep their `t('application.field.name')` call sites.
 *
 * The 9 EFU locales are: hu (default), en, sk, ro, de, ar, hr, sr, sl.
 * Each gets its own JSON file. Missing keys fall back to HU, then EN.
 */

export type Locale = 'hu' | 'en' | 'sk' | 'ro' | 'de' | 'ar' | 'hr' | 'sr' | 'sl';

export const LOCALES: Locale[] = ['hu', 'en', 'sk', 'ro', 'de', 'ar', 'hr', 'sr', 'sl'];
export const DEFAULT_LOCALE: Locale = 'hu';

export const LOCALE_LABELS: Record<Locale, string> = {
  hu: 'Magyar',
  en: 'English',
  sk: 'Slovenčina',
  ro: 'Română',
  de: 'Deutsch',
  ar: 'العربية',
  hr: 'Hrvatski',
  sr: 'Srpski',
  sl: 'Slovenščina',
};

export const RTL_LOCALES: ReadonlySet<Locale> = new Set<Locale>(['ar']);

export function isRtl(locale: Locale | string): boolean {
  return RTL_LOCALES.has(locale as Locale);
}

/**
 * Pick the active locale from request-scoped hints. Used inside RSC layouts
 * (cookies/headers). For client components, prefer reading from a context
 * provider that holds the locale + flattened messages.
 */
export function pickLocale(opts: {
  searchParams?: Record<string, string | string[] | undefined>;
  cookieLocale?: string | undefined;
  acceptLanguage?: string | undefined;
}): Locale {
  const fromQuery = Array.isArray(opts.searchParams?.lang)
    ? opts.searchParams?.lang?.[0]
    : opts.searchParams?.lang;
  if (fromQuery && (LOCALES as readonly string[]).includes(fromQuery)) {
    return fromQuery as Locale;
  }
  if (opts.cookieLocale && (LOCALES as readonly string[]).includes(opts.cookieLocale)) {
    return opts.cookieLocale as Locale;
  }
  const al = (opts.acceptLanguage ?? '').toLowerCase();
  for (const loc of LOCALES) {
    if (al.includes(loc)) return loc;
  }
  return DEFAULT_LOCALE;
}

/**
 * Namespace keys. L1-I18N spec at t_b4af2893 lists the full set:
 *   common, nav, home, reality, fightnight, fighters, streaming,
 *   news, sponsors, contact, legal.
 * Until L1-I18N lands we keep `application` for backwards compatibility
 * with the contract-MVP pages.
 */
export type MessageNamespace =
  | 'application'
  | 'common'
  | 'admin'
  | 'nav'
  | 'home'
  | 'reality'
  | 'fightnight'
  | 'fighters'
  | 'streaming'
  | 'news'
  | 'sponsors'
  | 'contact'
  | 'legal';

/** Returns the messages object for a given locale + namespace. */
export async function loadMessages(
  locale: Locale,
  namespace: MessageNamespace = 'application'
): Promise<Record<string, unknown>> {
  try {
    const mod = (await import(`@/messages/${locale}/${namespace}.json`)) as {
      default: Record<string, unknown>;
    };
    return mod.default;
  } catch {
    // Fallback chain: requested locale -> HU -> EN
    if (locale !== 'hu') {
      try {
        const huMod = (await import(`@/messages/hu/${namespace}.json`)) as {
          default: Record<string, unknown>;
        };
        return huMod.default;
      } catch {
        /* noop */
      }
    }
    try {
      const enMod = (await import(`@/messages/en/${namespace}.json`)) as {
        default: Record<string, unknown>;
      };
      return enMod.default;
    } catch {
      return {};
    }
  }
}

/**
 * Flat-key lookup. The JSON files are organized as nested objects but we
 * flatten to dotted keys on load (e.g. `application.fields.nev.label`).
 * Mirrors the next-intl convention so the eventual migration is mechanical.
 */
export type MessageDict = Record<string, string>;

export function flatten(obj: Record<string, unknown>, prefix = ''): MessageDict {
  const out: MessageDict = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Record<string, unknown>, key));
    } else if (typeof v === 'string') {
      out[key] = v;
    }
  }
  return out;
}

export function makeT(messages: MessageDict, fallback?: MessageDict) {
  return function t(key: string): string {
    if (key in messages) return messages[key];
    if (fallback && key in fallback) return fallback[key];
    // Last resort: return the key itself so missing translations are visible.
    return key;
  };
}
