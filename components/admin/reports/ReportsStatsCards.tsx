// components/admin/reports/ReportsStatsCards.tsx
'use client';

import { Users, TrendingUp, BookOpen, FileCheck } from 'lucide-react';
import type { ReportStats } from '@/hooks/useReports';

interface ReportsStatsCardsProps {
    stats: ReportStats;
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: 'sky' | 'emerald' | 'amber' | 'violet';
}

const COLOR_CLASSES = {
    sky: 'bg-sky-500/10 text-sky-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    violet: 'bg-violet-500/10 text-violet-400',
} as const;

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                    {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${COLOR_CLASSES[color]}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}

export function ReportsStatsCards({ stats }: ReportsStatsCardsProps) {
    const classAverageDisplay = stats.classAverage !== null
        ? stats.classAverage.toFixed(1)
        : '—';

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
                title="Alunos Ativos"
                value={stats.activeStudents}
                subtitle={`${stats.totalStudents} total · ${stats.suspendedStudents} suspensos`}
                icon={Users}
                color="sky"
            />
            <StatCard
                title="Engajamento"
                value={`${stats.engagementRate}%`}
                subtitle={`${stats.totalLessonsCompleted} aulas concluídas`}
                icon={TrendingUp}
                color="emerald"
            />
            <StatCard
                title="Conteúdo"
                value={stats.totalLessons}
                subtitle={`${stats.totalModules} módulos · ${stats.totalCourses} cursos`}
                icon={BookOpen}
                color="amber"
            />
            <StatCard
                title="Média da Turma"
                value={classAverageDisplay}
                subtitle={`${stats.totalExerciseSubmissions} exercícios enviados`}
                icon={FileCheck}
                color="violet"
            />
        </div>
    );
}