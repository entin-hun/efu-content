import Image from 'next/image';

interface Props {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Elite Fight Universe teljes logó komponens
 * - WebP formátum a public/logos/ mappából
 * - Reszponzív méretezés
 * - Hover animáció (scale)
 */
export function EliteFightUniverseLogo({
  width = 400,
  height = 200,
  className = '',
  priority = false,
}: Props) {
  return (
    <div
      className={`group transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <Image
        src="/logos/elite-fight-universe.webp"
        alt="Elite Fight Universe"
        width={width}
        height={height}
        priority={priority}
        className="max-w-full h-auto"
      />
    </div>
  );
}
