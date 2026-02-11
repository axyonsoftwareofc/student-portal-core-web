// app/(dashboard)/aluno/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import PageIllustration from "@/components/page-illustration";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuth } from "@/contexts/AuthContext";
import { useLayoutLoading } from "@/hooks/useLayoutLoading";
import { studentNavItems } from "@/config/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle } from "lucide-react";

export default function AlunoLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const { isLoading, user, logout } = useAuth();
    const { showContent } = useLayoutLoading({ isParentLoading: isLoading });
    const [isSuspended, setIsSuspended] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const router = useRouter();

    // Verificar se o usuário está suspenso
    useEffect(() => {
        const checkUserStatus = async () => {
            if (!user?.id) {
                setCheckingStatus(false);
                return;
            }

            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('users')
                    .select('status')
                    .eq('id', user.id)
                    .single();

                if (data?.status === 'suspended') {
                    setIsSuspended(true);
                }
            } catch (error) {
                console.error('Erro ao verificar status:', error);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkUserStatus();
    }, [user?.id]);

    if (!showContent || checkingStatus) {
        return <LoadingScreen message="Carregando..." />;
    }

    // Tela de usuário suspenso
    if (isSuspended) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
                <div className="max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10">
                        <AlertTriangle className="h-10 w-10 text-rose-400" strokeWidth={1.5} />
                    </div>
                    <h1 className="mb-3 text-2xl font-semibold text-white">
                        Acesso Suspenso
                    </h1>
                    <p className="mb-6 text-gray-400">
                        Sua conta foi temporariamente suspensa. Entre em contato com o administrador para mais informações.
                    </p>
                    <button
                        onClick={() => logout()}
                        className="rounded-lg bg-gray-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-gray-950">
            <DashboardHeader />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    items={studentNavItems}
                    userType="student"
                    title="Code Plus"
                />
                <main className="relative flex-1 overflow-y-auto">
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