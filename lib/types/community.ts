// lib/types/community.ts

// Tipos de conquistas disponíveis
export type AchievementType =
    | 'module_completed'
    | 'phase_completed'
    | 'track_completed'
    | 'streak_milestone'
    | 'level_up'
    | 'perfect_score'
    | 'first_lesson'
    | 'exercise_mastery'
    | 'helpful_answer';

// Tipos de reações disponíveis
export type ReactionType = 'celebrate' | 'fire' | 'strong' | 'clap' | 'heart';

// Mapeamento de reações para emojis
export const REACTION_EMOJIS: Record<ReactionType, string> = {
    celebrate: '🎉',
    fire: '🔥',
    strong: '💪',
    clap: '👏',
    heart: '❤️',
};

// Mapeamento de conquistas para ícones padrão
export const ACHIEVEMENT_ICONS: Record<AchievementType, string> = {
    module_completed: '🎉',
    phase_completed: '🏆',
    track_completed: '👑',
    streak_milestone: '🔥',
    level_up: '🚀',
    perfect_score: '⭐',
    first_lesson: '🌱',
    exercise_mastery: '🧠',
    helpful_answer: '💡',
};

// Conquista do banco
export interface CommunityAchievement {
    id: string;
    user_id: string;
    achievement_type: AchievementType;
    metadata: Record<string, unknown>;
    message: string;
    icon: string;
    is_public: boolean;
    created_at: string;
}

// Reação do banco
export interface CommunityReaction {
    id: string;
    achievement_id: string;
    user_id: string;
    reaction_type: ReactionType;
    created_at: string;
}

// Item do feed (da view community_feed)
export interface CommunityFeedItem {
    id: string;
    user_id: string;
    user_name: string;
    avatar_url: string | null;
    achievement_type: AchievementType;
    metadata: Record<string, unknown>;
    message: string;
    icon: string;
    is_public: boolean;
    created_at: string;
    celebrate_count: number;
    fire_count: number;
    strong_count: number;
    clap_count: number;
    heart_count: number;
    total_reactions: number;
}

// Contagem de reações para um item
export interface ReactionCounts {
    celebrate: number;
    fire: number;
    strong: number;
    clap: number;
    heart: number;
}

// Reações do usuário atual em um item
export interface UserReactions {
    celebrate: boolean;
    fire: boolean;
    strong: boolean;
    clap: boolean;
    heart: boolean;
}

// Dados para criar uma conquista
export interface CreateAchievementData {
    user_id: string;
    achievement_type: AchievementType;
    metadata?: Record<string, unknown>;
    message: string;
    icon?: string;
    is_public?: boolean;
}