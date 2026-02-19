// hooks/useStudentExercise.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ExerciseSubmission, SubmitExerciseDTO } from '@/lib/types/exercise-submissions';

interface UseStudentExerciseReturn {
    submission: ExerciseSubmission | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    submitAnswer: (data: Omit<SubmitExerciseDTO, 'content_id' | 'student_id'>) => Promise<{ success: boolean; error?: string }>;
    refetch: () => Promise<void>;
}

export function useStudentExercise(
    contentId: string | null,
    studentId: string | null
): UseStudentExerciseReturn {
    const [submission, setSubmission] = useState<ExerciseSubmission | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchSubmission = useCallback(async (): Promise<void> => {
        if (!contentId || !studentId) {
            setSubmission(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('exercise_submissions')
                .select('*')
                .eq('content_id', contentId)
                .eq('student_id', studentId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            setSubmission(data as ExerciseSubmission | null);
        } catch (err) {
            console.error('[useStudentExercise] Erro ao buscar submissão:', err);
            setError('Erro ao carregar resposta');
        } finally {
            setIsLoading(false);
        }
    }, [contentId, studentId, supabase]);

    const submitAnswer = useCallback(async (
        data: Omit<SubmitExerciseDTO, 'content_id' | 'student_id'>
    ): Promise<{ success: boolean; error?: string }> => {
        if (!contentId || !studentId) {
            return { success: false, error: 'Dados inválidos' };
        }

        try {
            setIsSaving(true);
            setError(null);

            const submissionData = {
                answer_text: data.answer_text || null,
                answer_code: data.answer_code || null,
                answer_url: data.answer_url || null,
                file_url: data.file_url || null,
                file_name: data.file_name || null,
                status: 'pending' as const,
                updated_at: new Date().toISOString(),
            };

            if (submission) {
                // Atualizar existente
                const { error: updateError } = await supabase
                    .from('exercise_submissions')
                    .update(submissionData)
                    .eq('id', submission.id);

                if (updateError) throw updateError;
            } else {
                // Criar nova
                const { error: insertError } = await supabase
                    .from('exercise_submissions')
                    .insert({
                        content_id: contentId,
                        student_id: studentId,
                        ...submissionData,
                    });

                if (insertError) throw insertError;
            }

            await fetchSubmission();
            return { success: true };
        } catch (err) {
            console.error('[useStudentExercise] Erro ao enviar resposta:', err);
            return { success: false, error: 'Erro ao enviar resposta' };
        } finally {
            setIsSaving(false);
        }
    }, [contentId, studentId, submission, supabase, fetchSubmission]);

    useEffect(() => {
        fetchSubmission();
    }, [fetchSubmission]);

    return {
        submission,
        isLoading,
        isSaving,
        error,
        submitAnswer,
        refetch: fetchSubmission,
    };
}