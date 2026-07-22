import Image from 'next/image';

interface Props {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * EFU Fight Night logó komponens
 * - WebP formátum a public/logos/ mappából
 * - Reszponzív méretezés
 * - Hover animáció (scale)
 */
export function FightNightLogo({
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
        src="/logos/fight-night.webp"
        alt="EFU Fight Night"
        width={width}
        height={height}
        priority={priority}
        className="max-w-full h-auto"
      />
    </div>
  );
}
