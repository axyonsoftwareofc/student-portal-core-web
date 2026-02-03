// app/(dashboard)/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { useAuth } from "@/contexts/AuthContext";

const adminMenuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/alunos", label: "Alunos", icon: "👥" },
    { href: "/admin/modulos", label: "Módulos", icon: "📚" },
    { href: "/admin/conteudos", label: "Conteúdos", icon: "📝" },
    { href: "/admin/pagamentos", label: "Pagamentos", icon: "💰" },
    { href: "/admin/relatorios", label: "Relatórios", icon: "📈" },
    { href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const [showContent, setShowContent] = useState(false);

    // Aguarda um pouco para o auth carregar, depois mostra conteúdo
    useEffect(() => {
        if (!isLoading) {
            setShowContent(true);
        } else {
            // Timeout de segurança: após 3s, mostra conteúdo mesmo assim
            const timer = setTimeout(() => setShowContent(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    // Loading state
    if (!showContent) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-950">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-400">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-gray-950">
            <DashboardHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar />
                <MobileMenu items={adminMenuItems} title="Painel Admin" />
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                        {children}
                    </div>
                    <DashboardFooter />
                </main>
            </div>
        </div>
    );
}