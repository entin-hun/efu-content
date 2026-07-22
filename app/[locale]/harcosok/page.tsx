import { redirect } from 'next/navigation';
import { LOCALES, type Locale, DEFAULT_LOCALE } from '@/lib/i18n';

/**
 * Locale-prefixed entry point — /{locale}/harcosok.
 *
 * Today (L1-I18N not yet landed): redirects unsupported/non-hu locales
 *   to /harcosok (HU default). When L1-I18N ships, this file should
 *   be deleted in favor of the unified /[locale]/harcosok/page.tsx
 *   that the L1 worker will create, and the canonical pages will be
 *   moved under /[locale]/harcosok/* accordingly.
 */
export default async function LocaleHarcosokPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) {
    redirect('/harcosok');
  }
  if (locale !== DEFAULT_LOCALE) {
    redirect('/harcosok');
  }
  redirect('/harcosok');
}
