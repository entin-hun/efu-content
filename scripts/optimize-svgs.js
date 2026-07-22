#!/usr/bin/env node
/**
 * SVG optimalizáló script
 * - Fájlméret csökkentése SVGO-val
 * - Accessibility attribútumok hozzáadása
 * - Reszponzív viewBox beállítás
 */

const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');

const LOGOS_DIR = path.join(__dirname, '../public/logos');

// Minimális optimalizálás - csak felesleges whitespace és kommentek törlése
const plugins = [
  {
    name: 'preset-default',
    params: {
      overrides: {
        removeViewBox: false,
        collapseGroups: false,
        mergePaths: false,
        convertPathData: false,
        removeHiddenElems: false,
        removeEmptyAttrs: false,
        removeEmptyContainers: false,
        removeUselessDefs: false,
        cleanupIds: false,
      },
    },
  },
];

async function optimizeSvg(filePath) {
  const fileName = path.basename(filePath);
  console.log(`Optimalizálás: ${fileName}`);
  
  const svgString = fs.readFileSync(filePath, 'utf8');
  
  const result = optimize(svgString, {
    path: filePath,
    plugins,
  });
  
  // Accessibility: title és desc hozzáadása ha nincs
  let optimized = result.data;
  
  const baseName = path.basename(fileName, '.svg');
  const titleMap = {
    'efu-logo': 'EFU Logo',
    'elite-fight-universe': 'Elite Fight Universe Logo',
    'fight-night': 'EFU Fight Night Logo',
    'fight-tv': 'EFU Fight TV Logo',
    'reality': 'EFU Reality Logo',
  };
  
  const title = titleMap[baseName] || 'EFU Logo';
  
  // Title hozzáadása ha nincs
  if (!optimized.includes('<title>')) {
    optimized = optimized.replace(
      /<svg([^>]*)>/,
      `<svg$1><title>${title}</title>`
    );
  }
  
  fs.writeFileSync(filePath, optimized, 'utf8');
  
  const originalSize = Buffer.byteLength(svgString, 'utf8');
  const optimizedSize = Buffer.byteLength(optimized, 'utf8');
  const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
  
  console.log(`  Eredeti: ${(originalSize / 1024).toFixed(1)}KB`);
  console.log(`  Optimalizált: ${(optimizedSize / 1024).toFixed(1)}KB`);
  console.log(`  Megtakarítás: ${savings}%`);
  console.log('');
}

async function main() {
  console.log('SVG optimalizálás indítása...\n');
  
  const files = fs.readdirSync(LOGOS_DIR)
    .filter(f => f.endsWith('.svg'))
    .map(f => path.join(LOGOS_DIR, f));
  
  for (const file of files) {
    await optimizeSvg(file);
  }
  
  console.log('Kész!');
}

main().catch(console.error);
