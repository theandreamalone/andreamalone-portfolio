/**
 * MdxImage — replaces plain markdown images (![alt](src)) in case study
 * bodies so every image opens in the Lightbox. Wired via CaseStudyBody's
 * components map ({ img: MdxImage }).
 */

import { useState } from 'react';
import Lightbox from './Lightbox';

export default function MdxImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const { src = '', alt = '' } = props;
  if (!src || failed) return null;
  return (
    <>
      <button
        type="button"
        className="cs-media-expand cs-media-expand-full"
        aria-label={`Expand image: ${alt}`}
        onClick={() => setOpen(true)}
      >
        <img
          {...props}
          className="w-100 h-auto d-block"
          onError={() => {
            console.warn(`[MdxImage] image failed to load, hidden: ${src}`);
            setFailed(true);
          }}
        />
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
