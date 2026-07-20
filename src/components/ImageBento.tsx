/**
 * ImageBento — the portfolio-details image grid, reusable anywhere in a
 * case study body (repeatable; use as many per section as needed).
 *
 * Markup mirrors the template's block-image pattern exactly:
 * row g-4 → col-md-6 halves, col-12 full-width, each rounded-16.
 *
 * MDX usage (no import needed — supplied via CaseStudyBody's components map):
 *
 *   <ImageBento images={[
 *     { src: "/media/{slug}/a.webp", alt: "..." },
 *     { src: "/media/{slug}/b.webp", alt: "..." },
 *     { src: "/media/{slug}/c.webp", alt: "...", wide: true },
 *   ]} />
 *
 * Rule: `wide: true` → full row; otherwise half (stacks on mobile).
 * Two halves sit side by side in source order.
 */

interface BentoImage {
  src: string;
  alt: string;
  wide?: boolean;
}

interface ImageBentoProps {
  images: BentoImage[];
}

export default function ImageBento({ images }: ImageBentoProps) {
  if (!images?.length) return null;
  return (
    <div className="block-image my-4">
      <div className="row g-4">
        {images.map((img) => (
          <div key={img.src} className={img.wide ? 'col-12' : 'col-md-6'}>
            <div className="rounded-16 overflow-hidden">
              <img src={img.src} alt={img.alt} className="w-100 h-auto d-block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
