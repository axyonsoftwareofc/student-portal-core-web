// components/common/toast-provider.tsx
'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            toastOptions={{
                style: {
                    background: '#111827',
                    border: '1px solid #1f2937',
                    color: '#f3f4f6',
                    fontSize: '14px',
                },
                className: 'shadow-lg shadow-black/20',
            }}
        />
    );
}