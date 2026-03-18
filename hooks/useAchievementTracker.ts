// hooks/useAchievementTracker.ts
'use client';

import { useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    AchievementType,
    CreateAchievementData,
    ACHIEVEMENT_ICONS
} from '@/lib/types/community';

interface UseAchievementTrackerReturn {
    trackModuleCompleted: (userId: string, moduleName: string, moduleId: string) => Promise<void>;
    trackPhaseCompleted: (userId: string, phaseName: string, phaseId: string) => Promise<void>;
    trackTrackCompleted: (userId: string, trackName: string, trackId: string) => Promise<void>;
    trackStreakMilestone: (userId: string, days: number) => Promise<void>;
    trackLevelUp: (userId: string, newLevel: number, levelName: string) => Promise<void>;
    trackPerfectScore: (userId: string, exerciseName: string, exerciseId: string) => Promise<void>;
    trackFirstLesson: (userId: string) => Promise<void>;
    createAchievement: (data: CreateAchievementData) => Promise<void>;
}

export function useAchievementTracker(): UseAchievementTrackerReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const createAchievement = useCallback(async (data: CreateAchievementData) => {
        try {
            const icon = data.icon || ACHIEVEMENT_ICONS[data.achievement_type] || '🎉';

            const { error } = await supabase
                .from('community_achievements')
                .insert({
                    user_id: data.user_id,
                    achievement_type: data.achievement_type,
                    metadata: data.metadata || {},
                    message: data.message,
                    icon,
                    is_public: data.is_public ?? true,
                });

            if (error) throw error;

        } catch (err) {
            console.error('Erro ao criar conquista:', err);
        }
    }, [supabase]);

    const trackModuleCompleted = useCallback(async (
        userId: string,
        moduleName: string,
        moduleId: string
    ) => {
        await createAchievement({
            user_id: userId,
            achievement_type: 'module_completed',
            metadata: { module_name: moduleName, module_id: moduleId },
            message: `Completou o módulo "${moduleName}"`,
            icon: '🎉',
        });
    }, [createAchievement]);

    const trackPhaseCompleted = useCallback(async (
        userId: string,
        phaseName: string,
        phaseId: string
    ) => {
        await createAchievement({
            user_id: userId,
            achievement_type: 'phase_completed',
            metadata: { phase_name: phaseName, phase_id: phaseId },
            message: `Finalizou a fase "${phaseName}"!`,
            icon: '🏆',
        });
    }, [createAchievement]);

    const trackTrackCompleted = useCallback(async (
        userId: string,
        trackName: string,
        trackId: string
    ) => {
        await createAchievement({
            user_id: userId,
            achievement_type: 'track_completed',
            metadata: { track_name: trackName, track_id: trackId },
            message: `Concluiu a trilha "${trackName}"! 🎓`,
            icon: '👑',
        });
    }, [createAchievement]);

    const trackStreakMilestone = useCallback(async (userId: string, days: number) => {
        const messages: Record<number, string> = {
            7: 'Alcançou streak de 7 dias! 🔥',
            14: 'Duas semanas de streak! Impressionante! 🔥',
            30: 'UM MÊS de streak! Você é imparável! 🔥🔥',
            60: 'DOIS MESES de dedicação! Lendário! 🔥🔥🔥',
            100: 'CEM DIAS de streak! Você é uma máquina! 👑',
        };

        const message = messages[days] || `Alcançou streak de ${days} dias!`;

        await createAchievement({
            user_id: userId,
            achievement_type: 'streak_milestone',
            metadata: { streak_days: days },
            message,
            icon: '🔥',
        });
    }, [createAchievement]);

    const trackLevelUp = useCallback(async (
        userId: string,
        newLevel: number,
        levelName: string
    ) => {
        await createAchievement({
            user_id: userId,
            achievement_type: 'level_up',
            metadata: { new_level: newLevel, level_name: levelName },
            message: `Subiu para o nível ${newLevel}: "${levelName}"`,
            icon: '🚀',
        });
    }, [createAchievement]);

    const trackPerfectScore = useCallback(async (
        userId: string,
        exerciseName: string,
        exerciseId: string
    ) => {
        await createAchievement({
            user_id: userId,
            achievement_type: 'perfect_score',
            metadata: { exercise_name: exerciseName, exercise_id: exerciseId },
            message: `Tirou nota 10 no exercício "${exerciseName}"`,
            icon: '⭐',
        });
    }, [createAchievement]);

    const trackFirstLesson = useCallback(async (userId: string) => {
        const { data: existing } = await supabase
            .from('community_achievements')
            .select('id')
            .eq('user_id', userId)
            .eq('achievement_type', 'first_lesson')
            .limit(1);

        if (existing && existing.length > 0) return;

        await createAchievement({
            user_id: userId,
            achievement_type: 'first_lesson',
            metadata: {},
            message: 'Começou sua jornada na Code Plus! 🌱',
            icon: '🌱',
        });
    }, [createAchievement, supabase]);

    return {
        trackModuleCompleted,
        trackPhaseCompleted,
        trackTrackCompleted,
        trackStreakMilestone,
        trackLevelUp,
        trackPerfectScore,
        trackFirstLesson,
        createAchievement,
    };
}