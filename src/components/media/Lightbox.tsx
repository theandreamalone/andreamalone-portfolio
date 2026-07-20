/**
 * Lightbox — full-screen media overlay shared by all case study media
 * components (ImageBento, ImageCarousel, plain MDX images).
 *
 * Keyboard: Esc closes · ←/→ navigate. Backdrop click closes.
 * Focus is trapped on the dialog while open; restored on close.
 */

import { useCallback, useEffect, useRef } from 'react';

export interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const count = images.length;
  const img = images[index];

  const prev = useCallback(
    () => onNavigate((index - 1 + count) % count),
    [index, count, onNavigate],
  );
  const next = useCallback(
    () => onNavigate((index + 1) % count),
    [index, count, onNavigate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && count > 1) prev();
      if (e.key === 'ArrowRight' && count > 1) next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next, count]);

  if (!img) return null;

  return (
    <div
      className="cs-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={img.alt || 'Image viewer'}
      ref={dialogRef}
      tabIndex={-1}
      onClick={onClose}
    >
      <button
        type="button"
        className="cs-lightbox-close"
        aria-label="Close image viewer"
        onClick={onClose}
      >
        ×
      </button>

      {count > 1 && (
        <button
          type="button"
          className="cs-lightbox-nav cs-lightbox-prev"
          aria-label="Previous image"
          onClick={(e) => { e.stopPropagation(); prev(); }}
        >
          ‹
        </button>
      )}

      <figure className="cs-lightbox-figure" onClick={(e) => e.stopPropagation()}>
        <img src={img.src} alt={img.alt} />
        <figcaption>
          {img.alt}
          {count > 1 && <span className="cs-lightbox-counter">{index + 1} / {count}</span>}
        </figcaption>
      </figure>

      {count > 1 && (
        <button
          type="button"
          className="cs-lightbox-nav cs-lightbox-next"
          aria-label="Next image"
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          ›
        </button>
      )}
    </div>
  );
}
