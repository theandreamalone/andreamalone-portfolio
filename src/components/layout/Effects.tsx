import { Suspense } from 'react';
import ClientEffects from './ClientEffects';

export default function Effects() {
    return (
        <Suspense fallback={null}>
            <ClientEffects />
        </Suspense>
    );
}
