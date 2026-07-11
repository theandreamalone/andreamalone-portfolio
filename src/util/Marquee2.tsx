import { Suspense } from "react";
import Marquee from "./Marquee";

interface Marquee2Props {
    children: React.ReactNode;
    speed?: number;
    direction?: "left" | "right";
    pauseOnHover?: boolean;
    className?: string;
}

export default function Marquee2(props: Marquee2Props) {
    return (
        <Suspense
            fallback={
                <div className={`marquee ${props.className || ""}`}>
                    <div className="marquee-content">{props.children}</div>
                </div>
            }
        >
            <Marquee {...props} />
        </Suspense>
    );
}
