import { useState, useEffect, useRef } from "react";
import useSidebarMenu from "@/util/useSidebarMenu";
import { useScrollState } from "@/util/useScrollState";
import PopupSearch from "@/components/layout/cardPopupSearch";

export default function Header2Client() {
    const scroll = useScrollState();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { toggleSidebar } = useSidebarMenu();
    const searchBtnRef = useRef<Element | null>(null);
    const navbarTogglerRef = useRef<Element | null>(null);

    // Handle search button click
    useEffect(() => {
        // eslint-disable-next-line no-restricted-globals
        searchBtnRef.current = document.querySelector(".search-btn");
        const searchBtn = searchBtnRef.current;

        const handleSearchClick = (e: Event) => {
            e.preventDefault();
            setIsSearchOpen(true);
        };

        if (searchBtn) {
            searchBtn.addEventListener("click", handleSearchClick);
        }

        return () => {
            if (searchBtn) {
                searchBtn.removeEventListener("click", handleSearchClick);
            }
        };
    }, []);

    // Handle sidebar toggle
    useEffect(() => {
        // eslint-disable-next-line no-restricted-globals
        navbarTogglerRef.current = document.querySelector(".navbar-toggler");
        const navbarToggler = navbarTogglerRef.current;

        const handleNavbarToggle = (e: Event) => {
            e.preventDefault();
            toggleSidebar(true);
        };

        if (navbarToggler) {
            navbarToggler.addEventListener("click", handleNavbarToggle);
        }

        return () => {
            if (navbarToggler) {
                navbarToggler.removeEventListener("click", handleNavbarToggle);
            }
        };
    }, [toggleSidebar]);

    return (
        <>
            {/* Dynamic navbar classes based on scroll state */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            <style>{`
                .navbar {
                    ${scroll ? "position: fixed; top: 0; width: 100%; z-index: 1000;" : ""}
                }
            `}</style>

            {/* Search popup with state management */}
            <PopupSearch open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
