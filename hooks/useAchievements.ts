// hooks/useAchievements.ts
'use client';

import { useMemo } from 'react';
import { ACHIEVEMENTS, CATEGORY_INFO } from '@/lib/data/achievements';
import type {
    AchievementWithProgress,
    AchievementStats,
    AchievementCategory,
    AchievementRarity
} from '@/lib/types/achievements';

interface AchievementData {
    completedLessons: number;
    totalExercises: number;
    approvedExercises: number;
    perfectScores: number;
    averageGrade: number | null;
    overallProgress: number;
    completedQuizzes: number;
    perfectQuizzes: number;
    totalNotes: number;
    completedModules: number;
    allExercisesApproved: boolean;
}

interface UseAchievementsReturn {
    achievements: AchievementWithProgress[];
    stats: AchievementStats;
}

export function useAchievements(data: AchievementData): UseAchievementsReturn {
    const achievements = useMemo((): AchievementWithProgress[] => {
        return ACHIEVEMENTS.map((achievement) => {
            let current = 0;
            let unlocked = false;

            switch (achievement.id) {
                // Aulas
                case 'first-lesson':
                case 'lessons-5':
                case 'lessons-10':
                case 'lessons-25':
                case 'lessons-50':
                case 'lessons-100':
                    current = data.completedLessons;
                    unlocked = current >= achievement.requirement;
                    break;

                // Exercícios
                case 'first-exercise':
                case 'exercises-5':
                case 'exercises-10':
                case 'exercises-25':
                case 'exercises-50':
                    current = data.totalExercises;
                    unlocked = current >= achievement.requirement;
                    break;

                // Excelência - Notas 10
                case 'first-perfect':
                case 'perfect-5':
                case 'perfect-10':
                    current = data.perfectScores;
                    unlocked = current >= achievement.requirement;
                    break;

                // Excelência - Média
                case 'avg-7':
                case 'avg-8':
                case 'avg-9':
                    current = data.averageGrade ?? 0;
                    unlocked = data.averageGrade !== null && data.averageGrade >= achievement.requirement;
                    break;

                // Quizzes
                case 'first-quiz':
                case 'quiz-5':
                    current = data.completedQuizzes;
                    unlocked = current >= achievement.requirement;
                    break;

                case 'quiz-perfect':
                case 'quiz-perfect-5':
                    current = data.perfectQuizzes;
                    unlocked = current >= achievement.requirement;
                    break;

                // Progresso
                case 'progress-25':
                case 'progress-50':
                case 'progress-75':
                case 'progress-100':
                    current = data.overallProgress;
                    unlocked = current >= achievement.requirement;
                    break;

                // Dedicação
                case 'first-note':
                case 'notes-10':
                case 'notes-25':
                    current = data.totalNotes;
                    unlocked = current >= achievement.requirement;
                    break;

                // Marcos
                case 'first-module':
                case 'modules-5':
                    current = data.completedModules;
                    unlocked = current >= achievement.requirement;
                    break;

                case 'all-approved':
                    current = data.allExercisesApproved ? 1 : 0;
                    unlocked = data.allExercisesApproved && data.totalExercises > 0;
                    break;

                default:
                    current = 0;
                    unlocked = false;
            }

            const percentage = Math.min(100, Math.round((current / achievement.requirement) * 100));

            return {
                ...achievement,
                current,
                percentage,
                unlocked,
            };
        });
    }, [data]);

    const stats = useMemo((): AchievementStats => {
        const total = achievements.length;
        const unlocked = achievements.filter((a) => a.unlocked).length;

        // Por categoria
        const byCategory = {} as Record<AchievementCategory, { total: number; unlocked: number }>;
        Object.keys(CATEGORY_INFO).forEach((cat) => {
            const category = cat as AchievementCategory;
            const categoryAchievements = achievements.filter((a) => a.category === category);
            byCategory[category] = {
                total: categoryAchievements.length,
                unlocked: categoryAchievements.filter((a) => a.unlocked).length,
            };
        });

        // Por raridade
        const rarities: AchievementRarity[] = ['common', 'rare', 'epic', 'legendary'];
        const byRarity = {} as Record<AchievementRarity, { total: number; unlocked: number }>;
        rarities.forEach((rarity) => {
            const rarityAchievements = achievements.filter((a) => a.rarity === rarity);
            byRarity[rarity] = {
                total: rarityAchievements.length,
                unlocked: rarityAchievements.filter((a) => a.unlocked).length,
            };
        });

        // Recentes (desbloqueadas)
        const recentUnlocks = achievements
            .filter((a) => a.unlocked)
            .slice(0, 6);

        // Próximas a desbloquear (não secretas, não desbloqueadas, ordenadas por %)
        const nextToUnlock = achievements
            .filter((a) => !a.unlocked && !a.secret)
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 4);

        return {
            total,
            unlocked,
            percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
            byCategory,
            byRarity,
            recentUnlocks,
            nextToUnlock,
        };
    }, [achievements]);

    return { achievements, stats };
}