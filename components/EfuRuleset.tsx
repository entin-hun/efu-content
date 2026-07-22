type Rule = {
  title: string;
  tagline: string;
  points: string[];
};

const rules: Rule[] = [
  {
    title: 'EFU Stand-Up',
    tagline: 'Állóharc, földharc nélkül',
    points: ['MMA kesztyű', 'Kéz- és lábtechnikák', 'Földharc nélkül'],
  },
  {
    title: 'EFU Hybrid',
    tagline: 'Állóharc + korlátozott földharc',
    points: [
      'MMA kesztyű',
      'Állóharc és földharc kombinációja',
      'Korlátozott idejű földharc (20–30 másodperc)',
      'A bíró felállítja a versenyzőket',
      '3 × 3 perces menetek',
      '1 perces pihenőidő',
    ],
  },
];

export function EfuRuleset() {
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
              {r.title}
            </h3>
            <span className="text-[10px] uppercase tracking-widest font-bold text-brand-red">
              {r.tagline}
            </span>
          </div>
          <ul className="space-y-2">
            {r.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}