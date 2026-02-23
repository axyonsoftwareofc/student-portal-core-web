// hooks/useGamification.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showInfoToast } from '@/lib/toast';
import {
    getLevelFromXp,
    getXpToNextLevel,
    getXpProgress,
    XP_VALUES,
    calculateStreakBonus,
} from '@/lib/data/gamification';
import type {
    StudentGamification,
    GamificationStats,
    XpActionType,
} from '@/lib/types/gamification';

interface UseGamificationReturn {
    stats: GamificationStats | null;
    isLoading: boolean;
    error: string | null;
    addXp: (action: XpActionType, referenceId?: string, description?: string) => Promise<number>;
    checkAndAwardModuleCompletion: (moduleId: string, studentId: string) => Promise<void>;
    refreshStats: () => Promise<void>;
}

export function useGamification(studentId: string | null): UseGamificationReturn {
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());
    const processedActionsRef = useRef<Set<string>>(new Set());

    const fetchStats = useCallback(async () => {
        if (!studentId) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const supabase = supabaseRef.current;

            let { data, error: fetchError } = await supabase
                .from('student_gamification')
                .select('*')
                .eq('student_id', studentId)
                .single();

            if (fetchError && fetchError.code === 'PGRST116') {
                const { data: newData, error: insertError } = await supabase
                    .from('student_gamification')
                    .insert({ student_id: studentId })
                    .select()
                    .single();

                if (insertError) throw insertError;
                data = newData;
            } else if (fetchError) {
                throw fetchError;
            }

            if (data) {
                const gamification = data as StudentGamification;
                const levelInfo = getLevelFromXp(gamification.xp);

                const today = new Date().toISOString().split('T')[0];
                const lastActivity = gamification.last_activity_date;
                const isStreakActive = lastActivity === today ||
                    (lastActivity !== null && isYesterday(lastActivity));

                setStats({
                    xp: gamification.xp,
                    level: levelInfo.level,
                    levelInfo,
                    xpToNextLevel: getXpToNextLevel(gamification.xp),
                    xpProgress: getXpProgress(gamification.xp),
                    currentStreak: gamification.current_streak,
                    longestStreak: gamification.longest_streak,
                    isStreakActive: !!isStreakActive,
                    totalActivities: gamification.total_activities,
                });
            }
        } catch (err) {
            console.error('Erro ao buscar gamificação:', err);
            setError('Erro ao carregar dados de gamificação');
        } finally {
            setIsLoading(false);
        }
    }, [studentId]);

    const addXp = useCallback(async (
        action: XpActionType,
        referenceId?: string,
        description?: string
    ): Promise<number> => {
        if (!studentId) return 0;

        const actionKey = `${action}-${referenceId || 'no-ref'}-${new Date().toISOString().split('T')[0]}`;
        if (processedActionsRef.current.has(actionKey)) {
            return 0;
        }

        try {
            const supabase = supabaseRef.current;
            const baseXp = XP_VALUES[action];
            const today = new Date().toISOString().split('T')[0];

            const { data: current } = await supabase
                .from('student_gamification')
                .select('*')
                .eq('student_id', studentId)
                .single();

            if (!current) {
                await supabase
                    .from('student_gamification')
                    .insert({ student_id: studentId });

                const { data: newCurrent } = await supabase
                    .from('student_gamification')
                    .select('*')
                    .eq('student_id', studentId)
                    .single();

                if (!newCurrent) return 0;
            }

            const gamification = (current || { xp: 0, current_streak: 0, longest_streak: 0, last_activity_date: null, total_activities: 0 }) as StudentGamification;
            let totalXpGained = baseXp;
            let newStreak = gamification.current_streak;

            if (gamification.last_activity_date !== today) {
                if (gamification.last_activity_date && isYesterday(gamification.last_activity_date)) {
                    newStreak = gamification.current_streak + 1;
                } else if (gamification.last_activity_date !== today) {
                    newStreak = 1;
                }

                if (newStreak > 1) {
                    const streakBonus = calculateStreakBonus(newStreak);
                    totalXpGained += streakBonus;
                }

                totalXpGained += XP_VALUES.first_of_day;
            }

            const newXp = gamification.xp + totalXpGained;
            const oldLevel = getLevelFromXp(gamification.xp);
            const newLevel = getLevelFromXp(newXp);

            const { error: updateError } = await supabase
                .from('student_gamification')
                .update({
                    xp: newXp,
                    level: newLevel.level,
                    current_streak: newStreak,
                    longest_streak: Math.max(gamification.longest_streak, newStreak),
                    last_activity_date: today,
                    total_activities: gamification.total_activities + 1,
                    updated_at: new Date().toISOString(),
                })
                .eq('student_id', studentId);

            if (updateError) throw updateError;

            await supabase.from('xp_history').insert({
                student_id: studentId,
                xp_amount: totalXpGained,
                action_type: action,
                reference_id: referenceId || null,
                description: description || null,
            });

            processedActionsRef.current.add(actionKey);

            if (newLevel.level > oldLevel.level) {
                showSuccessToast(
                    `🎉 Level Up! Nível ${newLevel.level}`,
                    `Você agora é ${newLevel.title}!`
                );
            }

            await fetchStats();
            return totalXpGained;
        } catch (err) {
            console.error('Erro ao adicionar XP:', err);
            return 0;
        }
    }, [studentId, fetchStats]);

    const checkAndAwardModuleCompletion = useCallback(async (
        moduleId: string,
        checkStudentId: string
    ): Promise<void> => {
        if (!checkStudentId) return;

        try {
            const supabase = supabaseRef.current;

            const { data: lessons } = await supabase
                .from('lessons')
                .select('id')
                .eq('module_id', moduleId);

            if (!lessons || lessons.length === 0) return;

            const lessonIds = lessons.map((l: { id: string }) => l.id);

            const { data: contents } = await supabase
                .from('lesson_contents')
                .select('id')
                .in('lesson_id', lessonIds);

            if (!contents || contents.length === 0) return;

            const contentIds = contents.map((c: { id: string }) => c.id);

            const { data: progress } = await supabase
                .from('content_progress')
                .select('id')
                .eq('student_id', checkStudentId)
                .eq('completed', true)
                .in('content_id', contentIds);

            const completedCount = progress?.length || 0;
            const totalCount = contents.length;

            if (completedCount === totalCount && totalCount > 0) {
                const alreadyAwarded = processedActionsRef.current.has(`module_complete-${moduleId}`);
                if (!alreadyAwarded) {
                    await addXp('module_complete', moduleId, 'Módulo completado! 🎯');
                    processedActionsRef.current.add(`module_complete-${moduleId}`);
                }
            }
        } catch (err) {
            console.error('Erro ao verificar conclusão do módulo:', err);
        }
    }, [addXp]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        isLoading,
        error,
        addXp,
        checkAndAwardModuleCompletion,
        refreshStats: fetchStats,
    };
}

function isYesterday(dateStr: string): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateStr === yesterday.toISOString().split('T')[0];
}