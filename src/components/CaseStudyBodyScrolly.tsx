/**
 * CaseStudyBodyScrolly — Phase 4 scrollytelling layout.
 *
 * Two columns at lg+: LEFT sticky media pane, RIGHT prose blocks.
 * The pane shows the media of the block currently in view (IntersectionObserver
 * on each block; the crossfade is CSS, disabled under prefers-reduced-motion).
 * Below lg: the pane is hidden and each block's media renders inline above
 * its prose — same components, no pinning.
 *
 * Media comes from each section block's own frontmatter:
 *
 *   media:
 *     - kind: bento | carousel | single
 *       perView: 2            # carousel only, optional
 *       images:
 *         - src: /media/{cs-slug}/{name}.webp
 *           alt: "..."
 *           wide: true        # bento tiles only
 *
 * `media:` is frontend-only — it never syncs to Supabase (render concern,
 * not selection metadata).
 *
 * Blocks without media keep the previous block's media in the pane (v1
 * simplification; the spec's full-width-prose variant is deferred).
 * If NO block has media, callers should use the standard CaseStudyBody.
 */

import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { blockFrontmatter, resolveBlock } from '@/lib/blockRegistry';
import type { BlockId } from '@/lib/viewContract';
import ImageBento from '@/components/media/ImageBento';
import ImageCarousel from '@/components/media/ImageCarousel';
import MdxImage from '@/components/media/MdxImage';
import './case-study-body.css';

const MDX_COMPONENTS = { ImageBento, ImageCarousel, img: MdxImage };
type MdxBlock = ComponentType<{ components?: Record<string, ComponentType<never>> }>;

export interface MediaImageSpec {
  src: string;
  alt: string;
  wide?: boolean;
}

export interface MediaSpec {
  kind: 'bento' | 'carousel' | 'single';
  images: MediaImageSpec[];
  perView?: number;
}

interface SectionEntry {
  mdx_slug?: string;
  order?: number;
}

interface ScrollyBlock {
  id: BlockId;
  Component: MdxBlock;
  media: MediaSpec[];
}

function MediaSet({ specs }: { specs: MediaSpec[] }) {
  return (
    <>
      {specs.map((m, i) => {
        if (!m?.images?.length) return null;
        if (m.kind === 'bento') return <ImageBento key={i} images={m.images} />;
        if (m.kind === 'carousel')
          return <ImageCarousel key={i} images={m.images} perView={m.perView ?? 1} />;
        const img = m.images[0];
        return <MdxImage key={i} src={img.src} alt={img.alt} />;
      })}
    </>
  );
}

export function collectScrollyBlocks(slug: string): ScrollyBlock[] {
  const csFm = blockFrontmatter(`block:${slug}` as BlockId);
  const sections = Array.isArray(csFm?.sections)
    ? (csFm!.sections as SectionEntry[])
    : [];

  return [...sections]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .flatMap((s) => {
      if (!s.mdx_slug) return [];
      const id = `block:${s.mdx_slug}` as BlockId;
      const Component = resolveBlock(id) as MdxBlock | null;
      if (!Component) return [];
      const fm = blockFrontmatter(id);
      if (fm?.status === 'draft') return [];
      const media = Array.isArray(fm?.media) ? (fm!.media as MediaSpec[]) : [];
      return [{ id, Component, media }];
    });
}

export default function CaseStudyBodyScrolly({ slug }: { slug: string }) {
  const blocks = useMemo(() => collectScrollyBlocks(slug), [slug]);
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = refs.current.indexOf(entry.target as HTMLElement);
          if (idx >= 0) setActive(idx);
        }
      },
      // Activate when a block crosses the middle band of the viewport
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [blocks]);

  if (blocks.length === 0) return null;

  // Pane shows the active block's media; if the active block has none,
  // fall back to the most recent block that does.
  let paneMedia: MediaSpec[] = [];
  let paneKey = 0;
  for (let i = active; i >= 0; i--) {
    if (blocks[i].media.length > 0) {
      paneMedia = blocks[i].media;
      paneKey = i;
      break;
    }
  }

  return (
    <div className="row g-lg-5 g-4 cs-scrolly">
      {/* Sticky media pane — lg+ only */}
      <div className="col-lg-6 d-none d-lg-block">
        <div className="cs-scrolly-pane">
          {paneMedia.length > 0 && (
            <div key={paneKey} className="cs-scrolly-pane-media">
              <MediaSet specs={paneMedia} />
            </div>
          )}
        </div>
      </div>

      {/* Prose blocks */}
      <div className="col-lg-6">
        <div className="case-study-body">
          {blocks.map(({ id, Component, media }, i) => (
            <section
              key={id}
              ref={(el) => { refs.current[i] = el; }}
              className="case-study-body-section cs-scrolly-block"
            >
              {/* Inline media below lg — same specs, no pane */}
              {media.length > 0 && (
                <div className="d-lg-none">
                  <MediaSet specs={media} />
                </div>
              )}
              <Component components={MDX_COMPONENTS} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
