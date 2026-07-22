import { redirect } from 'next/navigation';
import { LOCALES, type Locale, DEFAULT_LOCALE } from '@/lib/i18n';

/**
 * Locale-prefixed entry point — /{locale}/jelentkezz.
 *
 * Today (L1-I18N not yet landed): redirects unsupported/non-hu locales
 *   to /jelentkezz (HU default). When L1-I18N ships, this file should
 *   be deleted in favor of the unified /[locale]/jelentkezz/page.tsx
 *   that the L1 worker will create.
 */
export default async function LocaleJelentkezzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) {
    redirect('/jelentkezz');
  }
  if (locale !== DEFAULT_LOCALE) {
    // Forward non-default locales to the default for now — same form, HU copy.
    // L1-I18N (t_b4af2893) will replace this with a locale-aware renderer.
    redirect('/jelentkezz');
  }
  redirect('/jelentkezz');
}
