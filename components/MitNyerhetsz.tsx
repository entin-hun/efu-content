export function MitNyerhetsz() {
  const bullets = [
    'EFU harcosi szerződés megszerzésére',
    'szereplésre az EFU Fight Night eseményeken',
    'kiemelt média-megjelenésekre',
    'interjúra és promóciós tartalmakban való részvételre',
    'hosszú távú együttműködésre az Elite Fight Universe rendszerében',
  ];

  return (
    <div>
      <div className="text-center mb-10">
        <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-2">
          A szezon tétje
        </p>
        <h2
          className="text-4xl sm:text-5xl font-black uppercase text-white"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
        >
          Mit nyerhetsz?
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
          Az EFU Reality résztvevői nem csupán egy versenyben vesznek részt. A műsor célja nem
          kizárólag egyetlen győztes kiválasztása, hanem a következő EFU harcosgeneráció
          felfedezése és felépítése. A verseny során a résztvevők lehetőséget kapnak arra, hogy
          bizonyítsák rátermettségüket, felépítsék saját közönségüket, és megtegyék az első
          lépéseket egy professzionális harcosi karrier felé. Az EFU szakmai stábja a teljes
          szezon alatt figyelemmel kíséri a versenyzők teljesítményét, fejlődését, hozzáállását
          és karakterét. A legjobban teljesítő résztvevők lehetőséget kaphatnak arra, hogy
          csatlakozzanak az Elite Fight Universe hivatalos harcosállományához, és szerepeljenek a
          jövőbeli EFU Fight Night eseményeken.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HERO card — Fődíj, spans full width on mobile top, on md takes half */}
        <div className="md:col-span-2 card-dark rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden">
          {/* Subtle gold glow background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at center, rgba(245,158,11,0.35) 0%, transparent 65%)',
            }}
          />
          <div className="relative z-10">
            <p className="text-brand-red text-sm uppercase tracking-widest font-semibold mb-3">
              Fődíj
            </p>
            <div
              className="text-5xl sm:text-6xl md:text-7xl font-black mb-4 text-gradient-gold"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: '-0.02em' }}
            >
              🏆 10.000.000 Ft
            </div>
            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
              A szezon győztese 10 millió forintos fődíjban részesül.
            </p>
          </div>
        </div>

        {/* Karrierlehetőség card — bulleted */}
        <div className="md:col-span-2 card-dark rounded-2xl p-6 sm:p-8">
          <h3
            className="text-2xl sm:text-3xl font-black uppercase text-white mb-3"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            Karrierlehetőség
          </h3>
          <p className="text-gray-300 mb-5 text-sm sm:text-base leading-relaxed">
            Az EFU Reality nem csak a győztesről szól. A legkiemelkedőbb versenyzők számára
            lehetőség nyílhat:
          </p>
          <ul className="space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-gray-200 text-sm sm:text-base">
                <span
                  className="mt-1 inline-block flex-shrink-0 w-2 h-2 rounded-full bg-brand-red"
                  aria-hidden="true"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Closing line */}
      <p className="text-center text-gray-400 mt-10 text-base sm:text-lg italic max-w-2xl mx-auto">
        10 millió forint a fődíj.{' '}
        <span className="text-white not-italic font-semibold">
          A valódi nyeremény azonban egy hely az Elite Fight Universe világában.
        </span>
      </p>
    </div>
  );
}