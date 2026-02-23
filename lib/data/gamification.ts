// lib/data/gamification.ts

import type { LevelInfo, XpActionType } from '@/lib/types/gamification';

// ========== NÍVEIS ==========
export const LEVELS: LevelInfo[] = [
    { level: 1, title: 'Iniciante', minXp: 0, maxXp: 99, color: 'gray', emoji: '🌱' },
    { level: 2, title: 'Aprendiz', minXp: 100, maxXp: 299, color: 'emerald', emoji: '🌿' },
    { level: 3, title: 'Estudante', minXp: 300, maxXp: 599, color: 'sky', emoji: '📘' },
    { level: 4, title: 'Dedicado', minXp: 600, maxXp: 999, color: 'sky', emoji: '📚' },
    { level: 5, title: 'Avançado', minXp: 1000, maxXp: 1499, color: 'violet', emoji: '🎯' },
    { level: 6, title: 'Experiente', minXp: 1500, maxXp: 2499, color: 'violet', emoji: '⚡' },
    { level: 7, title: 'Veterano', minXp: 2500, maxXp: 3999, color: 'amber', emoji: '🏅' },
    { level: 8, title: 'Especialista', minXp: 4000, maxXp: 5999, color: 'amber', emoji: '🌟' },
    { level: 9, title: 'Mestre', minXp: 6000, maxXp: 9999, color: 'rose', emoji: '👑' },
    { level: 10, title: 'Lenda', minXp: 10000, maxXp: Infinity, color: 'amber', emoji: '🏆' },
];

// ========== XP POR AÇÃO ==========
export const XP_VALUES: Record<XpActionType, number> = {
    content_complete: 10,
    lesson_complete: 25,
    module_complete: 100,
    exercise_approved: 50,
    exercise_perfect: 100,
    quiz_complete: 30,
    quiz_perfect: 75,
    streak_bonus: 5,
    first_of_day: 15,
};

// ========== HELPERS ==========
export function getLevelFromXp(xp: number): LevelInfo {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].minXp) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}

export function getXpToNextLevel(xp: number): number {
    const currentLevel = getLevelFromXp(xp);
    if (currentLevel.level === 10) return 0;
    return currentLevel.maxXp + 1 - xp;
}

export function getXpProgress(xp: number): number {
    const currentLevel = getLevelFromXp(xp);
    if (currentLevel.level === 10) return 100;

    const levelXp = xp - currentLevel.minXp;
    const levelRange = currentLevel.maxXp - currentLevel.minXp + 1;
    return Math.round((levelXp / levelRange) * 100);
}

export function calculateStreakBonus(streak: number): number {
    return Math.min(streak, 10) * XP_VALUES.streak_bonus;
}

export function formatXp(xp: number): string {
    if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1)}k`;
    }
    return xp.toString();
}