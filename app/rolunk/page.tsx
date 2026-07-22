'use client';

import Link from 'next/link';
import { I18nPillars } from '@/components/I18nPillars';
import { I18nRuleset } from '@/components/I18nRuleset';
import { BrandTimeline } from '@/components/BrandTimeline';
import { useAboutMessages, getString, getArray } from '@/components/useAboutMessages';
import { EliteFightUniverseLogo } from '@/components/logos';

/**
 * /rolunk — Rólunk (About) page.
 *
 * AC: "Mi az EFU?" three-pillar layout (Reality / Fight Night / EFU TV),
 * EFU Ruleset section (Stand-Up + Hybrid), Küldetésünk mission statement,
 * brand timeline (Reality → Fight Night → Pro career), 9-locale i18n with
 * AR locale RTL layout check.
 *
 * The page renders identically in any locale because the active locale
 * is read from the NEXT_LOCALE cookie at mount time. AR locale uses
 * CSS logical properties (`start/end`, `ms-/me-`) so the layout mirrors
 * automatically when <html dir="rtl"> is set by the root layout.
 */
export default function RolunkPage() {
  const { about, locale, ready } = useAboutMessages();

  // Bound helpers to the loaded messages
  const s = (path: string, fallback = ''): string => getString(about, path, fallback);
  const a = (path: string): string[] => getArray(about, path);

  // Loading skeleton — same shape as the real page so CLS is zero.
  if (!ready) {
    return <RolunkSkeleton />;
  }

  return (
    <main className="flex flex-col">
      {/* AR locale: visible RTL marker (also conveyed via <html dir>)
          so screen-reader users / devs inspecting the DOM know the
          layout is mirrored. */}
      {locale === 'ar' && (
        <p className="sr-only" lang="ar">
          تخطيط من اليمين إلى اليسار
        </p>
      )}

      {/* HERO — "Mi az EFU?" intro */}
      <section className="py-20 sm:py-24 px-4 max-w-5xl mx-auto w-full text-center">
        <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-3">
          {s('hero.eyebrow', 'Rólunk')}
        </p>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white mb-6"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
        >
          {s('hero.title', 'Mi az EFU?')}
        </h1>
        {/* EFU Logo */}
        <div className="flex justify-center mb-8">
          <EliteFightUniverseLogo width={300} height={150} className="w-48 h-auto" />
        </div>
        <p className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
          {s(
            'hero.intro',
            'Az Elite Fight Universe (EFU) egy harcművészeti és szórakoztatóipari ökoszisztéma.'
          )}
        </p>
      </section>

      {/* PILLARS — three-column grid */}
      <section
        id="pillars"
        className="py-12 sm:py-16 px-4 max-w-5xl mx-auto w-full scroll-mt-16"
      >
        <div className="text-center mb-10">
          <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2">
            {s('pillars.eyebrow', 'Három pillér')}
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white mb-3"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {s('pillars.title', 'A teljes univerzum, három pilléren')}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            {s('pillars.intro', 'Az EFU három fő pillérre épül: Reality, Fight Night és EFU TV.')}
          </p>
        </div>
        <I18nPillars about={about} getString={(p, f) => s(p, f)} />
      </section>

      {/* RULESET — Stand-Up + Hybrid */}
      <section
        id="ruleset"
        className="py-12 sm:py-16 px-4 max-w-5xl mx-auto w-full scroll-mt-16"
      >
        <div className="text-center mb-10">
          <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2">
            {s('ruleset.eyebrow', 'Hogyan működik?')}
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white mb-3"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {s('ruleset.title', 'EFU Ruleset')}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            {s(
              'ruleset.intro',
              'Az EFU saját szabályrendszere a folyamatos akciót és a látványos küzdelmeket helyezi előtérbe.'
            )}
          </p>
        </div>
        <I18nRuleset
          about={about}
          getString={(p, f) => s(p, f)}
          getArray={p => a(p)}
        />
      </section>

      {/* TIMELINE — brand path */}
      <section
        id="timeline"
        className="py-12 sm:py-16 px-4 max-w-5xl mx-auto w-full scroll-mt-16"
      >
        <div className="text-center mb-10">
          <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2">
            {s('timeline.eyebrow', 'A márka útja')}
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white mb-3"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {s('timeline.title', 'Hogyan épül fel egy EFU karrier?')}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            {s(
              'timeline.intro',
              'Az EFU három lépcsős karrierutat kínál.'
            )}
          </p>
        </div>
        <BrandTimeline about={about} getString={(p, f) => s(p, f)} />
      </section>

      {/* MISSION — Küldetésünk */}
      <section
        id="mission"
        className="py-12 sm:py-16 px-4 max-w-4xl mx-auto w-full scroll-mt-16"
      >
        <div
          className="card-dark rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at center, rgba(220,38,38,0.12) 0%, transparent 70%)',
          }}
        >
          <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-3">
            {s('mission.eyebrow', 'Küldetésünk')}
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white mb-6"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {s('mission.title', 'Egy közösség, amely összeköt')}
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            {s(
              'mission.body',
              'Az EFU célja egy közép-európai harcművészeti közösség felépítése.'
            )}
          </p>
        </div>
      </section>

      {/* CTA — back to home / apply / pricing */}
      <section className="py-12 px-4 max-w-3xl mx-auto w-full text-center">
        <p className="text-gray-400 mb-6 text-sm sm:text-base">
          {locale === 'ar'
            ? 'هل أنت مستعد لتكون جزءاً من EFU؟'
            : locale === 'en'
            ? 'Ready to be part of EFU?'
            : 'Készen állsz, hogy részese legyél az EFU-nak?'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <span aria-hidden>←</span>
            <span>
              {locale === 'ar' ? 'الصفحة الرئيسية' : locale === 'en' ? 'Home' : 'Főoldal'}
            </span>
          </Link>
          <Link
            href="/jelentkezz"
            className="border border-brand-gold/60 hover:border-brand-gold bg-brand-gold/5 hover:bg-brand-gold/10 text-brand-gold font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            <span aria-hidden>🥊</span>
            <span>
              {locale === 'ar'
                ? 'تقدم كمقاتل'
                : locale === 'en'
                ? 'Apply as a fighter'
                : 'Jelentkezz harcosnak'}
            </span>
          </Link>
          <Link
            href="/reality"
            className="border border-brand-dark-border hover:border-gray-400 text-gray-200 hover:text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            <span aria-hidden>🎬</span>
            <span>{locale === 'ar' ? 'EFU Reality' : locale === 'en' ? 'EFU Reality' : 'EFU Reality'}</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-dark-border py-8 px-4 text-center text-gray-600 text-sm">
        <p>© 2026 Elite Fight Universe. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'Minden jog fenntartva.'}</p>
      </footer>
    </main>
  );
}

/** Initial-loading skeleton — same shape as the real page, zero CLS. */
function RolunkSkeleton() {
  return (
    <main className="flex flex-col" aria-busy="true">
      <section className="py-20 sm:py-24 px-4 max-w-5xl mx-auto w-full text-center">
        <div className="h-4 w-20 mx-auto bg-brand-dark-border rounded mb-3" />
        <div className="h-12 w-2/3 mx-auto bg-brand-dark-border rounded mb-6" />
        <div className="h-4 w-full max-w-3xl mx-auto bg-brand-dark-border rounded mb-2" />
        <div className="h-4 w-2/3 mx-auto bg-brand-dark-border rounded" />
      </section>
      <section className="py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-dark rounded-xl p-6">
              <div className="h-7 w-7 bg-brand-dark-border rounded mb-4" />
              <div className="h-5 w-3/4 bg-brand-dark-border rounded mb-3" />
              <div className="h-3 w-full bg-brand-dark-border rounded mb-1" />
              <div className="h-3 w-5/6 bg-brand-dark-border rounded" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}