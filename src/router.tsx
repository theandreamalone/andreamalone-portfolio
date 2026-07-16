import { createBrowserRouter } from "react-router-dom";
import dynamic from "@/util/dynamic";

const CaseStudyDetail = dynamic(() => import("@/pages/CaseStudyDetail"));
const NotFound = dynamic(() => import("@/pages/NotFound"));
const Home = dynamic(() => import("@/pages/Home"));
const AdaptiveHome = dynamic(() => import("@/pages/AdaptiveHome"));
const HowItWorks = dynamic(() => import("@/pages/HowItWorks"));
const Archive1 = dynamic(() => import("@/pages/Archive1"));
const Archive2 = dynamic(() => import("@/pages/Archive2"));
const Archive3 = dynamic(() => import("@/pages/Archive3"));
const Archive4 = dynamic(() => import("@/pages/Archive4"));
const Archive5 = dynamic(() => import("@/pages/Archive5"));
const Index2 = dynamic(() => import("@/pages/Index2"));
const Index3 = dynamic(() => import("@/pages/Index3"));
const Index4 = dynamic(() => import("@/pages/Index4"));
const PageAbout = dynamic(() => import("@/pages/PageAbout"));
const PageAuthor = dynamic(() => import("@/pages/PageAuthor"));
const PageContact = dynamic(() => import("@/pages/PageContact"));
const PageLogin = dynamic(() => import("@/pages/PageLogin"));
const PageSearchResults = dynamic(() => import("@/pages/PageSearchResults"));
const PortfolioArchive1 = dynamic(() => import("@/pages/PortfolioArchive1"));
const PortfolioDetails = dynamic(() => import("@/pages/PortfolioDetails"));
const Single1 = dynamic(() => import("@/pages/Single1"));
const Single2 = dynamic(() => import("@/pages/Single2"));
const Single3 = dynamic(() => import("@/pages/Single3"));

export const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/adaptive", element: <AdaptiveHome /> },
    { path: "/how-it-works", element: <HowItWorks /> },
    { path: "/case-studies", element: <PortfolioArchive1 /> },
    { path: "/case-studies/:slug", element: <CaseStudyDetail /> },
    { path: "/archive-1", element: <Archive1 /> },
    { path: "/archive-2", element: <Archive2 /> },
    { path: "/archive-3", element: <Archive3 /> },
    { path: "/archive-4", element: <Archive4 /> },
    { path: "/archive-5", element: <Archive5 /> },
    { path: "/index-2", element: <Index2 /> },
    { path: "/index-3", element: <Index3 /> },
    { path: "/index-4", element: <Index4 /> },
    { path: "/page-about", element: <PageAbout /> },
    { path: "/page-author", element: <PageAuthor /> },
    { path: "/page-contact", element: <PageContact /> },
    { path: "/page-login", element: <PageLogin /> },
    { path: "/page-search-results", element: <PageSearchResults /> },
    { path: "/portfolio-details", element: <PortfolioDetails /> },
    { path: "/single-1", element: <Single1 /> },
    { path: "/single-2", element: <Single2 /> },
    { path: "/single-3", element: <Single3 /> },
    { path: "*", element: <NotFound /> },
]);
