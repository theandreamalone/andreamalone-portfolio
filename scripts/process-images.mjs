// process-images.mjs — normalize raw Figma exports for the portfolio.
//
// Convention:
//   media/source/{slug}/*.(png|jpg|...)      -> public/media/{slug}/*.webp       max 1600px wide, no upscale
//   media/source/testimonials/*.*            -> public/media/testimonials/*.webp 560x740 center-crop
//
// No cropping of case-study screenshots, including cover — they're read for
// content, not composed as photography, and a center-crop silently loses
// whatever fell outside the crop box. Fixed dimensions stay only for
// testimonial photos, which are genuinely headshot-composed.
//
// Run: npm run images
// Idempotent: re-running overwrites outputs. Sources are never modified.

import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'media/source';
const OUT = 'public/media';
const IMG = /\.(png|jpe?g|webp|tiff?|avif)$/i;
const QUALITY = 82;

async function processFile(slug, file) {
  const inPath = path.join(SRC, slug, file);
  const base = file.replace(IMG, '');
  const outDir = path.join(OUT, slug);
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${base}.webp`);

  let img = sharp(inPath);
  let preset;
  if (slug === 'testimonials') {
    img = img.resize(560, 740, { fit: 'cover', position: 'centre' });
    preset = 'testimonial 560x740';
  } else {
    img = img.resize({ width: 1600, withoutEnlargement: true });
    preset = 'screenshot max-1600w';
  }

  await img.webp({ quality: QUALITY }).toFile(outPath);
  const { width, height } = await sharp(outPath).metadata();
  const kb = Math.round((await stat(outPath)).size / 1024);
  console.log(`  ${outPath}  ${width}x${height}  ${kb}KB  [${preset}]`);
}

let dirs;
try {
  dirs = (await readdir(SRC, { withFileTypes: true })).filter((d) => d.isDirectory());
} catch {
  console.error(`No ${SRC}/ folder found. Create ${SRC}/{slug}/ and drop exports in.`);
  process.exit(1);
}

let count = 0;
for (const dir of dirs) {
  const files = (await readdir(path.join(SRC, dir.name))).filter((f) => IMG.test(f));
  if (files.length === 0) continue;
  console.log(`${dir.name}/`);
  for (const file of files) {
    await processFile(dir.name, file);
    count++;
  }
}
console.log(count ? `Done — ${count} image(s) processed.` : 'No images found in media/source/*/.');
