import { useEffect, useState } from "react";
import Image from "@/components/common/Image";

export default function PageLoader() {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        // Hide preloader once the app has mounted + first paint is complete,
        // mirroring the Next.js behavior where `loading.tsx` only appears
        // during route/data transitions.
        const hide = () => {
            window.setTimeout(() => setHidden(true), 300);
        };
        if (document.readyState === "complete") {
            hide();
        } else {
            window.addEventListener("load", hide, { once: true });
            return () => window.removeEventListener("load", hide);
        }
    }, []);

    if (hidden) return null;

    return (
        <>
            {/*Preloader*/}
            <div id="preloader">
                <div id="loader" className="loader">
                    <div className="loader-container">
                        <div className="loader-icon">
                            <Image
                                src="/assets/imgs/template/logo/logo-gradient.svg"
                                alt="Preloader"
                                width={500}
                                height={500}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/*Preloader-end */}
        </>
    );
}
