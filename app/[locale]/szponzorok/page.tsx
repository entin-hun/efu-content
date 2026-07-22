import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadMessages, flatten, LOCALES, isRtl, type Locale } from '@/lib/i18n';
import { SzponzorokView } from '@/app/szponzorok/View';

/**
 * Locale-prefixed EFU Szponzorok page — `/{locale}/szponzorok`.
 *
 * Renders the SAME component as `/szponzorok`, with:
 *   - messages loaded for `params.locale` (HU default fallback)
 *   - `dir="rtl"` applied when the locale is in `RTL_LOCALES` (currently `ar`)
 *
 * Mirrors `/[locale]/reality/page.tsx`.
 *
 * `generateStaticParams` is intentionally NOT used: the page reads from
 * `messages/{locale}/sponsors.json` at request time, and we want the page
 * to pick up new locales / new copy without a rebuild.
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
    return { title: 'Sponsors · EFU' };
  }
  const raw = await loadMessages(locale, 'sponsors');
  const flat = flatten(raw);
  const title = flat['meta.title'] ?? 'Sponsors · EFU';
  const description =
    flat['meta.description'] ??
    'EFU sponsorship tiers — visibility across the galas, broadcasts and digital platforms.';
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `/${locale}/szponzorok` },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleSzponzorokPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  if (!LOCALES.includes(locale)) {
    notFound();
  }

  const raw = await loadMessages(locale, 'sponsors');
  const flat = flatten(raw);
  const t = (key: string, fallback?: string): string =>
    flat[key] ?? fallback ?? key;

  return (
    <SzponzorokView
      flat={flat}
      raw={raw}
      t={t}
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
      lang={locale}
    />
  );
}