import { useState } from "react";
import Link from "@/components/common/Link";
import Image from "@/components/common/Image";
import MainMenu from "@/components/layout/MainMenu";
import ThemeSwitcher from "@/util/ThemeSwitcher2";
import SideBar from "@/components/layout/SideBar";
import PopupSearch from "@/components/layout/cardPopupSearch";
import useSidebarMenu from "@/util/useSidebarMenu";
import { useScrollState } from "@/util/useScrollState";

export default function Header1() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { toggleSidebar } = useSidebarMenu();
    const scroll = useScrollState();

    return (
        <>
            <style>{`.navbar { ${scroll ? "position: fixed; top: 0; width: 100%; z-index: 1000;" : ""} }`}</style>
            <header>
                <nav className="navbar style-1">
                    <div className="d-flex align-items-center">
                        <Link className="navbar-brand fw-bold fs-3" href="/">
                            <Image src="/assets/imgs/template/logo/logo-dark.svg" width={143} height={18} alt="logo" priority={true} quality={100} />
                        </Link>
                    </div>
                    <div className="navbar-collapse d-none d-lg-block" id="navbarNav">
                        <MainMenu />
                    </div>
                    <div className="d-flex align-items-center gap-4">
                        <div className="group-btn-right d-flex align-items-center">
                            <ThemeSwitcher />
                        </div>
                    </div>
                </nav>
            </header>
            <SideBar />
            <PopupSearch open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
