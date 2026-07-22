/**
 * Animated EFU logo for the hero.
 *
 * Pure CSS + SVG so there's no Lottie runtime, no extra dependency, and the
 * animation ships zero JS. The mark scales in, sweeps a red→gold gradient
 * sweep across the letters, and settles into a slow breathing glow.
 *
 * Designed to be the LCP candidate (no image fetch, inline SVG, system font).
 */

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { mark: 'w-10 h-10 text-base', text: 'text-xl' },
  md: { mark: 'w-14 h-14 text-lg', text: 'text-2xl sm:text-3xl' },
  lg: { mark: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl', text: 'text-4xl sm:text-5xl md:text-6xl' },
} as const;

export function EfuLogo({ size = 'lg', className = '' }: Props) {
  const s = sizeMap[size];
  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      {/* Mark — gradient hexagon with EFU monogram */}
      <div
        className={`relative ${s.mark} flex items-center justify-center font-black text-white animate-efu-mark`}
        style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          background: 'linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)',
          clipPath:
            'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)',
          letterSpacing: '-0.04em',
          textShadow: '0 0 12px rgba(220,38,38,0.6)',
        }}
        aria-hidden="true"
      >
        <span className="relative z-10">EFU</span>
        {/* Inner ring pulse */}
        <span
          className="absolute inset-0 animate-efu-pulse"
          style={{
            clipPath:
              'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)',
            boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.5)',
          }}
        />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className={`${s.text} font-black uppercase tracking-tight animate-efu-wordmark`}
          style={{
            fontFamily: 'Impact, Arial Black, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          <span className="text-white">ELITE FIGHT</span>
        </span>
        <span
          className={`${s.text} font-black uppercase tracking-tight animate-efu-wordmark-delay`}
          style={{
            fontFamily: 'Impact, Arial Black, sans-serif',
            letterSpacing: '-0.02em',
            background:
              'linear-gradient(90deg, #DC2626 0%, #F59E0B 50%, #DC2626 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'efu-gradient 6s linear infinite',
          }}
        >
          UNIVERSE
        </span>
      </div>
    </div>
  );
}