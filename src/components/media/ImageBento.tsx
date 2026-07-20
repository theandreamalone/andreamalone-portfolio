/**
 * ImageBento — the portfolio-details image grid, reusable anywhere in a
 * case study body. Every tile expands into the shared Lightbox.
 *
 * MDX usage (no import needed — supplied via CaseStudyBody's components map):
 *
 *   <ImageBento images={[
 *     { src: "/media/{slug}/a.webp", alt: "..." },
 *     { src: "/media/{slug}/b.webp", alt: "..." },
 *     { src: "/media/{slug}/c.webp", alt: "...", wide: true },
 *   ]} />
 *
 * Rule: `wide: true` -> full row; otherwise half (stacks on mobile).
 */

import { useState } from 'react';
import Lightbox, { type LightboxImage } from './Lightbox';

interface BentoImage extends LightboxImage {
  wide?: boolean;
}

interface ImageBentoProps {
  images: BentoImage[];
}

export default function ImageBento({ images }: ImageBentoProps) {
  const [open, setOpen] = useState<number | null>(null);

  if (!images?.length) return null;

  return (
    <div className="block-image my-4">
      <div className="row g-4">
        {images.map((img, i) => (
          <div key={img.src} className={img.wide ? 'col-12' : 'col-md-6'}>
            <button
              type="button"
              className="cs-media-expand rounded-16 overflow-hidden"
              aria-label={`Expand image: ${img.alt}`}
              onClick={() => setOpen(i)}
            >
              <img src={img.src} alt={img.alt} className="w-100 h-auto d-block" />
            </button>
          </div>
        ))}
      </div>
      {open !== null && (
        <Lightbox images={images} index={open} onClose={() => setOpen(null)} onNavigate={setOpen} />
      )}
    </div>
  );
}
