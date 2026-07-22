import BackToTop from "@/components/elements/BackToTop";
import Footer1 from "@/components/layout/footer/Footer1";
import Header1 from "@/components/layout/header/Header1";
import Header2 from "@/components/layout/header/Header2";
import Header3 from "@/components/layout/header/Header3";
import Header4 from "@/components/layout/header/Header4";
import Effects from "@/components/layout/Effects";

// Header component mapping
const HEADER_COMPONENTS = {
    1: Header1,
    2: Header2,
    3: Header3,
    4: Header4,
} as const;

// Header component with proper composition
function Header({ style }: { style?: number }) {
    if (!style) {
        return <Header1 />;
    }

    const HeaderComponent = HEADER_COMPONENTS[style as keyof typeof HEADER_COMPONENTS];
    return HeaderComponent ? <HeaderComponent /> : <Header1 />;
}

// Footer removed sitewide (2026-07-21) — Magzin template footer variants
// (newsletter/categories/Instagram grid and the "Your Gateway to Global
// News" link footer) were unreviewed template content, not real site copy.
function Footer(_props: { style?: number }) {
    return null;
}

// Main layout interface
interface LayoutProps {
    children?: React.ReactNode;
    headerStyle?: number;
    footerStyle?: number;
}

// Refactored Layout component using composition
export default function Layout({ children, headerStyle, footerStyle }: LayoutProps) {
    return (
        <>
            <Effects />
            <div id="top" />
            <Header style={headerStyle} />
            <main>{children}</main>
            <Footer style={footerStyle} />
            <BackToTop />
        </>
    );
}

// Alternative: Layout with explicit header and footer props
interface LayoutWithComponentsProps {
    children?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

export function LayoutWithComponents({ children, header = <Header1 />, footer = <Footer1 /> }: LayoutWithComponentsProps) {
    return (
        <>
            <Effects />
            <div id="top" />
            {header}
            <main>{children}</main>
            {footer}
            <BackToTop />
        </>
    );
}

// Layout slots pattern for maximum flexibility
interface LayoutSlotsProps {
    children?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    sidebar?: React.ReactNode;
}

export function LayoutWithSlots({ children, header = <Header1 />, footer = <Footer1 />, sidebar }: LayoutSlotsProps) {
    return (
        <>
            <Effects />
            <div id="top" />
            {header}
            <div className="layout-container">
                {sidebar && <aside className="sidebar">{sidebar}</aside>}
                <main className="layout-main">{children}</main>
            </div>
            {footer}
            <BackToTop />
        </>
    );
}
