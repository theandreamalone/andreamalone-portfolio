import { Suspense } from 'react';
import SwiperDynamic from './SwiperDynamic';

interface SwiperDynamic2Props {
    children: React.ReactNode;
    className?: string;
    slidesPerView?: number | "auto";
    spaceBetween?: number;
    loop?: boolean;
    autoplay?: boolean | { delay: number; disableOnInteraction?: boolean };
    centeredSlides?: boolean;
    slidesPerGroup?: number;
    navigation?: boolean | object;
    pagination?: boolean | object;
    thumbs?: any;
    freeMode?: boolean;
    breakpoints?: {
        [key: number]: {
            slidesPerView?: number;
            spaceBetween?: number;
        };
    };
    onSlideChange?: (swiper: any) => void;
    onSwiper?: (swiper: any) => void;
    modules?: any[];
    speed?: number;
    grabCursor?: boolean;
    watchSlidesProgress?: boolean;
}

export default function SwiperDynamic2(props: SwiperDynamic2Props) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SwiperDynamic {...props} />
        </Suspense>
    );
}

