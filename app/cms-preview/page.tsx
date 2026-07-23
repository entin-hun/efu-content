import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import type { Page, Block } from '@/lib/cms/types';

/**
 * CMS Preview oldal
 * Ez az oldal a data/cms/pages/ könyvtárból olvassa be az oldalakat
 * és megjeleníti a tartalmukat, hogy tesztelni lehessen a CMS szerkesztést.
 */

async function readPage(slug: string): Promise<Page | null> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'cms', 'pages', `${slug}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as Page;
  } catch {
    return null;
  }
}

const hu = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.hu || val.en || '';
};

function BlockRenderer({ block }: { block: Block }) {
  if (!block.visible) return null;

  const paddingClass = {
    none: 'p-0',
    small: 'py-4',
    medium: 'py-8',
    large: 'py-16',
  }[block.settings.padding || 'medium'];

  const bgStyle = block.settings.backgroundColor
    ? { backgroundColor: block.settings.backgroundColor }
    : {};

  const c = block.content || {};

  // HERO block
  if (block.type === 'hero') {
    return (
      <section className={`${paddingClass} relative overflow-hidden`} style={bgStyle}>
        <div className="container mx-auto px-4 text-center max-w-5xl">
          {c.badge && (
            <span className="inline-block text-brand-gold text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4">
              {hu(c.badge)}
            </span>
          )}
          {c.title && (
            <h1 className="text-4xl md:text-6xl font-black uppercase text-white mb-3" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
              {hu(c.title)}
            </h1>
          )}
          {c.location && (
            <p className="text-base sm:text-lg text-gray-300 font-medium mb-1">{hu(c.location)}</p>
          )}
          {c.date && (
            <p className="text-gray-500 mb-5 text-xs sm:text-sm uppercase tracking-widest">{hu(c.date)}</p>
          )}
          {c.subtitle && (
            <p className="text-gray-300 max-w-3xl mx-auto mb-7 text-sm sm:text-base leading-relaxed italic">
              {hu(c.subtitle)}
            </p>
          )}
          {c.statusBadge && (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/40 text-brand-gold text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-4">
              {hu(c.statusBadge)}
            </span>
          )}
          {c.ctaPrimary && (
            <div className="mb-3">
              <a href={hu(c.ctaPrimary.link)} className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-red-700 transition">
                {hu(c.ctaPrimary.text)}
              </a>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto">
            {c.ctaSecondary1 && (
              <a href={hu(c.ctaSecondary1.link)} className="border border-gray-700 hover:border-red-600 text-gray-200 hover:text-white font-semibold py-3.5 px-5 rounded-lg transition text-sm sm:text-base">
                {hu(c.ctaSecondary1.text)}
              </a>
            )}
            {c.ctaSecondary2 && (
              <a href={hu(c.ctaSecondary2.link)} className="border border-gray-700 hover:border-gray-400 text-gray-200 hover:text-white font-semibold py-3.5 px-5 rounded-lg transition text-sm sm:text-base">
                {hu(c.ctaSecondary2.text)}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // TEXT block (generic — handles all text-based sections)
  if (block.type === 'text') {
    const hasPillars = Array.isArray(c.pillars);
    const hasCards = Array.isArray(c.cards);
    const hasRules = Array.isArray(c.rules);
    const hasBadges = Array.isArray(c.badges);

    // Pillars layout
    if (hasPillars) {
      return (
        <section className={`${paddingClass} px-4 max-w-5xl mx-auto w-full`} style={bgStyle}>
          {c.eyebrow && <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2 text-center">{hu(c.eyebrow)}</p>}
          {c.title && <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-10 text-center" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>{hu(c.title)}</h2>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.pillars.map((p: any, i: number) => (
              <div key={i} className="card-dark rounded-2xl p-6 text-center">
                {p.icon && <div className="text-4xl mb-4">{p.icon}</div>}
                {p.label && <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block mb-2">{hu(p.label)}</span>}
                {p.title && <h3 className="text-2xl font-black uppercase text-white mb-3" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>{hu(p.title)}</h3>}
                {p.body && <p className="text-gray-400 text-sm leading-relaxed">{hu(p.body)}</p>}
              </div>
            ))}
          </div>
        </section>
      );
    }

    // Cards layout (mi várható)
    if (hasCards) {
      return (
        <section className={`${paddingClass} px-4 max-w-5xl mx-auto w-full`} style={bgStyle}>
          {c.eyebrow && <p className="text-brand-gold text-sm uppercase tracking-widest font-semibold mb-2 text-center">{hu(c.eyebrow)}</p>}
          {c.title && <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-6 text-center" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>{hu(c.title)}</h2>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.cards.map((card: any, i: number) => (
              <div key={i} className="card-dark rounded-2xl p-6 text-center">
                {card.icon && <div className="text-4xl mb-4">{card.icon}</div>}
                {card.title && <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>{hu(card.title)}</h3>}
                {card.body && <p className="text-gray-400 text-sm leading-relaxed">{hu(card.body)}</p>}
                {card.badge && <span className="block mt-2 text-brand-gold font-semibold text-xs">{hu(card.badge)}</span>}
              </div>
            ))}
          </div>
        </section>
      );
    }

    // Rules layout
    if (hasRules) {
      return (
        <section className={`${paddingClass} px-4 max-w-5xl mx-auto w-full`} style={bgStyle}>
          {c.eyebrow && <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2 text-center">{hu(c.eyebrow)}</p>}
          {c.title && <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4 text-center" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>{hu(c.title)}</h2>}
          {c.body && <p className="text-gray-300 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed mb-6 text-center">{hu(c.body)}</p>}
          {c.ctaText && c.ctaLink && (
            <div className="text-center mb-10">
              <a href={hu(c.ctaLink)} className="inline-flex items-center gap-2 text-brand-red hover:text-red-400 font-semibold text-sm sm:text-base">
                {hu(c.ctaText)} <span>→</span>
              </a>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {c.rules.map((rule: any, i: number) => (
              <div key={i} className="card-dark rounded-xl p-6">
                {rule.title && <h3 className="text-2xl font-black uppercase text-white mb-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>{hu(rule.title)}</h3>}
                {rule.subtitle && <p className="text-gray-500 text-sm mb-4">{hu(rule.subtitle)}</p>}
                {rule.items && (
                  <ul className="space-y-2">
                    {rule.items.map((item: any, j: number) => (
                      <li key={j} className="text-gray-300 text-sm flex items-center gap-2">
                        <span className="text-brand-red">▸</span> {hu(item)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    // Footer layout
    if (hasBadges) {
      return (
        <footer className={`border-t border-gray-800 ${paddingClass} px-4 text-center text-gray-600 text-sm`} style={bgStyle}>
          {c.title && <p>{hu(c.title)}</p>}
          {c.badges && (
            <p className="mt-1 flex items-center justify-center gap-2 flex-wrap">
              {c.badges.map((b: any, i: number) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider">
                  {hu(b)}
                </span>
              ))}
            </p>
          )}
        </footer>
      );
    }

    // Default text layout (mi-az-efu, fight-night, kuldetesunk)
    return (
      <section className={`${paddingClass} px-4 max-w-5xl mx-auto w-full`} style={bgStyle}>
        <div className="text-center mb-10">
          {c.eyebrow && <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2">{hu(c.eyebrow)}</p>}
          {c.title && <h2 className="text-4xl sm:text-5xl font-black uppercase text-white mb-4" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>{hu(c.title)}</h2>}
          {c.body && <p className="text-gray-300 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed mb-6">{hu(c.body)}</p>}
          {c.body2 && <p className="text-gray-400 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed mb-6">{hu(c.body2)}</p>}
          {c.ctaText && c.ctaLink && (
            <a href={hu(c.ctaLink)} className="inline-flex items-center gap-2 text-brand-red hover:text-red-400 font-semibold text-sm sm:text-base">
              {hu(c.ctaText)} <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </section>
    );
  }

  // Unknown block type — show raw JSON
  return (
    <section className={paddingClass} style={bgStyle}>
      <div className="container mx-auto px-4">
        <div className="border border-dashed border-gray-600 rounded-lg p-6">
          <p className="text-gray-500 text-sm mb-2">
            Ismeretlen blokk típus: <code className="text-brand-gold">{block.type}</code>
          </p>
          <pre className="text-xs text-gray-400 overflow-auto">
            {JSON.stringify(block.content, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}

export default async function CmsPreviewPage({
  searchParams,
}: {
  searchParams: { slug?: string };
}) {
  const slug = searchParams.slug || 'home';
  const page = await readPage(slug);

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* CMS Preview Banner */}
      <div className="bg-yellow-500 text-black px-4 py-2 text-center text-sm font-semibold">
        📝 CMS PREVIEW · Ez az oldal a <code className="font-mono">data/cms/pages/{slug}.json</code> fájlból töltődik be
      </div>

      {/* Navigation */}
      <nav className="bg-black/50 border-b border-gray-800 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/cms-preview" className="text-white font-bold">
            ← CMS Preview
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/cms-preview?slug=home" className="text-gray-300 hover:text-white">
              Főoldal
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white">
              ← Vissza a főoldalra
            </Link>
            <a
              href="https://shiny-sunflower-ee1f5e.netlify.app/admin/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:text-yellow-400"
            >
              CMS Admin →
            </a>
          </div>
        </div>
      </nav>

      {!page ? (
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400 mb-2">A keresett oldal nem található</p>
          <p className="text-gray-500 text-sm">
            Keresett slug: <code className="text-brand-gold">{slug}</code>
          </p>
        </div>
      ) : (
        <>
          {/* Page metadata */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
            <div className="container mx-auto flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span><strong className="text-white">Slug:</strong> {page.slug}</span>
              <span><strong className="text-white">Cím:</strong> {page.title.hu || page.title.en}</span>
              <span><strong className="text-white">Publikált:</strong> {page.published ? '✅ Igen' : '❌ Nem'}</span>
              <span><strong className="text-white">Blokkok:</strong> {page.blocks.length}</span>
              <span><strong className="text-white">Frissítve:</strong> {new Date(page.updatedAt).toLocaleString('hu-HU')}</span>
            </div>
          </div>

          {/* Render blocks */}
          {page.blocks.length === 0 ? (
            <div className="container mx-auto px-4 py-20 text-center">
              <p className="text-gray-400">Ezen az oldalon nincs tartalom.</p>
            </div>
          ) : (
            page.blocks
              .sort((a, b) => a.order - b.order)
              .map((block) => <BlockRenderer key={block.id} block={block} />)
          )}
        </>
      )}
    </div>
  );
}
