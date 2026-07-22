import { ApplicationForm } from '@/components/ApplicationForm';
import { loadMessages, flatten, DEFAULT_LOCALE } from '@/lib/i18n';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jelentkezz harcosnak · EFU Reality 2026',
  description:
    'Jelentkezz az Elite Fight Universe (EFU) Reality 2026-os szezonjába. Töltsd ki az űrlapot, és légy részese a következő EFU Fight Night nemzedéknek.',
  openGraph: {
    title: 'Jelentkezz harcosnak · EFU Reality 2026',
    description:
      'EFU Reality — ahol a következő EFU-harcos-generáció felépül. Jelentkezz most.',
  },
  alternates: {
    canonical: '/jelentkezz',
  },
  robots: { index: true, follow: true },
};

export const dynamic = 'force-dynamic'; // i18n reads filesystem; never prerender

export default async function JelentkezzPage() {
  // Until L1-I18N lands, the page serves the default HU locale.
  // The locale segment /[locale]/jelentkezz also forwards to this page.
  const locale = DEFAULT_LOCALE;
  const raw = await loadMessages(locale, 'application');
  const messages = flatten(raw);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Pitch */}
        <section className="text-center mb-10 animate-fade-in">
          <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-3">
            {messages['hero.eyebrow'] ?? 'EFU Reality · 2026'}
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black uppercase text-white mb-4"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {messages['hero.title'] ?? 'Jelentkezz harcosnak'}
          </h1>
          <p
            className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
            dangerouslySetInnerHTML={{
              __html:
                (messages['hero.body'] ?? '')
                  .toString()
                  .replace(/\n/g, '<br />'),
            }}
          />
        </section>

        {/* Perks strip */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 text-center">
          <Perk
            icon="🥊"
            title={messages['perk.training.title'] ?? 'Profi felkészítés'}
            sub={messages['perk.training.sub'] ?? 'EFU edzői stáb'}
          />
          <Perk
            icon="📺"
            title={messages['perk.media.title'] ?? 'Média-megjelenés'}
            sub={messages['perk.media.sub'] ?? 'EFU TV + Fight Night'}
          />
          <Perk
            icon="🏆"
            title={messages['perk.prize.title'] ?? '10 000 000 HUF'}
            sub={messages['perk.prize.sub'] ?? 'Fődíj + szerződés'}
          />
        </section>

        {/* Form */}
        <ApplicationForm
          locale={locale}
          messages={messages}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />

        {/* Footer reassurance */}
        <p className="text-xs text-gray-500 text-center mt-6 max-w-md mx-auto">
          {messages['form.disclaimer'] ??
            'Adataidat az EFU kizárólag a jelentkezés feldolgozásához használja. A GDPR-hozzájárulás bármikor visszavonható.'}
        </p>
      </div>
    </main>
  );
}

function Perk({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="card-dark rounded-xl px-4 py-5">
      <div className="text-3xl mb-1">{icon}</div>
      <p className="text-white font-bold text-sm uppercase tracking-wide">{title}</p>
      <p className="text-gray-500 text-xs mt-1">{sub}</p>
    </div>
  );
}
