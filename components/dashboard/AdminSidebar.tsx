// components/dashboard/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    {
        icon: "📊",
        label: "Dashboard",
        href: "/admin/dashboard",
    },
    {
        icon: "👥",
        label: "Alunos",
        href: "/admin/alunos",
    },
    {
        icon: "📚",
        label: "Módulos",
        href: "/admin/modulos",
    },
    {
        icon: "👨‍🏫",
        label: "Professores",
        href: "/admin/professores",
    },
    {
        icon: "📝",
        label: "Conteúdos",
        href: "/admin/conteudos",
    },
    {
        icon: "📈",
        label: "Relatórios",
        href: "/admin/relatorios",
    },
    {
        icon: "⚙️",
        label: "Configurações",
        href: "/admin/configuracoes",
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden w-64 border-r border-gray-700/50 bg-gray-950 lg:block">
            <nav className="h-full overflow-y-auto p-4">
                <div className="mb-6">
                    <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 p-3">
                        <p className="text-xs font-semibold text-violet-300">👑 Área Admin</p>
                        <p className="mt-1 text-xs text-gray-400">
                            Gestão completa do sistema
                        </p>
                    </div>
                </div>

                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-violet-600/20 text-violet-300"
                                            : "text-gray-400 hover:bg-gray-900/50 hover:text-white"
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-8 rounded-lg border border-gray-700/50 bg-gray-900/30 p-4">
                    <h3 className="text-sm font-semibold text-white">
                        💡 Dica Rápida
                    </h3>
                    <p className="mt-2 text-xs text-gray-400">
                        Use os relatórios para acompanhar o desempenho geral dos alunos
                    </p>
                </div>
            </nav>
        </aside>
    );
}