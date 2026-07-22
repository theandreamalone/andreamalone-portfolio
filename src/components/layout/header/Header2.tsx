import Image from "@/components/common/Image";
import Link from "@/components/common/Link";
import MainMenu2 from "@/components/layout/MainMenu2";
import ThemeSwitcher from "@/util/ThemeSwitcher2";
import Header2Client from "./Header2Client";

export default function Header2() {
    return (
        <>
            <header>
                <nav className="navbar style-2">
                    <div className="navbar-collapse d-none d-lg-block" id="navbarNav">
                        <MainMenu2 />
                    </div>
                    <Link className="navbar-brand fw-bold fs-3" href="/index-2">
                        <Image className="dark-mode-invert" src="/assets/imgs/template/logo/logo-dark.svg" width={143} height={18} alt="logo" />
                    </Link>
                    <div className="d-flex align-items-center ms-auto gap-4">
                        <div className="pe-4 d-none d-lg-block instant-tooltip" data-tooltip="Coming soon">
                            <span
                                className="text-decoration-underline"
                                role="link"
                                aria-disabled="true"
                                style={{ cursor: 'default', opacity: 0.6 }}
                            >
                                Subscribe
                            </span>
                        </div>
                        <div className="group-btn-right d-flex align-items-center">
                            <ThemeSwitcher />
                        </div>
                    </div>
                </nav>
            </header>
            <style>{`
                .instant-tooltip { position: relative; }
                .instant-tooltip::after {
                    content: attr(data-tooltip);
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-top: 6px;
                    padding: 4px 10px;
                    font-size: 12px;
                    line-height: 1.4;
                    white-space: nowrap;
                    background: #1a1a1a;
                    color: #fff;
                    border-radius: 4px;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                    transition: none;
                    z-index: 10;
                }
                .instant-tooltip:hover::after,
                .instant-tooltip:focus-within::after {
                    opacity: 1;
                    visibility: visible;
                }
            `}</style>

            {/* Client component for interactive logic */}
            <Header2Client />
        </>
    );
}
