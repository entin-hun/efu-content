import type { Metadata } from 'next';
import { loadMessages, flatten, DEFAULT_LOCALE } from '@/lib/i18n';
import { SzponzorokView } from './View';

export const dynamic = 'force-dynamic'; // i18n reads filesystem; never prerender

export const metadata: Metadata = {
  title: 'Szponzorok és partnerek · EFU — Elite Fight Universe',
  description:
    'Az EFU szponzorai a harcművészeti tehetségkutatás és a gálasorozat mellé állnak. Ismerd meg a partnerszinteket, a Reality és Fight Night integrációs lehetőségeket, és lépj velünk kapcsolatba.',
  alternates: { canonical: '/szponzorok' },
  openGraph: {
    title: 'Szponzorok és partnerek · EFU — Elite Fight Universe',
    description:
      'EFU partnerszintek (Bronz / Ezüst / Arany / Reality-integráció / Fight Night-integráció) — láthatóság a gálákon, a közvetítésekben és a digitális platformjainkon.',
    url: '/szponzorok',
    type: 'website',
    images: [
      { url: '/og-image.jpg', width: 1200, height: 630, alt: 'EFU Szponzorok' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Szponzorok és partnerek · EFU',
    description:
      'Csatlakozz az EFU partnereihez — öt partnerszint, Reality és Fight Night integráció, kilenc piac.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
};

/**
 * Public partner / sponsor page — canonical HU route (`/szponzorok`).
 *
 * All rendering lives in `./View.tsx` so the locale-prefixed route
 * (`/{locale}/szponzorok`) can use the exact same component with the
 * active locale's messages. Until L1-I18N ships, `/szponzorok` is the
 * canonical landing path; locale-prefixed routes also render it (see
 * `app/[locale]/szponzorok/page.tsx`).
 *
 * Translations live in `/messages/{locale}/sponsors.json` — all 9 locales
 * ship with this card. Pricing is intentionally TBD — operator sets real
 * numbers in admin.
 */
export default async function SzponzorokPage() {
  const locale = DEFAULT_LOCALE;
  const raw = await loadMessages(locale, 'sponsors');
  const flat = flatten(raw);
  const t = (key: string, fallback?: string): string =>
    flat[key] ?? fallback ?? key;

  return (
    <SzponzorokView
      flat={flat}
      raw={raw}
      t={t}
      dir="ltr"
      lang="hu"
    />
  );
}