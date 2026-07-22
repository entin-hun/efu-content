'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LOCALE, type Locale, LOCALES } from '@/lib/i18n';

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
 * Loads the raw `about.json` object for the active locale with the
 * standard locale -> HU -> EN fallback chain.
 *
 * Why not use flatten/makeT? Because the standard `flatten()` in
 * `lib/i18n/index.ts` drops arrays (it only flattens object -> string
 * leaves). The Rólunk page needs array values for `ruleset.standUpPoints`
 * and `ruleset.hybridPoints`, so we load the full JSON and let callers
 * traverse it directly.
 *
 * Returns `null` until the first effect tick resolves — callers should
 * render a skeleton or the HU fallback while waiting.
 */
export function useAboutMessages(): {
  about: Record<string, unknown> | null;
  locale: Locale;
  ready: boolean;
} {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [about, setAbout] = useState<Record<string, unknown> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const active = readLocaleCookie();
    let cancelled = false;
    (async () => {
      try {
        const [mod, huMod, enMod] = await Promise.all([
          import(`@/messages/${active}/about.json`),
          import('@/messages/hu/about.json'),
          import('@/messages/en/about.json'),
        ]);
        if (cancelled) return;
        const dict = (mod as { default: Record<string, unknown> }).default;
        const huDict = (huMod as { default: Record<string, unknown> }).default;
        const enDict = (enMod as { default: Record<string, unknown> }).default;
        // requested -> hu -> en shallow overlay at the top level
        const overlay: Record<string, unknown> = { ...enDict, ...huDict, ...dict };
        setAbout(overlay);
        setLocale(active);
      } catch {
        setAbout(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { about, locale, ready };
}

/**
 * Walks a dotted path through a nested object, returning the leaf value
 * or undefined. Supports objects and arrays at any level.
 */
export function getPath(obj: Record<string, unknown> | null | undefined, path: string): unknown {
  if (!obj) return undefined;
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

export function getString(obj: Record<string, unknown> | null | undefined, path: string, fallback = ''): string {
  const v = getPath(obj, path);
  return typeof v === 'string' ? v : fallback;
}

export function getArray(obj: Record<string, unknown> | null | undefined, path: string): string[] {
  const v = getPath(obj, path);
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string');
  return [];
}