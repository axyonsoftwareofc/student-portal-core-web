// config/navigation.ts
import {
    LayoutDashboard,
    Users,
    UserPlus,
    GraduationCap,
    Play,
    ClipboardCheck,
    CreditCard,
    BarChart3,
    Settings,
    BookOpen,
    BarChart,
    User,
    StickyNote,
    Upload,
    Map,
    Route,
    Layers,
    MessageCircle,
    Megaphone,
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
        icon: Route,
        label: "Trilhas",
        href: "/admin/trilhas",
        description: "Visualizar trilhas de aprendizado",
    },
    {
        icon: Layers,
        label: "Fases",
        href: "/admin/fases",
        description: "Visualizar fases do curso",
    },
    {
        icon: GraduationCap,
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
        icon: Upload,
        label: "Importar",
        href: "/admin/importar",
        description: "Importar conteúdo via JSON",
    },
    {
        icon: ClipboardCheck,
        label: "Correções",
        href: "/admin/correcoes",
        description: "Corrigir exercícios",
    },
    {
        icon: Megaphone,
        label: "Avisos",
        href: "/admin/avisos",
        description: "Comunicar com alunos",
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
        icon: Route,
        label: "Trilhas",
        href: "/aluno/trilhas",
        description: "Ver todas as trilhas do curso",
    },
    {
        icon: Map,
        label: "Jornada",
        href: "/aluno/journey",
        description: "Sua evolução e progresso",
    },
    {
        icon: StickyNote,
        label: "Minhas Notas",
        href: "/aluno/notas",
        description: "Suas anotações de aula",
    },
    {
        icon: BarChart,
        label: "Desempenho",
        href: "/aluno/desempenho",
        description: "Acompanhar progresso",
    },
    {
        icon: MessageCircle,
        label: "Fórum",
        href: "/aluno/forum",
        description: "Tire suas dúvidas",
    },
    {
        icon: Users,
        label: "Comunidade",
        href: "/aluno/comunidade",
        description: "Mural da turma",
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