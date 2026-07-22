import type { ReactNode } from 'react';

type Pillar = {
  title: string;
  tag: string;
  description: string;
  icon: ReactNode;
};

const pillars: Pillar[] = [
  {
    title: 'EFU Reality',
    tag: 'Tehetségkutatás',
    description:
      'Többhetes verseny- és tehetségkutató formátum. A résztvevők feladatokon, kihívásokon és küzdelmeken keresztül bizonyíthatják rátermettségüket, miközben a nézők betekintést nyernek a személyiségükbe, felkészülésükbe és mindennapjaikba.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'EFU Fight Night',
    tag: 'Gálasorozat',
    description:
      'Az EFU hivatalos gálasorozata. Kiemelt mérkőzések, rangsoroló összecsapások és bajnoki küzdelmek — amatőr, félprofi és profi versenyzőknek.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'EFU TV',
    tag: 'Digitális platform',
    description:
      'Az Elite Fight Universe digitális platformja. Élő közvetítések, reality epizódok, gálák, interjúk, háttéranyagok, exkluzív tartalmak.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function EfuPillars() {
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
              {p.tag}
            </span>
          </div>
          <h3
            className="text-2xl font-black uppercase text-white mb-3"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {p.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">{p.description}</p>
        </div>
      ))}
    </div>
  );
}