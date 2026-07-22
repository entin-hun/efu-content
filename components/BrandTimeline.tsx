'use client';

interface Props {
  about: Record<string, unknown> | null;
  getString: (path: string, fallback?: string) => string;
}

/**
 * EFU brand timeline — three-step career path visualised as a
 * horizontal timeline on desktop and stacked cards on mobile.
 *
 * Steps: EFU Reality → EFU Fight Night → Pro career.
 *
 * Uses CSS logical properties (ms-/me- for RTL-safe margins) so the
 * Arabic locale doesn't have to override the layout.
 */
export function BrandTimeline({ about, getString }: Props) {
  const steps = [
    {
      key: 'step1',
      label: getString('timeline.step1Label'),
      title: getString('timeline.step1Title'),
      desc: getString('timeline.step1Desc'),
    },
    {
      key: 'step2',
      label: getString('timeline.step2Label'),
      title: getString('timeline.step2Title'),
      desc: getString('timeline.step2Desc'),
    },
    {
      key: 'step3',
      label: getString('timeline.step3Label'),
      title: getString('timeline.step3Title'),
      desc: getString('timeline.step3Desc'),
    },
  ];

  const loading = !about;

  return (
    <div className="relative">
      {/* Connecting line: dashed gradient line behind the cards.
          `dir="rtl"` on the parent <html> flips it via logical inset. */}
      <div
        aria-hidden
        className="hidden md:block absolute top-[42px] start-0 end-0 h-0.5
                   bg-gradient-to-r from-transparent via-brand-red/50 to-transparent"
        style={{ direction: 'inherit' }}
      />

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((s, idx) => (
          <li key={s.key} className="relative">
            {/* Numbered badge — sits on the timeline line on desktop */}
            <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-0">
              <div className="shrink-0 flex items-center justify-center w-[60px] h-[60px] rounded-full bg-brand-dark border-2 border-brand-red text-brand-red font-black text-xl shadow-[0_0_24px_rgba(220,38,38,0.35)] z-10"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
                aria-hidden
              >
                {idx + 1}
              </div>
              <div className="md:mt-4 md:ps-1 flex-1">
                <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-brand-red mb-1">
                  {loading ? '···' : s.label}
                </p>
                <h4
                  className="text-lg sm:text-xl font-black uppercase text-white mb-2"
                  style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
                >
                  {loading ? '···' : s.title}
                </h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {loading ? '…' : s.desc}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}