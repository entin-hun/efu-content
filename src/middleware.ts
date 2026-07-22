import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Locale detection + URL rewriting middleware.
 *
 * What it does, in order:
 *   1. `/` or `/foo` → redirects to `/{defaultLocale}/foo` (e.g. `/hu`).
 *   2. A path like `/hu/about` is passed through (locale prefix present).
 *   3. A path like `/en/about` is passed through.
 *   4. API routes (`/api/*`) are NOT touched — they're locale-agnostic.
 *   5. Static assets (`/_next/*`, `/favicon.ico`, etc.) are skipped.
 *   6. The user's preferred locale is remembered via a cookie so subsequent
 *      visits to `/` redirect straight to their last locale without a
 *      Accept-Language round-trip.
 *
 * `localeDetection: true` (in routing.ts) lets next-intl fall back to the
 * Accept-Language header for first-time visitors with no cookie.
 */
export default createMiddleware(routing);

export const config = {
  // Run middleware on every path EXCEPT:
  //  - /api/*           (API routes — locale-agnostic)
  //  - /_next/*         (Next.js internals)
  //  - /favicon.ico, /robots.txt, /sitemap.xml, /manifest.json, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};