import type { ImageManifest, ImageLayout } from "../types/image-manifest";

// Register each case study's manifest here. One line per case study.
import { aiAssistant2025Images } from "../../content/case-studies/ai-assistant-2025.manifest";

const REGISTRY: ImageManifest = {
  ...aiAssistant2025Images,
  // ...spread additional case-study manifests as you build them
};

const LAYOUT_CLASS: Record<ImageLayout, string> = {
  full: "img-full",
  inset: "img-inset",
  "side-by-side": "img-side-by-side",
  annotated: "img-annotated",
};

interface ImgProps {
  id: string;
  layoutOverride?: ImageLayout; // escape hatch for a one-off placement
}

export function Img({ id, layoutOverride }: ImgProps) {
  const entry = REGISTRY[id];

  if (!entry) {
    // Loud in dev, so a typo'd id surfaces immediately instead of a silent blank.
    throw new Error(
      `Img: no manifest entry for id "${id}". Check the case study's manifest file.`
    );
  }

  const layout = layoutOverride ?? entry.layout;

  return (
    <figure className={LAYOUT_CLASS[layout]}>
      <img
        src={entry.src}
        alt={entry.alt}
        width={entry.width}
        height={entry.height}
        loading="lazy"
        decoding="async"
      />
      {entry.caption && <figcaption>{entry.caption}</figcaption>}
    </figure>
  );
}
