'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LOCALE, type Locale, LOCALES, flatten, makeT, type MessageDict } from '@/lib/i18n';

/**
 * Reads the NEXT_LOCALE cookie set by the layout's pickLocale() and falls
 * back to navigator.language when the cookie is missing. Returns a t(key)
 * helper that resolves through the requested locale -> HU -> EN chain,
 * matching the fallback rules in lib/i18n.
 */
function readLocaleCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const m = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const fromCookie = m?.[1];
  if (fromCookie && (LOCALES as readonly string[]).includes(fromCookie)) {
    return fromCookie as Locale;
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    const lang = navigator.language.toLowerCase();
    for (const loc of LOCALES) {
      if (lang.includes(loc)) return loc;
    }
  }
  return DEFAULT_LOCALE;
}

interface HeroMessages {
  t: (key: string) => string;
  locale: Locale;
}

/**
 * Client-side loader for the homeHero + social namespace.
 *
 * Loads `messages/{locale}/application.json`, then overlays HU (default)
 * and EN (canonical fallback) on top, so any missing key still renders
 * meaningful copy instead of the raw key. Same logic as the SSR
 * `loadMessages` chain in lib/i18n — duplicated here because we cannot
 * `await import()` of the JSON files from a server boundary in a client
 * component without dynamic boundaries.
 */
export function useHeroMessages(): HeroMessages {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [t, setT] = useState<(k: string) => string>(() => (k: string) => k);

  useEffect(() => {
    const active = readLocaleCookie();
    let cancelled = false;
    (async () => {
      try {
        const mod = (await import(`@/messages/${active}/application.json`)) as {
          default: Record<string, unknown>;
        };
        const huMod = (await import('@/messages/hu/application.json')) as {
          default: Record<string, unknown>;
        };
        const enMod = (await import('@/messages/en/application.json')) as {
          default: Record<string, unknown>;
        };
        if (cancelled) return;
        const dict = flatten(mod.default);
        const huDict = flatten(huMod.default);
        const enDict = flatten(enMod.default);
        // requested -> hu (default render) -> en (canonical fallback) -> key
        const overlay: MessageDict = { ...enDict, ...huDict, ...dict };
        setT(makeT(dict, overlay));
        setLocale(active);
      } catch {
        // best-effort: keep identity t
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { t, locale };
}