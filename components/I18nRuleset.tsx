'use client';

interface Props {
  about: Record<string, unknown> | null;
  getString: (path: string, fallback?: string) => string;
  getArray: (path: string) => string[];
}

interface Rule {
  title: string;
  tagline: string;
  points: string[];
}

/**
 * I18n-aware EFU Ruleset. Reads bullet arrays directly from the loaded
 * `about.json` via getArray(path) so the original array structure
 * survives (the legacy flatten() only carries string leaves).
 */
export function I18nRuleset({ about, getString, getArray }: Props) {
  const standUpPoints = getArray('ruleset.standUpPoints');
  const hybridPoints = getArray('ruleset.hybridPoints');

  const rules: Rule[] = [
    {
      title: getString('ruleset.standUpTitle'),
      tagline: getString('ruleset.standUpTagline'),
      points: standUpPoints,
    },
    {
      title: getString('ruleset.hybridTitle'),
      tagline: getString('ruleset.hybridTagline'),
      points: hybridPoints,
    },
  ];

  const loading = !about;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {rules.map((r) => (
        <div
          key={r.title}
          className="card-dark rounded-xl p-6 hover:border-brand-dark-muted transition-colors"
        >
          <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
            <h3
              className="text-2xl font-black uppercase text-white"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {loading ? '···' : r.title}
            </h3>
            <span className="text-[10px] uppercase tracking-widest font-bold text-brand-red">
              {loading ? '···' : r.tagline}
            </span>
          </div>
          <ul className="space-y-2">
            {r.points.length === 0 && loading ? (
              <li className="text-sm text-gray-500">…</li>
            ) : (
              r.points.map((point, i) => (
                <li key={`${r.title}-${i}`} className="flex items-start gap-3 text-sm text-gray-300">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-red shrink-0"
                    aria-hidden
                  />
                  <span>{point}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}