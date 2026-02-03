// app/(dashboard)/aluno/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import PageIllustration from "@/components/page-illustration";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    TrendingUp,
    User
} from "lucide-react";

const alunoMenuItems = [
    { href: "/aluno/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/aluno/estudar", label: "Estudar", icon: BookOpen },
    { href: "/aluno/modulos", label: "Módulos", icon: GraduationCap },
    { href: "/aluno/desempenho", label: "Desempenho", icon: TrendingUp },
    { href: "/aluno/perfil", label: "Perfil", icon: User },
];

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
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
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto" strokeWidth={1.5} />
                    <p className="text-sm text-gray-500">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-gray-950">
            <DashboardHeader />
            <div className="flex flex-1 overflow-hidden">
                <DashboardSidebar />
                <MobileMenu items={alunoMenuItems} title="Code Plus" />
                <main className="relative flex-1 overflow-y-auto">
                    {/* Background illustration */}
                    <PageIllustration />

                    {/* Content */}
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