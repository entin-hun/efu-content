interface SvgLogoProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Általános SVG logó komponens
 * - Reszponzív méretezés
 * - Accessibility támogatás
 * - Lazy loading (priority=false)
 * - SVG fájlokhoz optimalizálva (nem használ Next/Image-t)
 */
export function SvgLogo({
  src,
  alt,
  width = 400,
  height = 200,
  className = '',
  priority = false,
}: SvgLogoProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`max-w-full h-auto ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
