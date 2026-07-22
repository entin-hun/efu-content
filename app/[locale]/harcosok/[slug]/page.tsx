import { redirect } from 'next/navigation';
import { LOCALES, type Locale, DEFAULT_LOCALE } from '@/lib/i18n';

/**
 * Locale-prefixed entry point — /{locale}/harcosok/{slug}.
 *
 * Today (L1-I18N not yet landed): redirects to /harcosok/{slug}.
 *   The canonical HU default page resolves the slug itself, so passing
 *   through preserves the routing intent.
 */
export default async function LocaleHarcosokSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!LOCALES.includes(locale as Locale) || locale !== DEFAULT_LOCALE) {
    redirect(`/harcosok/${slug}`);
  }
  redirect(`/harcosok/${slug}`);
}
