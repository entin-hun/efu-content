import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  readFighter,
  pickLocalized,
  isRtl,
} from '@/lib/fighters';
import type { FighterVideo } from '@/lib/fighters';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { SharePanelClient } from '@/components/fighters/SharePanelClient';

export const dynamic = 'force-dynamic'; // storage reads filesystem; never prerender

/** Generate static params later (L1) — for now, dynamic. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fighter = await readFighter(slug);
  if (!fighter || !fighter.published) {
    return { title: 'Harcos nem található · EFU' };
  }
  const name = pickLocalized(fighter.name, DEFAULT_LOCALE);
  const intro = pickLocalized(fighter.intro, DEFAULT_LOCALE)
    .replace(/<[^>]+>/g, '')
    .trim()
    .slice(0, 200);
  const photoUrl = fighter.photo.startsWith('http')
    ? fighter.photo
    : fighter.photo; // resolved as-is; Next.Metadata infers absolute from metadataBase

  return {
    title: `${name} · EFU Harcosok`,
    description: intro,
    alternates: { canonical: `/harcosok/${fighter.slug}` },
    openGraph: {
      title: `${name} · EFU Harcosok`,
      description: intro,
      url: `/harcosok/${fighter.slug}`,
      type: 'profile',
      images: [{ url: photoUrl, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} · EFU Harcosok`,
      description: intro,
      images: [photoUrl],
    },
    robots: { index: true, follow: true },
  };
}

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      // /embed/<id>
      const m = u.pathname.match(/\/embed\/([\w-]+)/);
      if (m) return m[1];
    }
  } catch {
    return null;
  }
  return null;
}

function VideoEmbed({ v, title }: { v: FighterVideo; title: string }) {
  if (v.provider === 'youtube') {
    const id = youtubeId(v.url);
    if (!id) {
      return (
        <a
          href={v.url}
          target="_blank"
          rel="noreferrer noopener"
          className="block text-brand-gold text-sm break-all hover:underline"
        >
          {v.url}
        </a>
      );
    }
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden border border-brand-dark-border bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }
  // MP4
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-brand-dark-border bg-black">
      <video
        src={v.url}
        poster={v.poster}
        controls
        preload="metadata"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

/**
 * Public EFU fighter profile. Renders:
 *  - Hero photo + name + nickname + intro
 *  - Biography (rich text / story)
 *  - EFU path timeline (ordered stages)
 *  - Mérleg (record) + fight history
 *  - Videos (YouTube embed or MP4)
 *  - JSON-LD Person structured data
 *
 * Localized via the `lib/fighters` helpers (per-locale dictionaries on the
 * fighter, harcosok.json catalog for chrome).
 */
