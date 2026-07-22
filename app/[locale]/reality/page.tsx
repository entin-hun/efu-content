import { notFound } from 'next/navigation';
import { loadMessages, flatten, LOCALES, isRtl, type Locale } from '@/lib/i18n';
import { RealityView } from '@/app/reality/View';
import type { Metadata } from 'next';

/**
 * Locale-prefixed EFU Reality landing — /{locale}/reality.
 *
 * Renders the SAME component as `/reality`, with:
 *   - messages loaded for `params.locale` (HU default, EN fallback)
 *   - `dir="rtl"` applied when the locale is in `RTL_LOCALES` (currently `ar`)
 *   - `applyHref` pointing at the locale-aware jelentkezz route
 *
 * `generateStaticParams` is intentionally NOT used: the page reads from
 * `messages/{locale}/reality.json` at request time, and we want the page
 * to pick up new locales / new copy without a rebuild.
 *
 * Next 14 + React 18 typing: `params` is a Promise here per the existing
 * sibling pages in this app (see [locale]/harcosok/page.tsx).
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  if (!LOCALES.includes(locale)) {
    return { title: 'EFU Reality' };
  }
  const raw = await loadMessages(locale, 'reality');
  const flat = flatten(raw);
  const title = flat['meta.title'] ?? 'EFU Reality';
  const description =
    flat['meta.description'] ?? 'EFU Reality — the martial-arts talent-search format.';
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `/${locale}/reality`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleRealityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  if (!LOCALES.includes(locale)) {
    notFound();
  }

  const raw = await loadMessages(locale, 'reality');
  const flat = flatten(raw);
  const t = (key: string, fallback?: string): string =>
    flat[key] ?? fallback ?? key;

  return (
    <RealityView
      flat={flat}
      raw={raw}
      t={t}
      applyHref={`/${locale}/jelentkezz`}
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
    />
  );
}
