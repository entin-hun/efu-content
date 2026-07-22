import { redirect } from 'next/navigation';
import { LOCALES, type Locale, DEFAULT_LOCALE } from '@/lib/i18n';

/**
 * Locale-prefixed entry point — /{locale}/rolunk.
 *
 * Today (L1-I18N not yet landed): redirects unsupported/non-hu locales
 *   to /rolunk (HU default). When L1-I18N ships, this file should
 *   be deleted in favor of a unified /[locale]/rolunk/page.tsx that
 *   reads `params.locale` and forwards it to the RolunkPage component
 *   (which already supports all 9 locales via the NEXT_LOCALE cookie).
 *
 * Mirrors /[locale]/reality/page.tsx and /[locale]/harcosok/page.tsx.
 */
export default async function LocaleRolunkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) {
    redirect('/rolunk');
  }
  if (locale !== DEFAULT_LOCALE) {
    // Forward non-default locales to the default for now — same content, HU copy.
    // L1-I18N (t_b4af2893) will replace this with a locale-aware renderer.
    redirect('/rolunk');
  }
  redirect('/rolunk');
}