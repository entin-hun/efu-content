'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LOCALE, type Locale, LOCALES, flatten, makeT, type MessageDict } from '@/lib/i18n';

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

/**
 * Loads a message namespace for the active locale with the standard
 * locale -> HU -> EN fallback chain. Mirrors `useHeroMessages` but is
 * namespace-agnostic so the Rólunk page can pull `about.json` without
 * duplicating the loader.
 *
 * @param namespace  one of MessageNamespace (defaults to 'about')
 */
export function useI18nMessages(namespace: 'about' | 'application' = 'about'): {
  t: (key: string) => string;
  locale: Locale;
  ready: boolean;
} {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [t, setT] = useState<(k: string) => string>(() => (k: string) => k);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const active = readLocaleCookie();
    let cancelled = false;
    (async () => {
      try {
        const [mod, huMod, enMod] = await Promise.all([
          import(`@/messages/${active}/${namespace}.json`),
          import(`@/messages/hu/${namespace}.json`),
          import(`@/messages/en/${namespace}.json`),
        ]);
        if (cancelled) return;
        const dict = flatten((mod as { default: Record<string, unknown> }).default);
        const huDict = flatten((huMod as { default: Record<string, unknown> }).default);
        const enDict = flatten((enMod as { default: Record<string, unknown> }).default);
        const overlay: MessageDict = { ...enDict, ...huDict, ...dict };
        setT(makeT(dict, overlay));
        setLocale(active);
      } catch {
        // best-effort: keep identity t
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [namespace]);

  return { t, locale, ready };
}