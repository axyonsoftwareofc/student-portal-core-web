// hooks/useContentProgress.ts
'use client';

import { useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import type { ContentProgress } from '@/lib/types/lesson-contents';

interface MarkCompleteParams {
    studentId: string;
    contentId: string;
}

interface SaveQuizParams {
    studentId: string;
    contentId: string;
    score: number;
    total: number;
    answers: Record<string, string>;
}

export function useContentProgress() {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const markAsComplete = useCallback(async (
        params: MarkCompleteParams
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data: existing } = await supabase
                .from('content_progress')
                .select('id')
                .eq('student_id', params.studentId)
                .eq('content_id', params.contentId)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('content_progress')
                    .update({
                        completed: true,
                        completed_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existing.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('content_progress')
                    .insert({
                        student_id: params.studentId,
                        content_id: params.contentId,
                        completed: true,
                        completed_at: new Date().toISOString(),
                    });

                if (error) throw error;
            }

            showSuccessToast('Conteúdo concluído! ✅');
            return { success: true };
        } catch (err) {
            console.error('[useContentProgress] Erro ao marcar como completo:', err);
            showErrorToast('Erro ao salvar progresso', 'Tente novamente');
            return { success: false, error: 'Erro ao salvar progresso' };
        }
    }, [supabase]);

    const saveQuizResult = useCallback(async (
        params: SaveQuizParams
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data: existing } = await supabase
                .from('content_progress')
                .select('id')
                .eq('student_id', params.studentId)
                .eq('content_id', params.contentId)
                .single();

            const progressData = {
                completed: true,
                completed_at: new Date().toISOString(),
                quiz_score: params.score,
                quiz_total: params.total,
                quiz_answers: params.answers,
                quiz_completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            if (existing) {
                const { error } = await supabase
                    .from('content_progress')
                    .update(progressData)
                    .eq('id', existing.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('content_progress')
                    .insert({
                        student_id: params.studentId,
                        content_id: params.contentId,
                        ...progressData,
                    });

                if (error) throw error;
            }

            const percentage = Math.round((params.score / params.total) * 100);
            const emoji = percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '📚';

            showSuccessToast(
                `Quiz finalizado! ${emoji}`,
                `${params.score}/${params.total} (${percentage}%)`
            );

            return { success: true };
        } catch (err) {
            console.error('[useContentProgress] Erro ao salvar quiz:', err);
            showErrorToast('Erro ao salvar quiz', 'Tente novamente');
            return { success: false, error: 'Erro ao salvar resultado do quiz' };
        }
    }, [supabase]);

    const getProgress = useCallback(async (
        studentId: string,
        contentIds: string[]
    ): Promise<Record<string, ContentProgress>> => {
        try {
            const { data, error } = await supabase
                .from('content_progress')
                .select('*')
                .eq('student_id', studentId)
                .in('content_id', contentIds);

            if (error) throw error;

            const progressMap: Record<string, ContentProgress> = {};
            (data || []).forEach((progress: ContentProgress) => {
                progressMap[progress.content_id] = progress;
            });

            return progressMap;
        } catch (err) {
            console.error('[useContentProgress] Erro ao buscar progresso:', err);
            return {};
        }
    }, [supabase]);

    const getLessonProgress = useCallback(async (
        studentId: string,
        lessonId: string
    ): Promise<{ completed: number; total: number; percentage: number }> => {
        try {
            const { data: contents } = await supabase
                .from('lesson_contents')
                .select('id')
                .eq('lesson_id', lessonId);

            if (!contents || contents.length === 0) {
                return { completed: 0, total: 0, percentage: 0 };
            }

            const contentIds = contents.map((c: { id: string }) => c.id);

            const { data: progress } = await supabase
                .from('content_progress')
                .select('id')
                .eq('student_id', studentId)
                .eq('completed', true)
                .in('content_id', contentIds);

            const completed = progress?.length || 0;
            const total = contents.length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            return { completed, total, percentage };
        } catch (err) {
            console.error('[useContentProgress] Erro ao calcular progresso:', err);
            return { completed: 0, total: 0, percentage: 0 };
        }
    }, [supabase]);

    return {
        markAsComplete,
        saveQuizResult,
        getProgress,
        getLessonProgress,
    };
}