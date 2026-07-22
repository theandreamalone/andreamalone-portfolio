#!/usr/bin/env node
// Run in CI / pre-build. Catches the three failure modes from the manual workflow:
// misspelled path, missing alt text, and un-reviewed "VERIFY" placeholders.
//
// Usage: node scripts/validate-images.mjs

import { readdirSync, existsSync, statSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";

const CASE_STUDIES_DIR = path.resolve("content/case-studies");
const PUBLIC_DIR = path.resolve("public");

let errors = [];
let warnings = [];

const manifestFiles = readdirSync(CASE_STUDIES_DIR).filter((f) =>
  f.endsWith(".manifest.ts")
);

for (const file of manifestFiles) {
  const mod = await import(pathToFileURL(path.join(CASE_STUDIES_DIR, file)).href);
  const manifest = Object.values(mod)[0]; // each file exports one named manifest object

  for (const [id, entry] of Object.entries(manifest)) {
    const filePath = path.join(PUBLIC_DIR, entry.src);

    if (!existsSync(filePath)) {
      errors.push(`[${file}] "${id}": src does not resolve → ${entry.src}`);
    }

    if (!entry.alt || entry.alt.trim() === "") {
      errors.push(`[${file}] "${id}": missing alt text`);
    } else if (entry.alt.startsWith("VERIFY")) {
      warnings.push(`[${file}] "${id}": alt text still marked VERIFY`);
    }

    if (existsSync(filePath)) {
      // Rough 2x quality gate: rendered width is unknown here, so this just flags
      // suspiciously small files relative to their declared intrinsic width.
      const size = statSync(filePath).size;
      if (size < 5_000 && entry.width > 300) {
        warnings.push(`[${file}] "${id}": file is only ${size}B — check export quality`);
      }
    }
  }
}

if (warnings.length) {
  console.warn(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.warn("  ⚠", w));
}

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.error("  ✗", e));
  process.exit(1);
}

console.log(`\n✓ All image manifests valid (${manifestFiles.length} file(s) checked).`);
