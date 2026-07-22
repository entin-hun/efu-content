import { loadMessages, flatten, DEFAULT_LOCALE } from '@/lib/i18n';
import { RealityView } from './View';
import type { Metadata } from 'next';

/**
 * EFU Reality landing — /reality (HU canonical).
 *
 * Sections (per L3-REALITY-PAGE acceptance criteria):
 *   - Hero (eyebrow + dual-line title + tagline + status pill)
 *   - A Ház (house description + 6 zones)
 *   - Szabályok (5 ruleset items)
 *   - Mentorok (4 mentor cards)
 *   - Versenyzők (8 silhouettes — no real identities pre-launch)
 *   - Nyeremény (Hamarosan… pre-launch OR 10M HUF + EFU contract at launch)
 *   - Jelentkezz harcosnak CTA (cross-link to /jelentkezz)
 *
 * The actual JSX lives in `./View.tsx` so the same component can render
 * the canonical HU route AND the locale-prefixed route `/{locale}/reality`
 * with a different `messages` map and `dir`. See `app/[locale]/reality/page.tsx`.
 *
 * 9-locale i18n: `loadMessages()` reads /messages/{locale}/reality.json
 * (HU default, EN fallback). The `meta` namespace fields drive `metadata`.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const raw = await loadMessages(DEFAULT_LOCALE, 'reality');
  const flat = flatten(raw);
  const title = flat['meta.title'] ?? 'EFU Reality · A Ház';
  const description =
    flat['meta.description'] ??
    'Az EFU Reality a harcművészeti tehetségkutató formátumunk: a Ház, a Szabályok, a Mentorok, a Versenyzők és a Nyeremény.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    alternates: {
      canonical: '/reality',
    },
    robots: { index: true, follow: true },
  };
}

export default async function RealityPage() {
  // Canonical HU locale.
  const raw = await loadMessages(DEFAULT_LOCALE, 'reality');
  const flat = flatten(raw);
  const t = (key: string, fallback?: string): string =>
    flat[key] ?? fallback ?? key;

  return (
    <RealityView
      flat={flat}
      raw={raw}
      t={t}
      applyHref="/jelentkezz"
      dir="ltr"
    />
  );
}
