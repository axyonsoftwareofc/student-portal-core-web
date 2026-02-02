// app/(dashboard)/admin/layout.tsx
'use client';

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user && user.role !== 'admin') {
            router.push('/aluno/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-400">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <ProtectedRoute>
            <div className="flex h-screen flex-col">
                <DashboardHeader />
                <div className="flex flex-1 overflow-hidden">
                    <AdminSidebar />
                    <main className="flex-1 overflow-y-auto bg-gray-950">
                        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                            {children}
                        </div>
                        <DashboardFooter />
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}