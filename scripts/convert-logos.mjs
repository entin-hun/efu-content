import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const INPUT_DIR = path.join(process.cwd(), 'EFU_concept');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'logos');

// Színek a sötét témához
const COLORS = {
  white: { r: 255, g: 255, b: 255 },
  red: { r: 220, g: 38, b: 38 },      // #DC2626
  gold: { r: 245, g: 158, b: 11 },    // #F59E0B
};

/**
 * Fekete-fehér logó átalakítása sötét témához:
 * - Fehér háttér → átlátszó
 * - Fekete betűk → megadott szín (fehér, piros, vagy arany)
 * - Anti-aliasing pixelek → interpolált szín
 */
async function convertLogo(inputFile, outputFile, color = COLORS.white) {
  const inputPath = path.join(INPUT_DIR, inputFile);
  const outputPath = path.join(OUTPUT_DIR, outputFile);

  // Olvassuk be a képet és konvertáljuk RGBA-ra
  const image = sharp(inputPath).ensureAlpha();
  
  // Nyers pixel adatok lekérése
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  // Pixel feldolgozás
  const output = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Fehér háttér → átlátszó (magas küszöb)
    if (r > 230 && g > 230 && b > 230) {
      output[i] = 0;
      output[i + 1] = 0;
      output[i + 2] = 0;
      output[i + 3] = 0;
    }
    // Fekete betűk → cél szín (teljes opacity)
    else if (r < 30 && g < 30 && b < 30) {
      output[i] = color.r;
      output[i + 1] = color.g;
      output[i + 2] = color.b;
      output[i + 3] = 255;
    }
    // Átmeneti pixelek (anti-aliasing) → cél szín magas opacity-val
    else {
      const brightness = (r + g + b) / 3;
      // Minél sötétebb a pixel, annál nagyobb az opacity
      const factor = Math.pow(1 - brightness / 255, 0.5); // gyökös interpoláció = erősebb
      output[i] = color.r;
      output[i + 1] = color.g;
      output[i + 2] = color.b;
      output[i + 3] = Math.round(255 * factor);
    }
  }
  
  // Mentsük el webp formátumban
  await sharp(output, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 90 })
    .toFile(outputPath);
  
  console.log(`✓ ${inputFile} → ${outputFile}`);
}

async function main() {
  // Biztosítsuk, hogy a kimeneti mappa létezik
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log('Logók átalakítása sötét témához...\n');

  // EFU monogram (fehér)
  await convertLogo('efu-1.webp', 'efu-logo.webp', COLORS.white);
  
  // Elite Fight Universe (fehér)
  await convertLogo('efu_elite_fight_universe.webp', 'elite-fight-universe.webp', COLORS.white);
  
  // Fight Night (piros)
  await convertLogo('efu_fight_night-3.webp', 'fight-night.webp', COLORS.red);
  
  // Fight TV (arany)
  await convertLogo('efu_fight_tv-3.webp', 'fight-tv.webp', COLORS.gold);
  
  // Reality (fehér)
  await convertLogo('efu_reality-3.webp', 'reality.webp', COLORS.white);

  console.log('\n✓ Minden logó elkészült!');
  console.log(`Kimenet: ${OUTPUT_DIR}`);
}

main().catch(console.error);
