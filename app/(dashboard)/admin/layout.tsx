// app/(dashboard)/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import PageIllustration from "@/components/page-illustration";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    CreditCard,
    BarChart3,
    Settings
} from "lucide-react";

const adminMenuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/alunos", label: "Alunos", icon: Users },
    { href: "/admin/modulos", label: "Módulos", icon: BookOpen },
    { href: "/admin/conteudos", label: "Conteúdos", icon: FileText },
    { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
    { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
    { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isLoading } = useAuth();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setShowContent(true);
        } else {
            const timer = setTimeout(() => setShowContent(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!showContent) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-950">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
                    <p className="mt-4 text-gray-500">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-gray-950">
            <DashboardHeader />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar />
                <MobileMenu items={adminMenuItems} title="Code Plus Admin" />
                <main className="relative flex-1 overflow-y-auto">
                    {/* Background illustration */}
                    <PageIllustration />

                    <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                        {children}
                    </div>
                    <DashboardFooter />
                </main>
            </div>
        </div>
    );
}