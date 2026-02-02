// utils/mock/adminMock.ts
export const adminStats = [
    {
        id: 1,
        label: 'Total de Alunos',
        value: 245,
        icon: '👥',
        color: 'blue' as const,
        trend: {
            value: 12,
            label: 'vs mês anterior',
        },
        description: '18 novos este mês',
    },
    {
        id: 2,
        label: 'Módulos Ativos',
        value: 12,
        icon: '📚',
        color: 'green' as const,
        trend: {
            value: 8,
            label: 'vs mês anterior',
        },
        description: '3 em desenvolvimento',
    },
    {
        id: 3,
        label: 'Taxa de Conclusão',
        value: '78%',
        icon: '📊',
        color: 'purple' as const,
        trend: {
            value: 5,
            label: 'vs mês anterior',
        },
        description: 'Média geral',
    },
    {
        id: 4,
        label: 'Professores',
        value: 15,
        icon: '👨‍🏫',
        color: 'orange' as const,
        trend: {
            value: 0,
            label: 'sem alteração',
        },
        description: 'Todos ativos',
    },
];

export const recentActivities = [
    {
        id: 1,
        type: 'student',
        icon: '👤',
        title: 'Novo aluno cadastrado',
        description: 'Maria Silva se inscreveu no curso de Java Avançado',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min atrás
    },
    {
        id: 2,
        type: 'content',
        icon: '📝',
        title: 'Conteúdo publicado',
        description: 'Prof. Carlos adicionou videoaula "Spring Boot Security"',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min atrás
    },
    {
        id: 3,
        type: 'achievement',
        icon: '🏆',
        title: 'Meta atingida',
        description: '50 alunos completaram o módulo de POO este mês',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h atrás
    },
    {
        id: 4,
        type: 'system',
        icon: '⚙️',
        title: 'Atualização do sistema',
        description: 'Nova versão da plataforma foi implementada',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4h atrás
    },
];

export const systemAlerts = [
    {
        id: 1,
        severity: 'high' as const,
        icon: '🔴',
        title: 'Servidor de backup offline',
        message: 'O servidor de backup não responde desde 10:30',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: 2,
        severity: 'medium' as const,
        icon: '🟡',
        title: 'Armazenamento 80%',
        message: 'Espaço em disco atingiu 80% da capacidade',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
        id: 3,
        severity: 'low' as const,
        icon: '🔵',
        title: 'Atualização disponível',
        message: 'Nova versão do sistema disponível para instalação',
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