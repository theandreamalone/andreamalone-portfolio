/**
 * ImageCarousel — Swiper carousel with pagination for case study bodies.
 * Every slide expands into the shared Lightbox on click.
 *
 * MDX usage (no import needed — supplied via CaseStudyBody's components map):
 *
 *   <ImageCarousel images={[
 *     { src: "/media/{slug}/state-1.webp", alt: "AI Listening state" },
 *     { src: "/media/{slug}/state-2.webp", alt: "User Speaking state" },
 *   ]} />
 *
 * Good for long sequences (state cycles, flow steps) that would otherwise
 * stack into an unreadable strip.
 */

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Lightbox, { type LightboxImage } from './Lightbox';

interface ImageCarouselProps {
  images: LightboxImage[];
  /** Slides visible at desktop width. Default 2; use 1 for full-width slides. */
  perView?: number;
}

export default function ImageCarousel({ images, perView = 2 }: ImageCarouselProps) {
  const [open, setOpen] = useState<number | null>(null);

  if (!images?.length) return null;

  return (
    <div className="cs-carousel my-4">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{ 768: { slidesPerView: perView } }}
      >
        {images.map((img, i) => (
          <SwiperSlide key={img.src}>
            <button
              type="button"
              className="cs-media-expand rounded-16 overflow-hidden"
              aria-label={`Expand image: ${img.alt}`}
              onClick={() => setOpen(i)}
            >
              <img src={img.src} alt={img.alt} className="w-100 h-auto d-block" />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
      {open !== null && (
        <Lightbox images={images} index={open} onClose={() => setOpen(null)} onNavigate={setOpen} />
      )}
    </div>
  );
}
