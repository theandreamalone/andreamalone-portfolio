import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import PageLoader from "@/pages/PageLoader";

function App() {
    return (
        <>
            <PageLoader />
            <RouterProvider router={router} />
        </>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
