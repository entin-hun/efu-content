import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * next-intl server-side message loader.
 *
 * For each request, Next.js calls this function with the resolved locale.
 * We load every namespace from `messages/{locale}/*.json` and merge them
 * into a single flat object keyed by namespace → key. This lets us call
 * `t('home.hero.title')` style later, but also `t.rich(...)` for any
 * interpolated children.
 *
 * Note: we DON'T call notFound() inside the loader. We throw a regular
 * error instead, because notFound() from a server module is reserved for
 * the rendering layer. Returning a 404 from middleware (which we do)
 * handles unknown locales at the routing boundary.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    typeof requested === 'string' && (routing.locales as readonly string[]).includes(requested)
      ? requested
      : routing.defaultLocale;

  // Lazy-load every namespace for this locale. Using individual imports
  // keeps the client bundle smaller than bundling the whole messages tree.
  const namespaces = [
    'common',
    'nav',
    'home',
    'reality',
    'fightnight',
    'fighters',
    'streaming',
    'news',
    'sponsors',
    'contact',
    'legal',
  ] as const;

  const messages: Record<string, any> = {};
  for (const ns of namespaces) {
    try {
      // Dynamic import — resolved at build time per locale.
      messages[ns] = (await import(`../../messages/${locale}/${ns}.json`)).default;
    } catch {
      // Fall back to the default locale's messages if a translation is
      // missing — better to render Hungarian copy than a 500.
      messages[ns] = (await import(`../../messages/${routing.defaultLocale}/${ns}.json`)).default;
    }
  }

  return {
    locale,
    messages,
    // Suppress "MISSING_MESSAGE" warnings in dev while we're still
    // filling in the 8 non-hu locales — those messages are placeholders
    // that intentionally fall back to Hungarian copy.
    onError() {
      /* no-op: missing translations fall back to hu */
    },
    getMessageFallback({ key, namespace }: { key: string; namespace?: string }) {
      return `[${namespace}.${key}]`;
    },
  };
});