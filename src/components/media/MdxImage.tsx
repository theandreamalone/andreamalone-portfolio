/**
 * MdxImage — replaces plain markdown images (![alt](src)) in case study
 * bodies so every image opens in the Lightbox. Wired via CaseStudyBody's
 * components map ({ img: MdxImage }).
 */

import { useState } from 'react';
import Lightbox from './Lightbox';

export default function MdxImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [open, setOpen] = useState(false);
  const { src = '', alt = '' } = props;
  if (!src) return null;
  return (
    <>
      <button
        type="button"
        className="cs-media-expand cs-media-expand-full rounded-16 overflow-hidden"
        aria-label={`Expand image: ${alt}`}
        onClick={() => setOpen(true)}
      >
        <img {...props} className="w-100 h-auto d-block" />
      </button>
      {open && (
        <Lightbox
          images={[{ src, alt }]}
          index={0}
          onClose={() => setOpen(false)}
          onNavigate={() => {}}
        />
      )}
    </>
  );
}