export default async function FighterProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fighter = await readFighter(slug);
  if (!fighter || !fighter.published) {
    notFound();
  }

  const locale = DEFAULT_LOCALE; // mirrors /[locale]/* convention until L1-I18N lands
  const { getHarcosokT } = await import('@/lib/fighters');
  const t = await getHarcosokT(locale);

  const name = pickLocalized(fighter.name, locale);
  const nickname = pickLocalized(fighter.nickname, locale);
  const intro = pickLocalized(fighter.intro, locale);
  const story = pickLocalized(fighter.story, locale);
  const weightClass = pickLocalized(fighter.weightClass, locale);
  const hometown = pickLocalized(fighter.hometown, locale);
  const gym = pickLocalized(fighter.gym, locale);

  const stageLabel = (stage: 'reality' | 'fight_night' | 'pro') =>
    t(`profile.stages.${stage}`);

  // JSON-LD Person schema — helps Google surface a knowledge panel for the fighter.
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    alternateName: nickname || undefined,
    description: intro.replace(/<[^>]+>/g, '').trim(),
    url: `/harcosok/${fighter.slug}`,
    image: fighter.photo,
    nationality: fighter.country,
    birthDate: fighter.dob,
    height: fighter.heightCm
      ? { '@type': 'QuantitativeValue', value: fighter.heightCm, unitCode: 'cm' }
      : undefined,
    affiliation: gym
      ? { '@type': 'Organization', name: gym }
      : undefined,
    jobTitle: weightClass,
    homeLocation: hometown
      ? { '@type': 'Place', name: hometown }
      : undefined,
  };

  return (
    <main
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
      className="min-h-screen pt-20 pb-16"
    >
      {/* Hero: photo + identity */}
      <section className="relative">
        <div className="relative h-[60vh] sm:h-[70vh] w-full overflow-hidden bg-brand-dark-muted">
          <Image
            src={fighter.photo}
            alt={name}
            fill
            sizes="100vw"
            priority
            className="object-cover object-top"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
          <div className="card-dark rounded-2xl p-6 sm:p-8">
            <p className="text-brand-red text-xs uppercase tracking-widest font-semibold mb-2">
              EFU · {t('listing.title')}
            </p>
            <h1
              className="text-4xl sm:text-6xl font-black uppercase text-white tracking-tight"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {name}
            </h1>
            {nickname && (
              <p className="text-brand-gold text-lg sm:text-xl italic mt-1">
                {nickname}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-brand-dark-muted text-white px-2 py-1 rounded">
                {fighter.country}
              </span>
              {weightClass && (
                <span className="text-[10px] uppercase tracking-widest font-bold bg-brand-dark-muted text-gray-300 px-2 py-1 rounded">
                  {weightClass}
                </span>
              )}
              {hometown && (
                <span className="text-[10px] uppercase tracking-widest font-bold bg-brand-dark-muted text-gray-300 px-2 py-1 rounded">
                  📍 {hometown}
                </span>
              )}
              <span className="text-[10px] uppercase tracking-widest font-bold bg-brand-red/20 text-brand-red px-2 py-1 rounded">
                Mérleg {fighter.record.wins}-{fighter.record.losses}-
                {fighter.record.draws}
              </span>
            </div>

            {/* Intro under hero */}
            {intro && (
              <div
                className="mt-5 text-gray-200 text-base sm:text-lg leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: intro }}
              />
            )}

            {/* Back-to-listing link */}
            <div className="mt-6 pt-4 border-t border-brand-dark-border">
              <Link
                href="/harcosok"
                className="text-brand-gold text-xs uppercase tracking-widest font-bold hover:underline"
              >
                ← {t('profile.backToListing')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bio grid: story + sidebar with biography + record */}
      <section className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Story (rich text) */}
        <article className="lg:col-span-2 space-y-10">
          {story && (
            <div>
              <h2
                className="text-2xl sm:text-3xl font-black text-white uppercase mb-4 tracking-tight"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
              >
                {t('profile.story')}
              </h2>
              <div
                className="prose prose-invert max-w-none text-gray-200 text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: story }}
              />
            </div>
          )}

          {/* EFU path timeline */}
          {fighter.efuPath.length > 0 && (
            <div>
              <h2
                className="text-2xl sm:text-3xl font-black text-white uppercase mb-4 tracking-tight"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
              >
                {t('profile.efuPath')}
              </h2>
              <ol className="relative border-l-2 border-brand-dark-border pl-6 space-y-6">
                {fighter.efuPath.map((entry, i) => (
                  <li key={i} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-brand-red ring-4 ring-brand-dark"
                    />
                    <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">
                      {stageLabel(entry.stage)} ·{' '}
                      <time dateTime={entry.date} className="text-gray-400">
                        {entry.date}
                      </time>
                    </p>
                    <p className="text-white font-bold text-lg mt-1">
                      {pickLocalized(entry.title, locale)}
                    </p>
                    <div
                      className="text-gray-400 text-sm mt-1 prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: pickLocalized(entry.description, locale),
                      }}
                    />
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Videos */}
          <div>
            <h2
              className="text-2xl sm:text-3xl font-black text-white uppercase mb-4 tracking-tight"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {t('profile.videos')}
            </h2>
            {fighter.videos.length === 0 ? (
              <p className="text-gray-500 text-sm">{t('profile.videosEmpty')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fighter.videos.map((v, i) => (
                  <div key={i}>
                    <VideoEmbed
                      v={v}
                      title={pickLocalized(v.title, locale) || name}
                    />
                    {pickLocalized(v.title, locale) && (
                      <p className="text-gray-300 text-sm mt-2">
                        {pickLocalized(v.title, locale)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Sidebar: bio + record + fight history */}
        <aside className="space-y-6">
          {/* Bio */}
          <div className="card-dark rounded-2xl p-5">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">
              {t('profile.intro')}
            </h2>
            <dl className="space-y-3 text-sm">
              {fighter.dob && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-gray-600">
                    {t('profile.bio.born')}
                  </dt>
                  <dd className="text-gray-200">{fighter.dob}</dd>
                </div>
              )}
              {gym && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-gray-600">
                    {t('profile.bio.gym')}
                  </dt>
                  <dd className="text-gray-200">{gym}</dd>
                </div>
              )}
              {fighter.heightCm && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-gray-600">
                    {t('profile.bio.height')}
                  </dt>
                  <dd className="text-gray-200">{fighter.heightCm} cm</dd>
                </div>
              )}
              {fighter.reachCm && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-gray-600">
                    {t('profile.bio.reach')}
                  </dt>
                  <dd className="text-gray-200">{fighter.reachCm} cm</dd>
                </div>
              )}
              {fighter.stance && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-gray-600">
                    {t('profile.bio.stance')}
                  </dt>
                  <dd className="text-gray-200 capitalize">{fighter.stance}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Record (mérleg) */}
          <div className="card-dark rounded-2xl p-5">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">
              {t('profile.record')}
            </h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat
                value={fighter.record.wins}
                label={t('profile.stats.wins')}
                tone="text-emerald-400"
              />
              <Stat
                value={fighter.record.losses}
                label={t('profile.stats.losses')}
                tone="text-red-400"
              />
              <Stat
                value={fighter.record.draws}
                label={t('profile.stats.draws')}
                tone="text-gray-300"
              />
            </div>
            <div className="border-t border-brand-dark-border mt-4 pt-3 grid grid-cols-2 gap-3 text-center">
              <Stat
                value={fighter.record.kos}
                label={t('profile.stats.kos')}
                tone="text-brand-gold"
                small
              />
              <Stat
                value={fighter.record.submissions}
                label={t('profile.stats.submissions')}
                tone="text-brand-gold"
                small
              />
            </div>
          </div>

          {/* Fight history */}
          {fighter.fightHistory && fighter.fightHistory.length > 0 && (
            <div className="card-dark rounded-2xl p-5">
              <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">
                {t('profile.fightHistory')}
              </h2>
              <ul className="space-y-3 text-sm">
                {fighter.fightHistory.map((f, i) => (
                  <li
                    key={i}
                    className="border-b border-brand-dark-border pb-2 last:border-b-0"
                  >
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">
                      <time dateTime={f.date}>{f.date}</time>
                      {f.event ? ` · ${f.event}` : ''}
                      {f.round ? ` · R${f.round}` : ''}
                    </p>
                    <p className="text-gray-200 font-bold">
                      <span
                        className={
                          f.outcome === 'win'
                            ? 'text-emerald-400'
                            : f.outcome === 'loss'
                              ? 'text-red-400'
                              : 'text-gray-300'
                        }
                      >
                        {f.outcome === 'win'
                          ? 'Gy'
                          : f.outcome === 'loss'
                            ? 'V'
                            : f.outcome === 'draw'
                              ? 'D'
                              : '—'}
                      </span>{' '}
                      vs. {f.opponent}
                    </p>
                    <p className="text-gray-500 text-xs">{f.method}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share / social — basic copy-link button placeholder; OG takes care of the rest */}
          <SharePanel name={name} slug={fighter.slug} tShare={t('profile.share')} />
        </aside>
      </section>

      {/* JSON-LD Person */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
    </main>
  );
}

function Stat({
  value,
  label,
  tone,
  small,
}: {
  value: number;
  label: string;
  tone: string;
  small?: boolean;
}) {
  return (
    <div>
      <p
        className={`font-black ${tone} ${small ? 'text-lg' : 'text-3xl'} tabular-nums`}
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
        {label}
      </p>
    </div>
  );
}

function SharePanel({
  name,
  slug,
  tShare,
}: {
  name: string;
  slug: string;
  tShare: string;
}) {
  // Client component embedded inline (copy-to-clipboard)
  return <SharePanelClient name={name} slug={slug} tShare={tShare} />;
}
