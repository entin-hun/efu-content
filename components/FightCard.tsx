const fights = [
  {
    id: 1,
    type: 'Main Event · Championship',
    fighter1: { name: 'HAMAROSAN', record: '...', country: '🥊', nickname: '' },
    fighter2: { name: 'HAMAROSAN', record: '...', country: '🥊', nickname: '' },
    rounds: 5,
  },
  {
    id: 2,
    type: 'Co-Main Event',
    fighter1: { name: 'HAMAROSAN', record: '...', country: '🥊', nickname: '' },
    fighter2: { name: 'HAMAROSAN', record: '...', country: '🥊', nickname: '' },
    rounds: 3,
  },
  {
    id: 3,
    type: 'Undercard',
    fighter1: { name: 'HAMAROSAN', record: '...', country: '🥊', nickname: '' },
    fighter2: { name: 'HAMAROSAN', record: '...', country: '🥊', nickname: '' },
    rounds: 3,
  },
  {
    id: 4,
    type: 'Undercard',
    fighter1: { name: 'HAMAROSAN', record: '...', country: '🥊', nickname: '' },
    fighter2: { name: 'HAMAROSAN', record: '...', country: '🥊', nickname: '' },
    rounds: 3,
  },
];

function FightRow({
  fight,
  isMain,
}: {
  fight: (typeof fights)[0];
  isMain: boolean;
}) {
  return (
    <div
      className={`card-dark rounded-2xl overflow-hidden ${
        isMain ? 'border-brand-red/40 animate-pulse-glow' : ''
      }`}
    >
      {/* Type label */}
      <div
        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest text-center ${
          isMain ? 'bg-brand-red text-white' : 'bg-brand-dark-muted text-gray-400'
        }`}
      >
        {fight.type}
      </div>

      <div className="p-4 sm:p-6 flex items-center gap-4">
        {/* Fighter 1 */}
        <div className="flex-1 text-right">
          <div
            className={`text-lg sm:text-2xl font-black uppercase ${
              isMain ? 'text-white' : 'text-gray-200'
            }`}
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {fight.fighter1.name}
          </div>
          <div className="text-brand-gold text-xs mt-0.5">{fight.fighter1.nickname}</div>
          <div className="text-gray-500 text-xs mt-1 flex items-center justify-end gap-1">
            <span>{fight.fighter1.country}</span>
            <span className="text-gray-600">·</span>
            <span>{fight.fighter1.record}</span>
          </div>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1 min-w-[60px]">
          <div
            className={`text-2xl sm:text-3xl font-black ${
              isMain ? 'text-brand-red' : 'text-gray-600'
            }`}
            style={{ fontFamily: 'Impact' }}
          >
            VS
          </div>
          <div className="text-xs text-gray-600 uppercase tracking-wider">{fight.rounds}R</div>
        </div>

        {/* Fighter 2 */}
        <div className="flex-1 text-left">
          <div
            className={`text-lg sm:text-2xl font-black uppercase ${
              isMain ? 'text-white' : 'text-gray-200'
            }`}
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {fight.fighter2.name}
          </div>
          <div className="text-brand-gold text-xs mt-0.5">{fight.fighter2.nickname}</div>
          <div className="text-gray-500 text-xs mt-1 flex items-center gap-1">
            <span>{fight.fighter2.country}</span>
            <span className="text-gray-600">·</span>
            <span>{fight.fighter2.record}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FightCard() {
  return (
    <div className="flex flex-col gap-4">
      {fights.map((fight, i) => (
        <FightRow key={fight.id} fight={fight} isMain={i === 0} />
      ))}
    </div>
  );
}
