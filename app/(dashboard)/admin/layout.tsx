// app/(dashboard)/admin/layout.tsx
"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import PageIllustration from "@/components/page-illustration";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuth } from "@/contexts/AuthContext";
import { useLayoutLoading } from "@/hooks/useLayoutLoading";
import { adminNavItems } from "@/config/navigation";

/**
 * Layout principal da área administrativa.
 * Inclui sidebar responsivo (desktop fixo, mobile drawer).
 */
export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const { isLoading } = useAuth();
    const { showContent } = useLayoutLoading({ isParentLoading: isLoading });

    if (!showContent) {
        return <LoadingScreen message="Carregando painel..." />;
    }

    return (
        <div className="flex h-screen flex-col bg-gray-950">
            {/* Header fixo no topo */}
            <DashboardHeader />

            {/* Container principal com sidebar e conteúdo */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - desktop fixo, mobile como drawer */}
                <Sidebar
                    items={adminNavItems}
                    userType="admin"
                    title="Code Plus Admin"
                />

                {/* Área de conteúdo principal */}
                <main className="relative flex-1 overflow-y-auto">
                    {/* Background decorativo */}
                    <PageIllustration />

                    {/* Conteúdo da página */}
                    <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                        {children}
                    </div>

                    {/* Footer */}
                    <DashboardFooter />
                </main>
            </div>
        </div>
    );
}