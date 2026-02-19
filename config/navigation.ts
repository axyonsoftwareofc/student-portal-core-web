// config/navigation.ts
import {
    LayoutDashboard,
    Users,
    UserPlus,
    GraduationCap,
    Layers,
    Play,
    ClipboardCheck,
    CreditCard,
    BarChart3,
    Settings,
    BookOpen,
    BarChart,
    User,
    StickyNote,
    type LucideIcon,
} from "lucide-react";

export interface NavItem {
    icon: LucideIcon;
    label: string;
    href: string;
    description?: string;
}

export const adminNavItems: NavItem[] = [
    {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/admin/dashboard",
        description: "Visão geral do sistema",
    },
    {
        icon: Users,
        label: "Alunos",
        href: "/admin/alunos",
        description: "Gerenciar alunos",
    },
    {
        icon: UserPlus,
        label: "Leads",
        href: "/admin/leads",
        description: "Gerenciar interessados",
    },
    {
        icon: GraduationCap,
        label: "Cursos",
        href: "/admin/cursos",
        description: "Gerenciar cursos",
    },
    {
        icon: Layers,
        label: "Módulos",
        href: "/admin/modulos",
        description: "Gerenciar módulos",
    },
    {
        icon: Play,
        label: "Aulas",
        href: "/admin/aulas",
        description: "Gerenciar aulas e conteúdos",
    },
    {
        icon: ClipboardCheck,
        label: "Correções",
        href: "/admin/correcoes",
        description: "Corrigir exercícios",
    },
    {
        icon: CreditCard,
        label: "Pagamentos",
        href: "/admin/pagamentos",
        description: "Controle financeiro",
    },
    {
        icon: BarChart3,
        label: "Relatórios",
        href: "/admin/relatorios",
        description: "Relatórios e métricas",
    },
    {
        icon: Settings,
        label: "Configurações",
        href: "/admin/configuracoes",
        description: "Configurações do sistema",
    },
];

export const studentNavItems: NavItem[] = [
    {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/aluno/dashboard",
        description: "Seu painel inicial",
    },
    {
        icon: BookOpen,
        label: "Estudar",
        href: "/aluno/estudar",
        description: "Acessar conteúdos",
    },
    {
        icon: StickyNote,
        label: "Minhas Notas",
        href: "/aluno/notas",
        description: "Suas anotações de aula",
    },
    {
        icon: Layers,
        label: "Módulos",
        href: "/aluno/modulos",
        description: "Ver módulos do curso",
    },
    {
        icon: BarChart,
        label: "Desempenho",
        href: "/aluno/desempenho",
        description: "Acompanhar progresso",
    },
    {
        icon: User,
        label: "Perfil",
        href: "/aluno/perfil",
        description: "Suas informações",
    },
];

export function getNavItems(userType: "admin" | "student"): NavItem[] {
    return userType === "admin" ? adminNavItems : studentNavItems;
}