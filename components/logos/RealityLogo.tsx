import Image from 'next/image';

interface Props {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * EFU Reality logó komponens
 * - WebP formátum a public/logos/ mappából
 * - Reszponzív méretezés
 * - Hover animáció (scale)
 */
export function RealityLogo({
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
        src="/logos/reality.webp"
        alt="EFU Reality"
        width={width}
        height={height}
        priority={priority}
        className="max-w-full h-auto"
      />
    </div>
  );
}
