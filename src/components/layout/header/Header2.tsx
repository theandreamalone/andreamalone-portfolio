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
                        <div className="pe-4 d-none d-lg-block">
                            <span
                                className="text-decoration-underline"
                                role="link"
                                aria-disabled="true"
                                title="Coming soon"
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

            {/* Client component for interactive logic */}
            <Header2Client />
        </>
    );
}
