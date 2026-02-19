// components/student/performance/PerformanceHeader.tsx
'use client';

import {
    TrendingUp,
    ClipboardCheck,
    CheckCircle,
    Clock,
    Star,
} from 'lucide-react';

interface PerformanceHeaderProps {
    averageGrade: number | null;
    totalExercises: number;
    approvedCount: number;
    pendingCount: number;
    overallProgress: number;
}

export function PerformanceHeader({
                                      averageGrade,
                                      totalExercises,
                                      approvedCount,
                                      pendingCount,
                                      overallProgress,
                                  }: PerformanceHeaderProps) {
    const stats = [
        {
            label: 'Média Geral',
            value: averageGrade !== null ? averageGrade.toFixed(1) : '--',
            icon: Star,
            color: 'amber',
        },
        {
            label: 'Exercícios',
            value: totalExercises,
            icon: ClipboardCheck,
            color: 'sky',
        },
        {
            label: 'Aprovados',
            value: approvedCount,
            icon: CheckCircle,
            color: 'emerald',
        },
        {
            label: 'Pendentes',
            value: pendingCount,
            icon: Clock,
            color: 'amber',
        },
        {
            label: 'Progresso',
            value: `${overallProgress}%`,
            icon: TrendingUp,
            color: 'violet',
        },
    ];

    const colorClasses: Record<string, { bg: string; icon: string }> = {
        amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400' },
        sky: { bg: 'bg-sky-500/10', icon: 'text-sky-400' },
        emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
        violet: { bg: 'bg-violet-500/10', icon: 'text-violet-400' },
    };

    return (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => {
                const Icon = stat.icon;
                const colors = colorClasses[stat.color];

                return (
                    <div
                        key={stat.label}
                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg}`}>
                                <Icon className={`h-4 w-4 ${colors.icon}`} strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                );
            })}
        </div>
    );
}