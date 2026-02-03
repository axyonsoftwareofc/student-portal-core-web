// utils/mock/adminMock.ts
import { Users, BookOpen, BarChart3, GraduationCap, User, FileText, Trophy, Settings, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export const adminStats = [
    {
        id: 1,
        label: 'Total de Alunos',
        value: 15,
        icon: Users,
        color: 'sky' as const,
        trend: {
            value: 12,
            label: 'vs mês anterior',
        },
        description: '2 novos este mês',
    },
    {
        id: 2,
        label: 'Módulos Ativos',
        value: 3,
        icon: BookOpen,
        color: 'emerald' as const,
        trend: {
            value: 8,
            label: 'vs mês anterior',
        },
        description: '1 em desenvolvimento',
    },
    {
        id: 3,
        label: 'Taxa de Conclusão',
        value: '78%',
        icon: BarChart3,
        color: 'amber' as const,
        trend: {
            value: 5,
            label: 'vs mês anterior',
        },
        description: 'Média geral',
    },
    {
        id: 4,
        label: 'Aulas Realizadas',
        value: 24,
        icon: GraduationCap,
        color: 'sky' as const,
        trend: {
            value: 3,
            label: 'este mês',
        },
        description: 'Aos sábados',
    },
];

export const recentActivities = [
    {
        id: 1,
        type: 'student',
        icon: User,
        title: 'Novo aluno cadastrado',
        description: 'Maria Silva se inscreveu no curso de Java Avançado',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
        id: 2,
        type: 'content',
        icon: FileText,
        title: 'Conteúdo publicado',
        description: 'Nova videoaula "Spring Boot Security" adicionada',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
        id: 3,
        type: 'achievement',
        icon: Trophy,
        title: 'Meta atingida',
        description: '10 alunos completaram o módulo de POO este mês',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
        id: 4,
        type: 'system',
        icon: Settings,
        title: 'Atualização do sistema',
        description: 'Nova versão da plataforma foi implementada',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
];

export const systemAlerts = [
    {
        id: 1,
        severity: 'high' as const,
        icon: AlertCircle,
        title: 'Pagamento pendente',
        message: '3 alunos com mensalidade atrasada',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: 2,
        severity: 'medium' as const,
        icon: AlertTriangle,
        title: 'Conteúdo desatualizado',
        message: 'Módulo de Java Básico precisa de revisão',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
        id: 3,
        severity: 'low' as const,
        icon: Info,
        title: 'Lembrete',
        message: 'Próxima aula: Sábado às 09:00',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
];

export const students = [
    {
        id: 1,
        name: 'João Silva',
        email: 'joao.silva@email.com',
        course: 'Java Full Stack',
        progress: 75,
        status: 'active' as const,
        enrolledAt: '2024-01-15',
        lastAccess: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: 2,
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        course: 'Spring Framework',
        progress: 45,
        status: 'active' as const,
        enrolledAt: '2024-02-01',
        lastAccess: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
        id: 3,
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        course: 'Java Full Stack',
        progress: 90,
        status: 'active' as const,
        enrolledAt: '2023-11-10',
        lastAccess: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
        id: 4,
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        course: 'Spring Framework',
        progress: 30,
        status: 'inactive' as const,
        enrolledAt: '2024-01-20',
        lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
];