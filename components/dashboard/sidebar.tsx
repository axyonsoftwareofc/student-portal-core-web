// components/dashboard/sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, GraduationCap, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { type NavItem } from "@/config/navigation";

interface SidebarProps {
    /** Itens de navegação */
    items: NavItem[];
    /** Tipo do usuário (afeta o badge) */
    userType: "admin" | "student";
    /** Nome para exibir no header mobile */
    title?: string;
}

/**
 * Componente de navegação lateral.
 * Renderiza como sidebar fixo no desktop e drawer no mobile.
 */
export function Sidebar({ items, userType, title = "Code Plus" }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    /**
     * Verifica se um item está ativo baseado na rota atual.
     */
    const isItemActive = (href: string): boolean => {
        return pathname === href || pathname.startsWith(href + "/");
    };

    /**
     * Componente de navegação reutilizado entre desktop e mobile.
     */
    const NavigationContent = ({ onItemClick }: { onItemClick?: () => void }) => (
        <>
            {/* Badge do tipo de usuário */}
            <div className="mb-6">
                {userType === "admin" ? (
                    <div className="flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-950/20 px-3 py-2.5">
                        <Shield className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                        <p className="text-xs font-medium text-sky-300">
                            Área Administrativa
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-3 py-2.5">
                        <Sparkles className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                        <p className="text-xs font-medium text-emerald-300">
                            Área do Aluno
                        </p>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <nav className="space-y-1">
                {items.map((item) => {
                    const isActive = isItemActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onItemClick}
                            className={cn(
                                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-sky-500/10 text-sky-300"
                                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "h-[18px] w-[18px] shrink-0 transition-colors",
                                    isActive
                                        ? "text-sky-400"
                                        : "text-gray-500 group-hover:text-gray-300"
                                )}
                                strokeWidth={1.5}
                            />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Tip Card */}
            <div className="mt-8 rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <p className="text-xs font-medium text-gray-300">Dica Rápida</p>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                    {userType === "admin"
                        ? "Use os relatórios para acompanhar o desempenho dos alunos."
                        : "Complete as aulas para acompanhar seu progresso."}
                </p>
            </div>
        </>
    );

    return (
        <>
            {/* ==================== DESKTOP SIDEBAR ==================== */}
            <aside className="hidden w-64 shrink-0 border-r border-gray-800/50 bg-gray-950 lg:block">
                <div className="flex h-full flex-col overflow-y-auto p-4">
                    <NavigationContent />
                </div>
            </aside>

            {/* ==================== MOBILE TRIGGER ==================== */}
            <Button
                variant="default"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg shadow-sky-500/20 lg:hidden"
                aria-label="Abrir menu de navegação"
            >
                <Menu className="h-6 w-6" strokeWidth={1.5} />
            </Button>

            {/* ==================== MOBILE DRAWER ==================== */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="left" className="w-72 p-0">
                    <SheetHeader className="border-b border-gray-800/50 p-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600">
                                <GraduationCap className="h-4 w-4 text-white" strokeWidth={2} />
                            </div>
                            <SheetTitle className="text-white">{title}</SheetTitle>
                        </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                        <NavigationContent onItemClick={() => setIsOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}