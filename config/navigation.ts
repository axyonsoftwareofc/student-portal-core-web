// config/navigation.ts
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Layers,
    FileText,
    Package,
    CreditCard,
    BarChart3,
    Settings,
    BookOpen,
    BarChart,
    User,
    type LucideIcon,
} from "lucide-react";

/**
 * Tipo para item de navegação.
 */
export interface NavItem {
    /** Ícone do Lucide React */
    icon: LucideIcon;
    /** Texto exibido no menu */
    label: string;
    /** Rota de destino */
    href: string;
    /** Descrição para acessibilidade (opcional) */
    description?: string;
}

/**
 * Itens de navegação do menu Admin.
 */
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
        icon: FileText,
        label: "Conteúdos",
        href: "/admin/conteudos",
        description: "Gerenciar aulas e conteúdos",
    },
    {
        icon: Package,
        label: "Materiais",
        href: "/admin/materiais",
        description: "Gerenciar materiais de apoio",
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

/**
 * Itens de navegação do menu Aluno.
 */
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

/**
 * Retorna os itens de navegação baseado no tipo de usuário.
 */
export function getNavItems(userType: "admin" | "student"): NavItem[] {
    return userType === "admin" ? adminNavItems : studentNavItems;
}