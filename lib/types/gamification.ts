// lib/types/gamification.ts

export interface StudentGamification {
    id: string;
    student_id: string;
    xp: number;
    level: number;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    total_activities: number;
    created_at: string;
    updated_at: string;
}

export interface XpHistoryEntry {
    id: string;
    student_id: string;
    xp_amount: number;
    action_type: XpActionType;
    reference_id: string | null;
    description: string | null;
    created_at: string;
}

export type XpActionType =
    | 'content_complete'
    | 'lesson_complete'
    | 'module_complete'
    | 'exercise_approved'
    | 'exercise_perfect'
    | 'quiz_complete'
    | 'quiz_perfect'
    | 'streak_bonus'
    | 'first_of_day';

export interface LevelInfo {
    level: number;
    title: string;
    minXp: number;
    maxXp: number;
    color: string;
    emoji: string;
}

export interface GamificationStats {
    xp: number;
    level: number;
    levelInfo: LevelInfo;
    xpToNextLevel: number;
    xpProgress: number;
    currentStreak: number;
    longestStreak: number;
    isStreakActive: boolean;
    totalActivities: number;
}