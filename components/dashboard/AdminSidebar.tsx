// components/dashboard/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Layers,
    FileText,
    CreditCard,
    BarChart3,
    Settings,
    Shield,
} from "lucide-react";

const menuItems = [
    {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/admin/dashboard",
    },
    {
        icon: Users,
        label: "Alunos",
        href: "/admin/alunos",
    },
    {
        icon: GraduationCap,
        label: "Cursos",
        href: "/admin/cursos",
    },
    {
        icon: Layers,
        label: "Módulos",
        href: "/admin/modulos",
    },
    {
        icon: FileText,
        label: "Conteúdos",
        href: "/admin/conteudos",
    },
    {
        icon: CreditCard,
        label: "Pagamentos",
        href: "/admin/pagamentos",
    },
    {
        icon: BarChart3,
        label: "Relatórios",
        href: "/admin/relatorios",
    },
    {
        icon: Settings,
        label: "Configurações",
        href: "/admin/configuracoes",
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden w-64 border-r border-gray-800/50 bg-gray-950 lg:block">
            <nav className="h-full overflow-y-auto p-4">
                {/* Admin Badge */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-950/20 px-3 py-2.5">
                        <Shield className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                        <div>
                            <p className="text-xs font-medium text-sky-300">Área Administrativa</p>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-sky-500/10 text-sky-300"
                                            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                                    }`}
                                >
                                    <Icon
                                        className={`h-[18px] w-[18px] transition-colors ${
                                            isActive
                                                ? "text-sky-400"
                                                : "text-gray-500 group-hover:text-gray-300"
                                        }`}
                                        strokeWidth={1.5}
                                    />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Tip Card */}
                <div className="mt-8 rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs font-medium text-gray-300">
                        Dica Rápida
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                        Use os relatórios para acompanhar o desempenho dos alunos.
                    </p>
                </div>
            </nav>
        </aside>
    );
}