import Link from 'next/link';
import { RealityLogo } from '@/components/logos';

/**
 * RealityView — the server-rendered JSX of the EFU Reality landing page.
 *
 * Split out of `app/reality/page.tsx` so that BOTH the canonical HU route
 * (`/reality`) and the locale-prefixed route (`/{locale}/reality`) can render
 * the same page in their respective languages without duplication.
 *
 * Inputs:
 *   - flat:  flat dotted-key map of the `reality` namespace for the active locale
 *            (see `flatten()` in `lib/i18n` — handles nested OBJECTS only)
 *   - raw:   the original nested object so we can walk ARRAYS (rules.items,
 *            mentors.members, contestants.silhouettes, prize.launchCareerBullets)
 *            — `flatten()` drops arrays on purpose; that contract belongs to
 *            the L1-I18N rebuild and is not our concern here.
 *   - t:     lookup helper (returns `key` if missing — visible to operators)
 *   - applyHref: cross-link target for the "Jelentkezz harcosnak" CTA
 *   - dir:   'ltr' | 'rtl' — applied to <main> so RTL locales (ar) flip
 *
 * Subcomponents live in this file too — they are server-rendered, no client
 * interactivity, so co-location is the minimum that works.
 */
export function RealityView({
  flat,
  raw,
  t,
  applyHref,
  dir,
}: {
  flat: Record<string, string>;
  raw: Record<string, unknown>;
  t: (key: string, fallback?: string) => string;
  applyHref: string;
  dir: 'ltr' | 'rtl';
}) {
  const zones = ZONES_DEFAULT;
  const rules = readArray<RuleItem>(raw, 'rules.items', RULE_DEFAULT as RuleItem[]);
  const mentors = readArray<MentorItem>(raw, 'mentors.members', MENTOR_DEFAULT);
  const silhouettes = readStringArray(raw, 'contestants.silhouettes', SILHOUETTE_DEFAULT);
  const launchBullets = readStringArray(
    raw,
    'prize.launchCareerBullets',
    LAUNCH_BULLETS_DEFAULT
  );

  return (
    <main className="min-h-screen pt-24 pb-16 px-4" dir={dir} lang={dir === 'rtl' ? 'ar' : undefined}>
      <div className="max-w-6xl mx-auto">
        {/* HERO */}
        <section
          id="hero"
          className="text-center mb-14 sm:mb-20 animate-fade-in"
          aria-labelledby="reality-hero-title"
        >
          <p className="text-brand-red text-sm sm:text-base uppercase tracking-widest font-semibold mb-3">
            {t('hero.eyebrow', 'EFU Reality · 2026 szezon')}
          </p>
          <h1
            id="reality-hero-title"
            className="text-5xl sm:text-7xl font-black uppercase text-white mb-5 leading-[0.95]"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: '-0.01em' }}
          >
            <span className="block text-gradient-red">{t('hero.titleLine1', 'A HÁZ')}</span>
            <span className="block text-white">{t('hero.titleLine2', 'VÁR')}</span>
          </h1>
          <div className="flex justify-center mb-6">
            <RealityLogo width={250} height={125} />
          </div>
          <p className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            {t(
              'hero.tagline',
              'Az EFU Reality a harcművészeti tehetségkutató formátumunk. Több héten át tartó küzdelem, ahol a résztvevők nemcsak a ketrecben, hanem a mindennapokban is megmérettek.'
            )}
          </p>
          <div className="mt-7">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/40 text-brand-gold text-[11px] sm:text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" aria-hidden />
              {t('hero.statusPill', 'Jelentkezés hamarosan')}
            </span>
          </div>
        </section>

        {/* A HÁZ */}
        <section
          id="haz"
          className="mb-16 sm:mb-24 scroll-mt-24"
          aria-labelledby="house-title"
        >
          <div className="text-center mb-10">
            <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2">
              {t('house.eyebrow', 'Hol lakik a szezon')}
            </p>
            <h2
              id="house-title"
              className="text-4xl sm:text-5xl font-black uppercase text-white"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {t('house.title', 'A Ház')}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
              {t(
                'house.intro',
                'A 2026-os szezonban a versenyzők beköltöznek az EFU Házba: egy teljesen felszerelt, 24 órás megfigyelés alatt álló edző- és lakókomplexumba. A Ház nem csupán szállás — a műsor második színpada.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <ZoneCard
                key={zone}
                icon={ZONE_ICONS[zone]}
                name={t(`house.zones.${zone}.name`, ZONE_DEFAULT_NAMES[zone])}
                tagline={t(`house.zones.${zone}.tagline`, ZONE_DEFAULT_TAGLINES[zone])}
                desc={t(`house.zones.${zone}.desc`, ZONE_DEFAULT_DESCS[zone])}
              />
            ))}
          </div>
        </section>

        {/* SZABÁLYOK */}
        <section
          id="szabalyok"
          className="mb-16 sm:mb-24 scroll-mt-24"
          aria-labelledby="rules-title"
        >
          <div className="text-center mb-10">
            <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2">
              {t('rules.eyebrow', 'Hogyan működik')}
            </p>
            <h2
              id="rules-title"
              className="text-4xl sm:text-5xl font-black uppercase text-white"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {t('rules.title', 'Szabályok')}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
              {t(
                'rules.intro',
                'Az EFU Reality az EFU saját szabályrendszerére épül. A Házban és a ketrecben is ugyanazok az alapelvek érvényesek: tisztelet, biztonság, fair play.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rules.map((r, idx) => (
              <RuleCard
                key={idx}
                title={r.title}
                tagline={r.tagline}
                points={r.points}
              />
            ))}
          </div>
        </section>

        {/* MENTOROK */}
        <section
          id="mentorok"
          className="mb-16 sm:mb-24 scroll-mt-24"
          aria-labelledby="mentors-title"
        >
          <div className="text-center mb-10">
            <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2">
              {t('mentors.eyebrow', 'A stáb')}
            </p>
            <h2
              id="mentors-title"
              className="text-4xl sm:text-5xl font-black uppercase text-white"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {t('mentors.title', 'Mentorok')}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
              {t(
                'mentors.intro',
                'Az EFU Reality mentorai a közép-európai harcművészeti élet legelismertebb edzői, egykori bajnokai és sportpszichológusai.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mentors.map((m, idx) => (
              <MentorCard
                key={idx}
                avatarEmoji={m.avatarEmoji}
                name={m.name}
                role={m.role}
                bio={m.bio}
                specialty={m.specialty}
              />
            ))}
          </div>
        </section>

        {/* VERSENYZŐK — sziluettek */}
        <section
          id="versenyzok"
          className="mb-16 sm:mb-24 scroll-mt-24"
          aria-labelledby="contestants-title"
        >
          <div className="text-center mb-10">
            <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2">
              {t('contestants.eyebrow', 'A szezon résztvevői')}
            </p>
            <h2
              id="contestants-title"
              className="text-4xl sm:text-5xl font-black uppercase text-white"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {t('contestants.title', 'Versenyzők')}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
              {t(
                'contestants.intro',
                'A 2026-os szezon versenyzőinek kiléte a Ház kapujának megnyitásával egyidőben válik nyilvánossá. A bemutatkozásig a résztvevőket sziluettjeik jelzik — a Házban mindenki azonos esélyekkel indul.'
              )}
            </p>
          </div>

          <SilhouetteGrid silhouettes={silhouettes} />

          <p className="text-center text-gray-500 mt-8 max-w-2xl mx-auto text-sm italic">
            {t(
              'contestants.teaser',
              'A szezon indulásakor a sziluettek helyére valódi arcok és történetek kerülnek. Iratkozz fel, és értesülj róla elsőként.'
            )}
          </p>
        </section>

        {/* NYEREMÉNY — pre-launch or launch copy */}
        <section
          id="nyeremeny"
          className="mb-16 sm:mb-24 scroll-mt-24"
          aria-labelledby="prize-title"
        >
          {PRELAUNCH ? (
            <PrizePrelaunch
              badge={t('prize.prelaunchBadge', 'Hamarosan…')}
              title={t('prize.prelaunchTitle', 'A szezon tétje')}
              body={t(
                'prize.prelaunchBody',
                'Az EFU Reality pontos nyereménystruktúrája a Ház megnyitójával egyidőben válik nyilvánossá. Iratkozz fel, hogy ne maradj le a bejelentésről.'
              )}
              titleId="prize-title"
            />
          ) : (
            <PrizeLaunch
              titleId="prize-title"
              mainTitle={t('prize.launchMainTitle', 'Fődíj')}
              mainAmount={t('prize.launchMainAmount', '🏆 10.000.000 Ft')}
              mainNote={t('prize.launchMainNote', 'A szezon győztese 10 millió forintos fődíjban részesül.')}
              careerTitle={t('prize.launchCareerTitle', 'Karrierlehetőség')}
              careerIntro={t(
                'prize.launchCareerIntro',
                'Az EFU Reality nem csak a győztesről szól. A legkiemelkedőbb versenyzők számára lehetőség nyílhat:'
              )}
              bullets={launchBullets}
            />
          )}
          {/* Operator note — invisible in production, only useful for handoff reviewers */}
          <p className="text-center text-[10px] text-gray-700 mt-3">
            {t(
              'prize.swapNote',
              'Pre-launch: „Hamarosan…". Induláskor: 10M HUF + EFU harcosi szerződés.'
            )}
          </p>
        </section>

        {/* JELENTKEZZ HARCOSNAK — CTA */}
        <section className="text-center mb-12" aria-labelledby="apply-cta-title">
          <h2
            id="apply-cta-title"
            className="text-3xl sm:text-5xl font-black uppercase text-white mb-4"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {t('applyCta.title', 'Te lehetsz a következő EFU harcos')}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-7 text-base sm:text-lg">
            {t('applyCta.body', 'Jelentkezz a 2026-os szezonra. A Ház vár.')}
          </p>
          <Link
            href={applyHref}
            className="btn-primary text-base sm:text-lg px-10 py-5 inline-flex items-center gap-2"
            data-cta="apply-fighter"
            data-locale={dir === 'rtl' ? 'ar' : undefined}
          >
            <span aria-hidden="true">🥊</span>
            {t('applyCta.button', 'Jelentkezz harcosnak')}
          </Link>
        </section>

        {/* Footer disclaimer */}
        <p className="text-center text-xs text-gray-600 max-w-2xl mx-auto">
          {t(
            'footer.disclaimer',
            'A Ház pontos szabályzata, a zsűri összetétele és a mérkőzések menete a szezon hivatalos indítása előtt véglegesítésre kerül.'
          )}
        </p>
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Subcomponents (server-rendered, no client interactivity needed)
// ──────────────────────────────────────────────────────────────────────────────

