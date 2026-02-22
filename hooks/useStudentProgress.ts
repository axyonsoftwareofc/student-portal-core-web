// hooks/useStudentProgress.ts
'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import type { LessonProgress } from '@/lib/types/database';

interface MarkCompleteParams {
    lessonId: string;
    studentId: string;
}

interface SaveQuizParams {
    lessonId: string;
    studentId: string;
    score: number;
    total: number;
    answers: Record<string, string>;
}

export function useStudentProgress() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());

    const markAsComplete = async ({ lessonId, studentId }: MarkCompleteParams): Promise<{ success: boolean; data?: LessonProgress }> => {
        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            const { data, error: upsertError } = await supabase
                .from('lesson_progress')
                .upsert({
                    student_id: studentId,
                    lesson_id: lessonId,
                    completed: true,
                    completed_at: new Date().toISOString(),
                }, {
                    onConflict: 'student_id,lesson_id',
                })
                .select()
                .single();

            if (upsertError) throw upsertError;

            showSuccessToast('Aula concluída! ✅');
            return { success: true, data };
        } catch (err) {
            console.error('Erro ao marcar como concluída:', err);
            setError('Erro ao salvar progresso');
            showErrorToast('Erro ao salvar progresso', 'Tente novamente');
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    const markAsIncomplete = async ({ lessonId, studentId }: MarkCompleteParams): Promise<{ success: boolean }> => {
        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            const { error: updateError } = await supabase
                .from('lesson_progress')
                .update({
                    completed: false,
                    completed_at: null,
                })
                .eq('student_id', studentId)
                .eq('lesson_id', lessonId);

            if (updateError) throw updateError;

            showSuccessToast('Aula desmarcada', 'Você pode refazer quando quiser');
            return { success: true };
        } catch (err) {
            console.error('Erro ao desmarcar:', err);
            setError('Erro ao salvar progresso');
            showErrorToast('Erro ao atualizar progresso', 'Tente novamente');
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    const saveQuizResult = async ({ lessonId, studentId, score, total, answers }: SaveQuizParams): Promise<{ success: boolean; data?: LessonProgress }> => {
        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            const { data, error: upsertError } = await supabase
                .from('lesson_progress')
                .upsert({
                    student_id: studentId,
                    lesson_id: lessonId,
                    completed: true,
                    completed_at: new Date().toISOString(),
                    quiz_score: score,
                    quiz_total: total,
                    quiz_answers: answers,
                    quiz_completed_at: new Date().toISOString(),
                }, {
                    onConflict: 'student_id,lesson_id',
                })
                .select()
                .single();

            if (upsertError) throw upsertError;

            const percentage = Math.round((score / total) * 100);
            const emoji = percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '📚';

            showSuccessToast(
                `Quiz finalizado! ${emoji}`,
                `Você acertou ${score} de ${total} (${percentage}%)`
            );

            return { success: true, data };
        } catch (err) {
            console.error('Erro ao salvar quiz:', err);
            setError('Erro ao salvar resultado do quiz');
            showErrorToast('Erro ao salvar quiz', 'Seu resultado pode não ter sido salvo');
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    const getProgress = async (lessonId: string, studentId: string): Promise<LessonProgress | null> => {
        try {
            const supabase = supabaseRef.current;

            const { data, error } = await supabase
                .from('lesson_progress')
                .select('*')
                .eq('student_id', studentId)
                .eq('lesson_id', lessonId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return data || null;
        } catch (err) {
            console.error('Erro ao buscar progresso:', err);
            return null;
        }
    };

    return {
        isLoading,
        error,
        markAsComplete,
        markAsIncomplete,
        saveQuizResult,
        getProgress,
    };
}