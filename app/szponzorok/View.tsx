import Link from 'next/link';

/**
 * SzponzorokView — server-rendered JSX of the public sponsor/partners page.
 *
 * Split out of `app/szponzorok/page.tsx` so BOTH the canonical HU route
 * (`/szponzorok`) and the locale-prefixed route (`/{locale}/szponzorok`) can
 * render the same page in their respective languages without duplication.
 *
 * Mirrors the pattern in `app/reality/View.tsx`:
 *   - flat: flat dotted-key map of the `sponsors` namespace for the active
 *           locale (see `flatten()` in `lib/i18n`). Strings only — arrays
 *           intentionally dropped by `flatten()`, so we walk `raw` for them.
 *   - raw:  the original nested object. We need it to read arrays such as
 *           `why.audience.items`, `tiers.bronze.features`,
 *           `integrations.realityItems[].title|body`.
 *   - t:    lookup helper for flat-string keys (with HU fallback strings).
 *   - dir:  'ltr' | 'rtl' — applied to <main> so RTL locales (ar) flip.
 *   - lang: BCP-47 lang tag for <html lang> attribute on <main>.
 *
 * Subcomponents are co-located: server-rendered, no client interactivity.
 */

type MessageDict = Record<string, string>;

export function SzponzorokView({
  flat,
  raw,
  t,
  dir,
  lang,
}: {
  flat: MessageDict;
  raw: Record<string, unknown>;
  t: (key: string, fallback?: string) => string;
  dir: 'ltr' | 'rtl';
  lang: string;
}) {
  const audienceItems = readStringArray(raw, 'why.audience.items', AUDIENCE_DEFAULT);
  const valuesItems = readStringArray(raw, 'why.values.items', VALUES_DEFAULT);
  const formatsItems = readStringArray(raw, 'why.formats.items', FORMATS_DEFAULT);

  const tiers = [
    {
      tone: 'bronze' as const,
      name: t('tiers.bronze.name', 'Bronz'),
      tagline: t('tiers.bronze.tagline', 'Láthatóság a digitális felületeken'),
      price: t('tiers.bronze.price', 'Belépő szint'),
      features: readStringArray(raw, 'tiers.bronze.features', BRONZE_FEATURES_DEFAULT),
      cta: t('tiers.bronze.cta', 'Bronz csomag kérése'),
      ctaHref: '/kapcsolat?subject=sponsor-bronz',
    },
    {
      tone: 'silver' as const,
      name: t('tiers.silver.name', 'Ezüst'),
      tagline: t('tiers.silver.tagline', 'Digitális jelenlét + stáblista'),
      price: t('tiers.silver.price', 'Közép szint'),
      features: readStringArray(raw, 'tiers.silver.features', SILVER_FEATURES_DEFAULT),
      cta: t('tiers.silver.cta', 'Ezüst csomag kérése'),
      ctaHref: '/kapcsolat?subject=sponsor-silver',
    },
    {
      tone: 'gold' as const,
      name: t('tiers.gold.name', 'Arany'),
      tagline: t('tiers.gold.tagline', 'Gála + Reality jelenlét'),
      price: t('tiers.gold.price', 'Haladó szint'),
      features: readStringArray(raw, 'tiers.gold.features', GOLD_FEATURES_DEFAULT),
      cta: t('tiers.gold.cta', 'Arany csomag kérése'),
      ctaHref: '/kapcsolat?subject=sponsor-gold',
    },
    {
      tone: 'reality' as const,
      name: t('tiers.reality.name', 'Reality-integráció'),
      tagline: t('tiers.reality.tagline', 'Márkád belép a reality házba'),
      price: t('tiers.reality.price', 'Prémium'),
      features: readStringArray(raw, 'tiers.reality.features', REALITY_FEATURES_DEFAULT),
      cta: t('tiers.reality.cta', 'Reality-integráció egyeztetés'),
      ctaHref: '/kapcsolat?subject=sponsor-reality',
    },
    {
      tone: 'fightNight' as const,
      name: t('tiers.fightNight.name', 'Fight Night-integráció'),
      tagline: t('tiers.fightNight.tagline', 'Márkád a ring mellett'),
      price: t('tiers.fightNight.price', 'Prémium'),
      features: readStringArray(raw, 'tiers.fightNight.features', FIGHTNIGHT_FEATURES_DEFAULT),
      cta: t('tiers.fightNight.cta', 'Fight Night-integráció egyeztetés'),
      ctaHref: '/kapcsolat?subject=sponsor-fightnight',
    },
  ];

  const realityItems = readObjArray(
    raw,
    'integrations.realityItems',
    REALITY_ITEMS_DEFAULT
  );
  const fightNightItems = readObjArray(
    raw,
    'integrations.fightNightItems',
    FIGHTNIGHT_ITEMS_DEFAULT
  );

  return (
    <main
      className="min-h-screen pt-24 pb-20 px-4"
      dir={dir}
      lang={lang}
    >
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <section className="text-center mb-16 animate-fade-in">
          <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-3">
            {t('hero.eyebrow', 'EFU · Partnerség')}
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black uppercase text-white mb-4"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {t('hero.title', 'Szponzorok és partnerek')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {t(
              'hero.intro',
              'Az EFU partnerszintek célja, hogy a szponzorok testre szabott megjelenést kapjanak a gálákon, a közvetítésekben és a digitális platformjainkon. Minden partnerszinthez dedikált aktivációk és láthatósági csomagok tartoznak.'
            )}
          </p>
        </section>

        {/* Why EFU pitch */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2">
              {t('why.eyebrow', 'Miért az EFU?')}
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black uppercase text-white"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {t('why.title', 'Egy platform, három formátum, kilenc piac')}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
              {t(
                'why.intro',
                'Az EFU egyszerre épít reality-formátumot, gálasorozatot és digitális platformot. A szponzorok ezáltal nem egy-egy esemény mellé, hanem egy egész éves, integrált kommunikációs ökoszisztémához csatlakoznak.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PitchCard
              eyebrow="01"
              title={t('why.audience.title', 'Célcsoportunk')}
              items={audienceItems}
            />
            <PitchCard
              eyebrow="02"
              title={t('why.values.title', 'Márkaértékek')}
              items={valuesItems}
            />
            <PitchCard
              eyebrow="03"
              title={t('why.formats.title', 'Tartalomformátumok')}
              items={formatsItems}
            />
          </div>
        </section>

        {/* Sponsor package tiers */}
        <section className="mb-20" id="tiers">
          <div className="text-center mb-10">
            <h2
              className="text-3xl sm:text-4xl font-black uppercase text-white"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {t('tiers.title', 'Partnerszintek')}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
              {t(
                'tiers.subtitle',
                'Válaszd ki a márkádhoz illő partnerszintet. Az árakról az egyedi csomagokról a Kapcsolat menüpontban kérhetsz személyre szabott ajánlatot.'
              )}
            </p>
            <p className="text-gray-500 text-xs mt-2 italic">
              {t(
                'tiers.currencyNote',
                'Az árak tájékoztató jellegűek — a végleges csomag testre szabható.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <TierCard
                key={tier.tone}
                tone={tier.tone}
                name={tier.name}
                tagline={tier.tagline}
                price={tier.price}
                features={tier.features}
                cta={tier.cta}
                ctaHref={tier.ctaHref}
              />
            ))}
          </div>
        </section>

        {/* Integration examples */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2
              className="text-3xl sm:text-4xl font-black uppercase text-white"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {t('integrations.title', 'Integrációs lehetőségek')}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
              {t(
                'integrations.subtitle',
                'Két fő integrációs irány — Reality és Fight Night — amelyek egymással kombinálhatók is.'
              )}
            </p>
          </div>

          {/* Reality integrations */}
          <div className="mb-8">
            <h3 className="text-xl font-black uppercase text-brand-red mb-4 tracking-wide">
              {t('integrations.realityTitle', 'EFU Reality integráció')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {realityItems.map((item, i) => (
                <IntegrationItem
                  key={`reality-${i}`}
                  icon={item.icon}
                  title={item.title}
                  body={item.body}
                />
              ))}
            </div>
          </div>

          {/* Fight Night integrations */}
          <div>
            <h3 className="text-xl font-black uppercase text-brand-gold mb-4 tracking-wide">
              {t('integrations.fightNightTitle', 'EFU Fight Night integráció')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fightNightItems.map((item, i) => (
                <IntegrationItem
                  key={`fightnight-${i}`}
                  icon={item.icon}
                  title={item.title}
                  body={item.body}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Sponsor logo wall (placeholder) */}
        <section className="mb-20">
          <div className="text-center mb-8">
            <h2
              className="text-3xl sm:text-4xl font-black uppercase text-white"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {t('logos.title', 'Partnereink')}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
              {t(
                'logos.subtitle',
                'Az első három szponzor aláírása után itt jelennek meg a partnereink logói. Addig helyőrző.'
              )}
            </p>
          </div>

          <div className="card-dark rounded-2xl p-8 sm:p-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/2] rounded-lg border-2 border-dashed border-brand-dark-muted flex items-center justify-center text-gray-600 text-xs uppercase tracking-widest"
                  aria-label={`Logo placeholder ${i + 1}`}
                >
                  LOGO
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 text-xs mt-6 italic">
              {t(
                'logos.placeholderNote',
                'A logófal az első három szponzor aláírása után töltődik fel.'
              )}
            </p>
          </div>
        </section>

        {/* Contact CTA → /kapcsolat */}
        <section className="mb-8">
          <div className="card-dark rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(220,38,38,0.5) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <h2
                className="text-3xl sm:text-4xl font-black uppercase text-white mb-4"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
              >
                {t('contactCta.title', 'Csatlakozz az EFU partnereihez')}
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
                {t(
                  'contactCta.body',
                  'Kérj személyre szabott ajánlatot, és beszéljük meg, hogyan illeszkedik a márkád az EFU ökoszisztémájába.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  href="/kapcsolat?subject=partnership"
                  className="btn-primary inline-block text-base sm:text-lg uppercase tracking-wide"
                >
                  {t('contactCta.primary', 'Kapcsolatfelvétel')}
                </Link>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
                >
                  {t('contactCta.secondary', 'Vissza a főoldalra')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponents (server-rendered, co-located)                        */
/* ------------------------------------------------------------------ */

function PitchCard({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="card-dark rounded-xl p-6">
      <p className="text-brand-red text-xs font-black uppercase tracking-widest mb-2">
        {eyebrow}
      </p>
      <h3 className="text-white font-bold text-lg uppercase tracking-wide mb-3">
        {title}
      </h3>
      <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-brand-red mt-0.5">▸</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type TierTone = 'bronze' | 'silver' | 'gold' | 'reality' | 'fightNight';

function toneClasses(tone: TierTone): {
  border: string;
  badge: string;
  badgeText: string;
} {
  switch (tone) {
    case 'bronze':
      return {
        border: 'border-amber-700/50 hover:border-amber-600',
        badge: 'bg-amber-900/40 border-amber-700/50',
        badgeText: 'text-amber-300',
      };
    case 'silver':
      return {
        border: 'border-gray-500/50 hover:border-gray-300',
        badge: 'bg-gray-700/40 border-gray-500/50',
        badgeText: 'text-gray-200',
      };
    case 'gold':
      return {
        border: 'border-yellow-500/50 hover:border-yellow-300',
        badge: 'bg-yellow-900/40 border-yellow-500/50',
        badgeText: 'text-yellow-300',
      };
    case 'reality':
      return {
        border: 'border-brand-red/50 hover:border-brand-red',
        badge: 'bg-red-900/40 border-brand-red/50',
        badgeText: 'text-red-300',
      };
    case 'fightNight':
      return {
        border: 'border-brand-gold/50 hover:border-brand-gold',
        badge: 'bg-yellow-900/40 border-brand-gold/50',
        badgeText: 'text-yellow-300',
      };
  }
}

function TierCard({
  tone,
  name,
  tagline,
  price,
  features,
  cta,
  ctaHref,
}: {
  tone: TierTone;
  name: string;
  tagline: string;
  price: string;
  features: string[];
  cta: string;
  ctaHref: string;
}) {
  const tc = toneClasses(tone);
  return (
    <div
      className={`card-dark border ${tc.border} rounded-2xl p-6 flex flex-col transition-colors`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${tc.badge} ${tc.badgeText}`}
        >
          {name}
        </span>
        <span className="text-gray-500 text-xs uppercase tracking-wide">
          {price}
        </span>
      </div>
      <h3 className="text-white font-bold text-lg mb-1">{tagline}</h3>
      <ul className="space-y-2 text-gray-400 text-sm leading-relaxed mt-4 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-brand-red mt-0.5">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className="mt-6 inline-block text-center text-sm font-bold uppercase tracking-wide border border-brand-dark-border hover:border-brand-red hover:text-brand-red rounded-lg py-3 px-4 transition-all"
      >
        {cta}
      </Link>
    </div>
  );
}

function IntegrationItem({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card-dark rounded-xl p-5">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{icon}</div>
        <div>
          <h4 className="text-white font-bold text-base uppercase tracking-wide mb-1">
            {title}
          </h4>
          <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* JSON helpers (mirror app/reality/View.tsx)                          */
/* ------------------------------------------------------------------ */

function getPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

function readStringArray(
  obj: Record<string, unknown>,
  path: string,
  fallback: string[]
): string[] {
  const v = getPath(obj, path);
  if (Array.isArray(v)) {
    const out = v.filter((x) => typeof x === 'string') as string[];
    return out.length > 0 ? out : fallback;
  }
  return fallback;
}

type IntegrationObj = { title: string; body: string; icon: string };

function readObjArray(
  obj: Record<string, unknown>,
  path: string,
  fallback: IntegrationObj[]
): IntegrationObj[] {
  const v = getPath(obj, path);
  if (Array.isArray(v)) {
    const out: IntegrationObj[] = [];
    for (const item of v) {
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).title === 'string' &&
        typeof (item as Record<string, unknown>).body === 'string'
      ) {
        const rec = item as Record<string, unknown>;
        out.push({
          title: rec.title as string,
          body: rec.body as string,
          icon: typeof rec.icon === 'string' ? (rec.icon as string) : '',
        });
      }
    }
    return out.length > 0 ? out : fallback;
  }
  return fallback;
}

/* ------------------------------------------------------------------ */
/* HU fallback defaults (used when a translation file is missing)     */
/* ------------------------------------------------------------------ */

const AUDIENCE_DEFAULT = [
  '18–45 éves férfiak és nők, akik aktívan követik a küzdősportokat',
  'Közép-európai közönség: Magyarország, Szlovákia, Románia, Horvátország, Szerbia, Szlovénia, Németország',
  'Edzőterem-látogatók, sportolók, harcművészet-kedvelők',
  'Reality- és szórakoztató tartalomfogyasztók',
  'Többnyelvű közönség — a platform 9 nyelven érhető el',
];

const VALUES_DEFAULT = [
  'Teljesítmény és küzdelem — a sport szellemiségét közvetítjük',
  'Közösség — összekötjük a sportolókat, szurkolókat és partnereket',
  'Professzionalizmus — nemzetközi színvonalú produkció',
  'Integritás — átlátható partnerség, tiszta szabályok',
];

const FORMATS_DEFAULT = [
  'EFU Reality — többhetes tehetségkutató, epizódok, backstage, kihívások',
  'EFU Fight Night — gálasorozat, körmérkőzések, bajnoki címek',
  'EFU TV — élő közvetítések, interjúk, háttéranyagok, rövid formátumú tartalmak',
];

const BRONZE_FEATURES_DEFAULT = [
  'Logó megjelenítése az EFU weboldal Szponzorok oldalán',
  'Megjelenés a közösségi média posztok láblécében (havi 1-2 alkalommal)',
  'Hálás köszönet a Reality stáblistájában',
  'Hozzáférés az EFU zárt szponzori hírleveléhez',
];

const SILVER_FEATURES_DEFAULT = [
  'A Bronz csomag minden eleme',
  'Logó megjelenítése az EFU Fight Night közvetítések stáblistájában',
  'Rövid reklámszpot a Reality epizódok előtt (havi 1 db)',
  'Egyedi branded hashtag használati joga',
  'EFU TV rövid interjú / mention',
];

const GOLD_FEATURES_DEFAULT = [
  'Az Ezüst csomag minden eleme',
  'Logó a ring-side szőnyegen és a fight card poszteren',
  'Dedikált branded zóna a Fight Night helyszínen',
  'Termékminta / display a helyszíni aktivációs pultnál',
  'Részvétel 1 EFU Fight Night gálán 4 fő részére',
];

const REALITY_FEATURES_DEFAULT = [
  'Termékmegjelenés a reality-házban (product placement)',
  'Branded zóna a reality-házban (edzősarok, pihenősarok, konyhai sziget)',
  'Szponzor által kurált kihívás / feladat a versenyzőknek',
  'Logó a Reality stáblistájában, epizódonkénti említéssel',
  'Exkluzív social media aktiváció a saját márka social csatornáin',
];

const FIGHTNIGHT_FEATURES_DEFAULT = [
  'Ring-side branded placement (lábtörlő, palánk, sarok)',
  'Szponzorált fight card (címszponzori vagy kártya-szponzori szinten)',
  'Replay sponsorship — a visszajátszások alatti branded átkötés',
  'Dedikált kommentátori említések a Fight Night közvetítésben',
  'Részvétel a teljes Fight Night szezonra (3-4 gála)',
];

const REALITY_ITEMS_DEFAULT: IntegrationObj[] = [
  {
    icon: '🏠',
    title: 'Product placement a reality-házban',
    body: 'Termékeid természetesen jelennek meg a reality-ház mindennapjaiban — a konyhapulttól az edzőteremig.',
  },
  {
    icon: '🎯',
    title: 'Branded zónák',
    body: 'Saját márkás sarok a házban: edző-pad, regeneráló zóna, pihenősarok, vagy bármi, ami a márkádhoz illik.',
  },
  {
    icon: '🏆',
    title: 'Szponzor által kurált kihívások',
    body: 'A versenyzők a te feladatodon mérik össze magukat — a legjobb teljesítmény díjazása a te nevedhez kötődik.',
  },
  {
    icon: '📺',
    title: 'Epizódonkénti említés + stáblista',
    body: 'Minden epizódban megjelenik a logód + a kommentátori említés az adott szegmens előtt.',
  },
];

const FIGHTNIGHT_ITEMS_DEFAULT: IntegrationObj[] = [
  {
    icon: '🥊',
    title: 'Ring-side placement',
    body: 'Logó a ring szélén, a palánkon és a sarokban — a kamera mindig látja, a közönség mindig olvassa.',
  },
  {
    icon: '🎫',
    title: 'Sponsored fight card',
    body: 'Egy teljes fight cardot a te nevedről nevezünk el — a beharangozó videóktól a győztes interjúig.',
  },
  {
    icon: '🔁',
    title: 'Replay sponsorship',
    body: 'A visszajátszások és az elemző szegmensek alatt branded átkötés — prémium figyelem a kulcsmomentumoknál.',
  },
  {
    icon: '🎙️',
    title: 'Kommentátori említések',
    body: 'A teljes közvetítés alatt dedikált szegmensek a márkádról — szakértői hangon, a Fight Night szellemiségével összhangban.',
  },
];