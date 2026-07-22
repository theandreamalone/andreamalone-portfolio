// One entry per image, keyed by a stable ID you reference from MDX.
// This is the single source of truth for path + alt text + presentation.

export type ImageLayout =
  | "full"          // full-bleed, own row
  | "inset"         // constrained width, floats within copy
  | "side-by-side"  // paired with another image or with text column
  | "annotated";     // full width + caption/callout styling

export interface ImageEntry {
  id: string;              // e.g. "dynamo-dashboard-dark" — what you type in MDX
  src: string;              // e.g. "/case-studies/dynamo/dynamo-dashboard-dark.webp"
  alt: string;               // required — build fails if missing or still "VERIFY: ..."
  caption?: string;
  layout: ImageLayout;
  width: number;             // intrinsic px, from the exported file
  height: number;
  status?: "verified" | "draft"; // "draft" = alt text was auto-generated, needs eyes
}

export type ImageManifest = Record<string, ImageEntry>;
