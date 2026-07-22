import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  readPublishedFighters,
  pickLocalized,
  toSummary,
  isRtl,
} from '@/lib/fighters';
import { loadMessages, flatten, DEFAULT_LOCALE } from '@/lib/i18n';

export const dynamic = 'force-dynamic'; // storage reads filesystem; never prerender

export const metadata: Metadata = {
  title: 'Harcosok · EFU — Elite Fight Universe',
  description:
    'Ismerd meg az EFU Reality és EFU Fight Night harcosait — a történetüket, az EFU útjukat és a mérlegüket. Friss profilok, fotók, eddigi mérkőzések.',
  alternates: { canonical: '/harcosok' },
  openGraph: {
    title: 'Harcosok · EFU — Elite Fight Universe',
    description:
      'Az EFU harcosai — Reality, Fight Night és profi karrierút. Profilok, történetek, EFU út, mérleg.',
    url: '/harcosok',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'EFU Harcosok' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harcosok · EFU — Elite Fight Universe',
    description:
      'Az EFU harcosai — Reality, Fight Night és profi karrierút. Profilok, történetek, EFU út, mérleg.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
};

/**
 * Public listing of all published EFU fighters. Server component —
 * reads the JSON store (file-backed today, Postgres when L1-DB lands),
 * localises via the harcosok.json catalog, and renders a responsive
 * grid of summary cards.
 */
export default async function HarcosokPage() {
  const locale = DEFAULT_LOCALE;
  const tRaw = await loadMessages(locale, 'application'); // listing chrome uses generic messages
  const tApp = flatten(tRaw);
  // ...but the catalog we actually key off is harcosok.json (already localized
  // by the loader in getHarcosokT); we use that for listing.* / profile.* chrome.
  const { getHarcosokT } = await import('@/lib/fighters');
  const t = await getHarcosokT(locale);

  const fighters = await readPublishedFighters();
  const summaries = fighters.map((f) => toSummary(f, locale));

  // Build a JSON-LD ItemList for SEO (one entry per fighter).
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'EFU Harcosok',
    description: t('listing.subtitle'),
    numberOfItems: summaries.length,
    itemListElement: summaries.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `/harcosok/${s.slug}`,
      name: `${s.name}${s.nickname ? ` — ${s.nickname}` : ''}`,
    })),
  };

  return (
    <main
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
      className="min-h-screen pt-24 pb-16 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Hero strip */}
        <header className="text-center mb-12 animate-fade-in">
          <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-3">
            {t('listing.title')}
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black uppercase text-white mb-4"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {t('listing.title')}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {t('listing.subtitle')}
          </p>
        </header>

        {/* Listing grid */}
        {summaries.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-16">
            {t('listing.empty')}
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map((f) => (
              <li key={f.slug}>
                <Link
                  href={`/harcosok/${f.slug}`}
                  className="group block card-dark rounded-2xl overflow-hidden transition-all hover:border-brand-red/60 hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-brand-dark-muted">
                    <Image
                      src={f.photo}
                      alt={f.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] blur-sm"
                    />
                    {/* Homályosítás overlay */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                    {/* Country badge */}
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-bold bg-black/70 px-2 py-1 rounded">
                      {f.country}
                    </span>
                  </div>
                  <div className="p-4">
                    <p
                      className="text-lg font-black text-white uppercase tracking-tight truncate blur-[2px] select-none"
                      style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
                    >
                      {f.name}
                    </p>
                    {f.nickname && (
                      <p className="text-brand-gold text-xs italic mt-0.5 truncate blur-[1px] select-none">
                        {f.nickname}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-2 truncate">
                      {f.weightClass}
                      {f.hometown ? ` · ${f.hometown}` : ''}
                    </p>

                    {/* EFU path teaser */}
                    {f.efuPathTeaser && (
                      <div className="mt-3 pt-3 border-t border-brand-dark-border">
                        <p className="text-[10px] uppercase tracking-widest text-gray-600">
                          {t('profile.efuPathTeaser')}
                        </p>
                        <p className="text-white text-sm mt-0.5 truncate blur-[1px] select-none">
                          {f.efuPathTeaser.title}
                        </p>
                      </div>
                    )}

                    {/* Record strip */}
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-[10px] uppercase tracking-widest text-gray-600">
                        {t('listing.fightRecord')}
                      </span>
                      <span
                        className="text-brand-gold text-sm font-bold tabular-nums"
                        aria-label={t('profile.record')}
                      >
                        {f.record.wins}-{f.record.losses}-{f.record.draws}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Listing application prompt */}
        {summaries.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm mb-3">
              {tApp['listing.cta'] ?? 'Szeretnél Te is EFU-harcos lenni?'}
            </p>
            <Link
              href="/jelentkezz"
              className="inline-block gradient-red text-white font-bold uppercase text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              {tApp['listing.ctaButton'] ?? 'Jelentkezz harcosnak'}
            </Link>
          </div>
        )}
      </div>

      {/* JSON-LD ItemList for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
    </main>
  );
}