function ZoneCard({
  icon,
  name,
  tagline,
  desc,
}: {
  icon: React.ReactNode;
  name: string;
  tagline: string;
  desc: string;
}) {
  return (
    <div className="card-dark rounded-xl p-6 hover:border-brand-dark-muted transition-colors">
      <div className="text-brand-red mb-3" aria-hidden>
        {icon}
      </div>
      <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
        <h3
          className="text-xl font-black uppercase text-white"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
        >
          {name}
        </h3>
        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
          {tagline}
        </span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function RuleCard({
  title,
  tagline,
  points,
}: {
  title: string;
  tagline: string;
  points: string[];
}) {
  return (
    <div className="card-dark rounded-xl p-6 hover:border-brand-dark-muted transition-colors">
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <h3
          className="text-xl font-black uppercase text-white"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
        >
          {title}
        </h3>
        <span className="text-[10px] uppercase tracking-widest font-bold text-brand-red">
          {tagline}
        </span>
      </div>
      <ul className="space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-red shrink-0"
              aria-hidden
            />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MentorCard({
  name,
  role,
  bio,
  specialty,
  avatarEmoji,
}: {
  name: string;
  role: string;
  bio: string;
  specialty: string;
  avatarEmoji: string;
}) {
  return (
    <div className="card-dark rounded-xl p-5 flex flex-col h-full hover:border-brand-dark-muted transition-colors">
      <div
        className="aspect-square w-full rounded-lg mb-4 flex items-center justify-center text-5xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(220,38,38,0.18) 0%, transparent 65%), linear-gradient(180deg, #141414 0%, #0A0A0A 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        aria-hidden
      >
        <span>{avatarEmoji}</span>
      </div>
      <h3
        className="text-lg font-black uppercase text-white mb-1"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        {name}
      </h3>
      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-red mb-3">
        {role}
      </p>
      <p className="text-gray-400 text-xs leading-relaxed mb-3 flex-1">{bio}</p>
      <p className="text-gray-500 text-[11px] italic">
        <span className="text-gray-300 not-italic font-semibold">Specialty: </span>
        {specialty}
      </p>
    </div>
  );
}

function SilhouetteGrid({ silhouettes }: { silhouettes: string[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {silhouettes.map((label, i) => (
        <div
          key={i}
          className="card-dark rounded-xl p-3 sm:p-4 flex flex-col items-center text-center"
          aria-label={label}
        >
          <div
            className="w-full aspect-[3/4] rounded-lg flex items-end justify-center overflow-hidden relative"
            style={{
              background:
                'linear-gradient(180deg, rgba(220,38,38,0.08) 0%, transparent 50%), linear-gradient(180deg, #141414 0%, #0A0A0A 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
            aria-hidden
          >
            <SilhouetteFigure index={i} />
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-3 leading-tight font-medium">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

function SilhouetteFigure({ index }: { index: number }) {
  const tilt = ((index % 2) === 0 ? -2 : 2) * (1 + (index % 3));
  return (
    <svg
      viewBox="0 0 100 130"
      className="w-3/5 h-full"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <circle cx="50" cy="20" r="10" fill="rgba(220,38,38,0.35)" />
      <path
        d="M38 32 Q50 30 62 32 L66 75 Q50 78 34 75 Z"
        fill="rgba(220,38,38,0.32)"
      />
      <path
        d="M38 35 L22 50 L18 60 L26 65 L36 50 Z"
        fill="rgba(220,38,38,0.28)"
      />
      <path
        d="M62 35 L80 48 L84 58 L76 64 L64 50 Z"
        fill="rgba(220,38,38,0.28)"
      />
      <path
        d="M40 75 L36 120 L46 122 L50 85 Z"
        fill="rgba(220,38,38,0.28)"
      />
      <path
        d="M60 75 L64 120 L54 122 L50 85 Z"
        fill="rgba(220,38,38,0.28)"
      />
      <text
        x="50"
        y="125"
        textAnchor="middle"
        fontSize="9"
        fontWeight="900"
        fill="rgba(245,158,11,0.7)"
        fontFamily="Impact, Arial Black, sans-serif"
      >
        #{String(index + 1).padStart(2, '0')}
      </text>
    </svg>
  );
}

function PrizePrelaunch({
  badge,
  title,
  body,
  titleId,
}: {
  badge: string;
  title: string;
  body: string;
  titleId: string;
}) {
  return (
    <div className="card-dark rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(245,158,11,0.45) 0%, transparent 65%)',
        }}
      />
      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/40 text-brand-gold text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" aria-hidden />
          {badge}
        </span>
        <h2
          id={titleId}
          className="text-4xl sm:text-5xl font-black uppercase text-white mb-4"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
        >
          {title}
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}

function PrizeLaunch({
  titleId,
  mainTitle,
  mainAmount,
  mainNote,
  careerTitle,
  careerIntro,
  bullets,
}: {
  titleId: string;
  mainTitle: string;
  mainAmount: string;
  mainNote: string;
  careerTitle: string;
  careerIntro: string;
  bullets: string[];
}) {
  return (
    <div>
      <h2 id={titleId} className="sr-only">
        {mainTitle}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 card-dark rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at center, rgba(245,158,11,0.35) 0%, transparent 65%)',
            }}
          />
          <div className="relative z-10">
            <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-3">
              {mainTitle}
            </p>
            <div
              className="text-5xl sm:text-6xl md:text-7xl font-black mb-4 text-gradient-gold"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: '-0.02em' }}
            >
              {mainAmount}
            </div>
            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto">{mainNote}</p>
          </div>
        </div>
        <div className="md:col-span-2 card-dark rounded-2xl p-6 sm:p-8">
          <h3
            className="text-2xl sm:text-3xl font-black uppercase text-white mb-3"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {careerTitle}
          </h3>
          <p className="text-gray-300 mb-5 text-sm sm:text-base leading-relaxed">{careerIntro}</p>
          <ul className="space-y-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-200 text-sm sm:text-base">
                <span
                  className="mt-1 inline-block flex-shrink-0 w-2 h-2 rounded-full bg-brand-red"
                  aria-hidden
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Static data & helpers
// ──────────────────────────────────────────────────────────────────────────────

interface RuleItem {
  title: string;
  tagline: string;
  points: string[];
}

interface MentorItem {
  name: string;
  role: string;
  bio: string;
  specialty: string;
  avatarEmoji: string;
}

const ZONES_DEFAULT = [
  'nappali',
  'konyha',
  'halok',
  'edzoterem',
  'kert',
  'egyeb',
] as const;
type ZoneKey = (typeof ZONES_DEFAULT)[number];

const ZONE_ICONS: Record<ZoneKey, React.ReactNode> = {
  nappali: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
      <path d="M3 12h18M5 10v6a2 2 0 002 2h10a2 2 0 002-2v-6M7 10V7a3 3 0 013-3h4a3 3 0 013 3v3" />
    </svg>
  ),
  konyha: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
      <path d="M6 2v6a3 3 0 006 0V2M9 8v14M16 2c-1 0-2 1-2 3v6h4V5c0-2-1-3-2-3zM16 11v9" />
    </svg>
  ),
  halok: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
      <path d="M3 19h18M5 19V8a2 2 0 012-2h10a2 2 0 012 2v11M9 12h6" />
    </svg>
  ),
  edzoterem: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
      <path d="M6 4v16M18 4v16M2 8v8M22 8v8M6 12h12" />
    </svg>
  ),
  kert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
      <path d="M12 2v8M8 6c0 2 2 4 4 4M16 6c0 2-2 4-4 4M3 22h18M5 22c0-4 3-7 7-7s7 3 7 7" />
    </svg>
  ),
  egyeb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
    </svg>
  ),
};

const ZONE_DEFAULT_NAMES: Record<ZoneKey, string> = {
  nappali: 'Nappali',
  konyha: 'Konyha',
  halok: 'Hálószobák',
  edzoterem: 'Edzőterem',
  kert: 'Kert',
  egyeb: 'Egyéb helyiségek',
};

const ZONE_DEFAULT_TAGLINES: Record<ZoneKey, string> = {
  nappali: 'Közösségi tér',
  konyha: 'Gyógyulás és taktika',
  halok: 'Pihenőzóna',
  edzoterem: 'Napi két edzés',
  kert: 'Kültéri edzés',
  egyeb: 'Szauna, gyúró, orvosi',
};

const ZONE_DEFAULT_DESCS: Record<ZoneKey, string> = {
  nappali:
    'A Ház központi tere. Itt zajlanak a közös étkezések, a zsűri előtti megbeszélések, a háziversenyek kihirdetése és a nem hivatalos beszélgetések.',
  konyha:
    'A Ház szíve. A táplálkozási tanácsadó és a séf által összeállított menü a regenerációt és a szezonra való felkészülést szolgálja.',
  halok:
    'Külön női és férfi hálószobák, személyes szekrényekkel és ágytámlába épített kamerákkal. A pihenőidő szigorúan védett.',
  edzoterem:
    'Teljes MMA-felszereltség: ketrec, álló- és földharc szőnyegek, állókák, erőemelő szigetek, regenerációs sarok.',
  kert:
    'Füves pálya a sprint- és állóképességi edzésekhez, kültéri szauna, jakuzzi és egy nyitott terasz a közös beszélgetésekhez.',
  egyeb:
    'Szauna és jakuzzi a regenerációhoz, dedikált gyúró- és fizioterápiás szoba, valamint egy 0–24 órás orvosi helyiség.',
};

const RULE_DEFAULT: RuleItem[] = [
  {
    title: 'Beköltözés és kiválasztás',
    tagline: 'Házon belüli rangsor',
    points: [
      'A mentorok a beköltözés után 48 órán belül felállítják a házon belüli rangsort',
      'A kezdeti rangsor a teljesítmény-bemutatók, az interjúk és a fizikai tesztek alapján alakul',
      'Aki az első héten a legalacsonyabb helyen áll, azonnali kieséssel fenyeget',
    ],
  },
  {
    title: 'Heti kihívások',
    tagline: 'Edzés és szavazás',
    points: [
      'Minden hét elején a mentorok nyilvános házi kihívást jelölnek ki',
      'A kihívás teljesítése kötelező — a résztvevők a Ház teljes lakossága előtt mutatják be',
      'A zsűri pontoz, a házon belüli szavazás kiegészíti a végső sorrendet',
    ],
  },
  {
    title: 'Ketreces összecsapások',
    tagline: 'EFU Stand-Up és Hybrid',
    points: [
      'Mérkőzés csak az EFU Ruleset (Stand-Up vagy Hybrid) szerint zajlik',
      'Minden összecsapás előtt kötelező orvosi vizsgálat',
      'Bírói döntés vitás esetben a Házon belüli pontozólapokkal is megerősítésre kerül',
    ],
  },
  {
    title: 'Kiesés és visszatérés',
    tagline: 'Nincs végleges kiesés a Házban',
    points: [
      'Az utolsó helyen álló versenyző a soron következő mérkőzésen párbajra kényszerül',
      'A párbaj győztese a Házban marad, a vesztes számára a mentorok visszatérési lehetőséget ajánlhatnak fel',
      'A döntőbe kizárólag a Házon belüli rangsor és a közönségszavazás együttes eredménye juttat',
    ],
  },
  {
    title: 'Magatartás a Házban',
    tagline: 'Kamera előtt és mögött',
    points: [
      'Agresszió, zaklatás vagy a Ház infrastruktúrájának rongálása azonnali kizárással jár',
      'Alkohol- és szerhasználat tilos — a teljes szezon alatt rendszeres vizsgálat',
      'A magánélet védelme: a hálószobák kameraképe kizárólag a gyártó stáb számára hozzáférhető',
    ],
  },
];

const MENTOR_DEFAULT: MentorItem[] = [
  {
    name: 'Kovács István',
    role: 'Főállóharc-mentor',
    bio: 'Háromszoros magyar bajnok, 18 év nemzetközi tapasztalattal. Az EFU Stand-Up szabályrendszer egyik kidolgozója.',
    specialty: 'Állóharc, lábtechnika, pontozási taktika',
    avatarEmoji: '🥊',
  },
  {
    name: 'Nagy László',
    role: 'Földharc-mentor',
    bio: 'BJJ feketeöves, egykori IBJJF Európa-bajnok. A Házban a Hybrid szabályrendszer szerinti korlátozott földharc edzéseit vezeti.',
    specialty: 'Földharc, submission defense, pozíciókontroll',
    avatarEmoji: '🤼',
  },
  {
    name: 'Tóth Beatrix',
    role: 'Sportpszichológus és mentális mentor',
    bio: 'Sportpszichológus, számos válogatott versenyző mentális felkészítője. A Házban a konfliktuskezelés, a regeneráció és a nyomáskezelés specialistája.',
    specialty: 'Mentális edzés, konfliktuskezelés, regeneráció',
    avatarEmoji: '🧠',
  },
  {
    name: 'Varga Máté',
    role: 'Erőnléti és kondicionáló mentor',
    bio: 'Erőnléti edző, ex-rögbis nemzetközi játékos. A szezonra való felkészítés, a regenerációs protokollok és a táplálkozás felelőse.',
    specialty: 'Kondicionálás, regeneráció, táplálkozás',
    avatarEmoji: '💪',
  },
];

const SILHOUETTE_DEFAULT: string[] = [
  '1. sziluett · Állóharc specialista',
  '2. sziluett · Földharc specialista',
  '3. sziluett · All-rounder',
  '4. sziluett · All-rounder',
  '5. sziluett · Állóharc specialista',
  '6. sziluett · Földharc specialista',
  '7. sziluett · Feltörekvő',
  '8. sziluett · Feltörekvő',
];

const LAUNCH_BULLETS_DEFAULT: string[] = [
  'EFU harcosi szerződés megszerzésére',
  'szereplésre az EFU Fight Night eseményeken',
  'kiemelt média-megjelenésekre',
  'interjúra és promóciós tartalmakban való részvételre',
  'hosszú távú együttműködésre az Elite Fight Universe rendszerében',
];

// Pre-launch flag — flip to `false` to switch the prize section to the
// post-launch "10M HUF + EFU contract" copy.
export const PRELAUNCH = true;

// ──────────────────────────────────────────────────────────────────────────────
// i18n walk helpers — see the JSDoc on RealityView for why we need both
// `flat` (dotted keys) and `raw` (the original nested object). The shared
// `flatten()` util in `lib/i18n` drops arrays on purpose; that contract
// belongs to the L1-I18N rebuild (t_b4af2893) and we don't touch it here.
// ──────────────────────────────────────────────────────────────────────────────

function readPath(obj: Record<string, unknown>, dotted: string): unknown {
  const parts = dotted.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && !Array.isArray(cur) && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

function readArray<T>(raw: Record<string, unknown>, dotted: string, fallback: T[]): T[] {
  const v = readPath(raw, dotted);
  if (Array.isArray(v) && v.length > 0) return v as T[];
  return fallback;
}

function readStringArray(
  raw: Record<string, unknown>,
  dotted: string,
  fallback: string[]
): string[] {
  const v = readPath(raw, dotted);
  if (Array.isArray(v) && v.length > 0) {
    const out = v.filter((x) => typeof x === 'string') as string[];
    if (out.length > 0) return out;
  }
  return fallback;
}
