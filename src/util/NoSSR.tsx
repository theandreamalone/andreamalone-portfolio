import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Defers rendering of children until after the component mounts on the client.
 * Useful for components that depend on browser-only APIs (window, document, etc.)
 * and should not render during the initial paint.
 */
export const NoSSR: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default NoSSR;
