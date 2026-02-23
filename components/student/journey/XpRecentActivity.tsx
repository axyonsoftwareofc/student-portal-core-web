// components/student/journey/XpRecentActivity.tsx
'use client';

import { Star, Zap } from 'lucide-react';
import { XP_VALUES } from '@/lib/data/gamification';
import type { XpActionType } from '@/lib/types/gamification';

const ACTION_LABELS: Record<XpActionType, { label: string; emoji: string }> = {
    content_complete: { label: 'Conteúdo', emoji: '📄' },
    lesson_complete: { label: 'Aula', emoji: '📚' },
    module_complete: { label: 'Módulo', emoji: '🎯' },
    exercise_approved: { label: 'Exercício', emoji: '✅' },
    exercise_perfect: { label: 'Nota 10', emoji: '⭐' },
    quiz_complete: { label: 'Quiz', emoji: '❓' },
    quiz_perfect: { label: 'Quiz Perfeito', emoji: '🎯' },
    streak_bonus: { label: 'Bônus Streak', emoji: '🔥' },
    first_of_day: { label: '1º do dia', emoji: '☀️' },
};

export function XpRecentActivity() {
    return (
        <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Star className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Como Ganhar XP</h3>
                    <p className="text-xs text-gray-500">Cada ação te aproxima do próximo nível</p>
                </div>
            </div>

            <div className="space-y-2">
                {Object.entries(XP_VALUES).map(([action, xp]) => {
                    const actionInfo = ACTION_LABELS[action as XpActionType];
                    return (
                        <div
                            key={action}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800/30"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-base">{actionInfo.emoji}</span>
                                <span className="text-sm text-gray-300">{actionInfo.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Zap className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.5} />
                                <span className="text-sm font-medium text-amber-400">+{xp}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-sky-950/30 border border-sky-500/20">
                <p className="text-xs text-sky-300 text-center">
                    💡 Dica: Mantenha sua sequência ativa para ganhar bônus de XP!
                </p>
            </div>
        </div>
    );
}