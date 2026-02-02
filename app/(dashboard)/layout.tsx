// app/(dashboard)/layout.tsx
// Este arquivo NÃO deve ter header, pois os layouts filhos (admin/aluno) já têm

'use client';

import { AuthProvider } from "@/contexts/AuthContext";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}