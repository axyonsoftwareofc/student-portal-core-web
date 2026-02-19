// components/student/performance/AchievementsTab.tsx
'use client';

import { Trophy, Lock, Sparkles } from 'lucide-react';

interface AchievementsTabProps {
    overallProgress: number;
    completedLessons: number;
    totalExercises: number;
}

export function AchievementsTab({
                                    overallProgress,
                                    completedLessons,
                                    totalExercises,
                                }: AchievementsTabProps) {
    const achievements = [
        {
            id: 'first-lesson',
            emoji: '🎯',
            title: 'Primeira Aula',
            description: 'Complete sua primeira aula',
            unlocked: completedLessons >= 1,
        },
        {
            id: 'ten-lessons',
            emoji: '📚',
            title: '10 Aulas',
            description: 'Complete 10 aulas',
            unlocked: completedLessons >= 10,
        },
        {
            id: 'first-exercise',
            emoji: '✍️',
            title: 'Primeiro Exercício',
            description: 'Envie seu primeiro exercício',
            unlocked: totalExercises >= 1,
        },
        {
            id: 'five-exercises',
            emoji: '💪',
            title: '5 Exercícios',
            description: 'Envie 5 exercícios',
            unlocked: totalExercises >= 5,
        },
        {
            id: 'progress-25',
            emoji: '🌟',
            title: 'Iniciante',
            description: 'Alcance 25% de progresso',
            unlocked: overallProgress >= 25,
        },
        {
            id: 'progress-50',
            emoji: '🏆',
            title: 'Intermediário',
            description: 'Alcance 50% de progresso',
            unlocked: overallProgress >= 50,
        },
        {
            id: 'progress-75',
            emoji: '🎖️',
            title: 'Avançado',
            description: 'Alcance 75% de progresso',
            unlocked: overallProgress >= 75,
        },
        {
            id: 'progress-100',
            emoji: '👑',
            title: 'Mestre',
            description: 'Complete 100% do curso',
            unlocked: overallProgress === 100,
        },
    ];

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                        <Trophy className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-amber-300">Suas Conquistas</h3>
                        <p className="text-sm text-amber-200/70">
                            {unlockedCount} de {achievements.length} desbloqueadas
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid de conquistas */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                {achievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`relative rounded-lg border p-4 text-center transition-all ${
                            achievement.unlocked
                                ? 'border-amber-500/30 bg-amber-950/20'
                                : 'border-gray-800/50 bg-gray-900/30 opacity-60'
                        }`}
                    >
                        <div className={`text-3xl mb-2 ${!achievement.unlocked && 'grayscale'}`}>
                            {achievement.emoji}
                        </div>
                        <h4 className={`text-sm font-medium mb-1 ${
                            achievement.unlocked ? 'text-white' : 'text-gray-400'
                        }`}>
                            {achievement.title}
                        </h4>
                        <p className="text-xs text-gray-500">{achievement.description}</p>

                        {!achievement.unlocked && (
                            <div className="absolute top-2 right-2">
                                <Lock className="h-3.5 w-3.5 text-gray-600" strokeWidth={1.5} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Mensagem motivacional */}
            <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4">
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                        <p className="text-sm text-sky-200">
                            Continue estudando no seu ritmo! Cada aula completa te aproxima de novas conquistas.
                            O importante é evoluir um pouco a cada dia. 💙
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}