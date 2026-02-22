// lib/types/achievements.ts

export type AchievementCategory =
    | 'progress'      // Progresso geral
    | 'lessons'       // Aulas completadas
    | 'exercises'     // Exercícios enviados
    | 'excellence'    // Notas altas
    | 'quizzes'       // Quizzes
    | 'streak'        // Sequência de dias
    | 'dedication'    // Anotações
    | 'milestones';   // Marcos especiais

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementDefinition {
    id: string;
    emoji: string;
    title: string;
    description: string;
    category: AchievementCategory;
    rarity: AchievementRarity;
    requirement: number;
    secret?: boolean;
}

export interface AchievementProgress {
    id: string;
    current: number;
    target: number;
    percentage: number;
    unlocked: boolean;
    unlockedAt?: string;
}

export interface AchievementWithProgress extends AchievementDefinition {
    current: number;
    percentage: number;
    unlocked: boolean;
}

export interface AchievementStats {
    total: number;
    unlocked: number;
    percentage: number;
    byCategory: Record<AchievementCategory, { total: number; unlocked: number }>;
    byRarity: Record<AchievementRarity, { total: number; unlocked: number }>;
    recentUnlocks: AchievementWithProgress[];
    nextToUnlock: AchievementWithProgress[];
}