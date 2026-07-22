'use client';

import type { ReactNode } from 'react';

type Pillar = {
  title: string;
  tag: string;
  description: string;
  icon: ReactNode;
};

const icons: Record<string, ReactNode> = {
  reality: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  fightNight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  tv: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

interface Props {
  about: Record<string, unknown> | null;
  getString: (path: string, fallback?: string) => string;
}

/**
 * I18n-aware EFU Pillars section. Reads pillar titles/tags/descriptions
 * from the loaded `about.json` via the `getString(path)` helper so
 * arrays and dotted paths are preserved (the legacy flatten() drops
 * non-string leaves).
 */
export function I18nPillars({ about, getString }: Props) {
  const pillars: Pillar[] = [
    {
      title: getString('pillars.realityTitle'),
      tag: getString('pillars.realityTag'),
      description: getString('pillars.realityDesc'),
      icon: icons.reality,
    },
    {
      title: getString('pillars.fightNightTitle'),
      tag: getString('pillars.fightNightTag'),
      description: getString('pillars.fightNightDesc'),
      icon: icons.fightNight,
    },
    {
      title: getString('pillars.tvTitle'),
      tag: getString('pillars.tvTag'),
      description: getString('pillars.tvDesc'),
      icon: icons.tv,
    },
  ];

  // Skeleton while the locale message is loading — keeps layout stable.
  const loading = !about;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {pillars.map((p) => (
        <div
          key={p.title}
          className="card-dark rounded-xl p-6 hover:border-brand-dark-muted transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-brand-red group-hover:text-red-400 transition-colors">{p.icon}</div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
              {loading ? '···' : p.tag}
            </span>
          </div>
          <h3
            className="text-2xl font-black uppercase text-white mb-3"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {loading ? '···' : p.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {loading ? <span className="opacity-50">…</span> : p.description}
          </p>
        </div>
      ))}
    </div>
  );
}