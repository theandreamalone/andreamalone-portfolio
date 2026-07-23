# Image workflow — old vs new

**Old:** anonymize → export → manually rename → import → open each MDX → hand-write
path + alt text → find the misspelling or wrong placement after publish.

**New:**

```
node scripts/figma-export.mjs <fileKey> "<Page Name>" <case-study-slug>
```
→ exports every frame on that page at 2x, saves to `public/media/case-studies/<slug>/`,
writes `content/case-studies/<slug>.manifest.ts` with draft entries.

Then in MDX:
```mdx
<Img id="ai-assistant-2025-dashboard-dark" />
```
No path, no re-typed alt text. Move the line to reposition the image.

Before publishing:
```
node scripts/validate-images.mjs
```
Fails the build on a missing file, missing alt text, or an un-reviewed
`VERIFY:` placeholder — the exact three failure modes from the manual process.

## One-time setup
1. `npm i` — no new deps beyond what a standard Next.js/MDX site already has.
2. `export FIGMA_TOKEN="figd_..."` (Figma → Settings → Personal access tokens).
3. Register each new manifest in `src/components/Img.tsx`'s `REGISTRY`.

## Still manual, by design
- **Alt text review.** Draft text comes from the frame name — always marked
  `status: "draft"` until you verify it against the real image and flip to `"verified"`.
- **Anonymization.** Do this in Figma before export (variants/variables), not after —
  see prior note on baking an "anonymized" component variant so export is a single toggle.
- **Layout judgment call.** The script guesses `full` vs `inset` from aspect ratio.
  Override per-instance: `<Img id="..." layoutOverride="side-by-side" />`.
