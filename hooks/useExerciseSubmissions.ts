// hooks/useExerciseSubmissions.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { getLevelFromXp, XP_VALUES, calculateStreakBonus } from '@/lib/data/gamification';
import type {
    ExerciseSubmission,
    ExerciseSubmissionWithDetails,
    SubmitExerciseDTO,
    ReviewExerciseDTO,
    UseExerciseSubmissionsReturn,
} from '@/lib/types/exercise-submissions';

export function useExerciseSubmissions(filterStatus?: string): UseExerciseSubmissionsReturn {
    const [submissions, setSubmissions] = useState<ExerciseSubmissionWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    // 🆕 Função auxiliar para dar XP ao aluno quando exercício é corrigido
    const awardXpToStudent = useCallback(async (
        studentId: string,
        grade: number | null | undefined,
        contentId: string
    ): Promise<void> => {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Buscar dados atuais de gamificação do aluno
            let { data: gamification } = await supabase
                .from('student_gamification')
                .select('*')
                .eq('student_id', studentId)
                .single();

            // Se não existe, criar
            if (!gamification) {
                const { data: newGamification } = await supabase
                    .from('student_gamification')
                    .insert({ student_id: studentId })
                    .select()
                    .single();
                gamification = newGamification;
            }

            if (!gamification) return;

            // Calcular XP baseado na nota
            let xpToAdd = XP_VALUES.exercise_approved; // 50 XP base
            let actionType = 'exercise_approved';
            let description = 'Exercício aprovado';

            if (grade !== null && grade !== undefined && grade === 10) {
                xpToAdd = XP_VALUES.exercise_perfect; // 100 XP para nota 10
                actionType = 'exercise_perfect';
                description = 'Nota 10 no exercício! ⭐';
            }

            // Calcular streak bonus se for primeira atividade do dia
            let streakBonus = 0;
            let newStreak = gamification.current_streak;

            if (gamification.last_activity_date !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (gamification.last_activity_date === yesterdayStr) {
                    newStreak = gamification.current_streak + 1;
                } else {
                    newStreak = 1;
                }

                if (newStreak > 1) {
                    streakBonus = calculateStreakBonus(newStreak);
                }

                xpToAdd += XP_VALUES.first_of_day;
            }

            const totalXp = xpToAdd + streakBonus;
            const newXp = gamification.xp + totalXp;
            const newLevel = getLevelFromXp(newXp);

            // Atualizar gamificação
            await supabase
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

            // Registrar no histórico
            await supabase.from('xp_history').insert({
                student_id: studentId,
                xp_amount: totalXp,
                action_type: actionType,
                reference_id: contentId,
                description,
            });

        } catch (err) {
            console.error('[useExerciseSubmissions] Erro ao dar XP ao aluno:', err);
        }
    }, [supabase]);

    const fetchSubmissions = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            let query = supabase
                .from('exercise_submissions')
                .select(`
          *,
          student:users!exercise_submissions_student_id_fkey (
            id, name, email
          ),
          reviewer:users!exercise_submissions_reviewed_by_fkey (
            id, name
          ),
          content:lesson_contents!exercise_submissions_content_id_fkey (
            id, title, lesson_id
          )
        `)
                .order('created_at', { ascending: false });

            if (filterStatus && filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            const submissionsWithLessons = await Promise.all(
                (data || []).map(async (submission: ExerciseSubmissionWithDetails) => {
                    if (submission.content?.lesson_id) {
                        const { data: lessonData } = await supabase
                            .from('lessons')
                            .select(`
                id, title,
                module:modules (
                  id, name,
                  course:courses (id, name)
                )
              `)
                            .eq('id', submission.content.lesson_id)
                            .single();

                        if (lessonData && submission.content) {
                            submission.content.lesson = lessonData;
                        }
                    }
                    return submission;
                })
            );

            setSubmissions(submissionsWithLessons);
        } catch (err) {
            console.error('[useExerciseSubmissions] Erro ao buscar submissões:', err);
            setError('Erro ao carregar submissões');
            showErrorToast('Erro ao carregar exercícios', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, filterStatus]);

    const submitExercise = useCallback(async (
        data: SubmitExerciseDTO
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data: existing } = await supabase
                .from('exercise_submissions')
                .select('id')
                .eq('content_id', data.content_id)
                .eq('student_id', data.student_id)
                .single();

            if (existing) {
                const { error: updateError } = await supabase
                    .from('exercise_submissions')
                    .update({
                        answer_text: data.answer_text || null,
                        answer_code: data.answer_code || null,
                        answer_url: data.answer_url || null,
                        file_url: data.file_url || null,
                        file_name: data.file_name || null,
                        status: 'pending',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existing.id);

                if (updateError) throw updateError;

                showSuccessToast('Resposta atualizada!', 'Aguardando correção do professor');
            } else {
                const { error: insertError } = await supabase
                    .from('exercise_submissions')
                    .insert({
                        content_id: data.content_id,
                        student_id: data.student_id,
                        answer_text: data.answer_text || null,
                        answer_code: data.answer_code || null,
                        answer_url: data.answer_url || null,
                        file_url: data.file_url || null,
                        file_name: data.file_name || null,
                        status: 'pending',
                    });

                if (insertError) throw insertError;

                showSuccessToast('Exercício enviado! 📝', 'Aguardando correção do professor');
            }

            await fetchSubmissions();
            return { success: true };
        } catch (err) {
            console.error('[useExerciseSubmissions] Erro ao enviar exercício:', err);
            showErrorToast('Erro ao enviar resposta', 'Tente novamente');
            return { success: false, error: 'Erro ao enviar resposta' };
        }
    }, [supabase, fetchSubmissions]);

    const updateSubmission = useCallback(async (
        id: string,
        data: Partial<SubmitExerciseDTO>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
                status: 'pending',
            };

            if (data.answer_text !== undefined) updateData.answer_text = data.answer_text || null;
            if (data.answer_code !== undefined) updateData.answer_code = data.answer_code || null;
            if (data.answer_url !== undefined) updateData.answer_url = data.answer_url || null;
            if (data.file_url !== undefined) updateData.file_url = data.file_url || null;
            if (data.file_name !== undefined) updateData.file_name = data.file_name || null;

            const { error: updateError } = await supabase
                .from('exercise_submissions')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchSubmissions();

            showSuccessToast('Resposta atualizada!');
            return { success: true };
        } catch (err) {
            console.error('[useExerciseSubmissions] Erro ao atualizar submissão:', err);
            showErrorToast('Erro ao atualizar resposta', 'Tente novamente');
            return { success: false, error: 'Erro ao atualizar resposta' };
        }
    }, [supabase, fetchSubmissions]);

    const reviewSubmission = useCallback(async (
        id: string,
        data: ReviewExerciseDTO
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            // 🆕 Buscar o student_id e content_id antes de atualizar
            const { data: submissionData } = await supabase
                .from('exercise_submissions')
                .select('student_id, content_id, status')
                .eq('id', id)
                .single();

            const { error: updateError } = await supabase
                .from('exercise_submissions')
                .update({
                    grade: data.grade ?? null,
                    feedback: data.feedback || null,
                    status: data.status,
                    reviewed_by: data.reviewed_by,
                    reviewed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            // 🆕 Se foi aprovado ou corrigido (e não era antes), dar XP ao aluno
            if (
                submissionData &&
                (data.status === 'approved' || data.status === 'reviewed') &&
                submissionData.status === 'pending'
            ) {
                await awardXpToStudent(
                    submissionData.student_id,
                    data.grade,
                    submissionData.content_id
                );
            }

            await fetchSubmissions();

            const statusLabel = {
                pending: 'Pendente',
                approved: 'Aprovado ✅',
                needs_revision: 'Revisão solicitada 📝',
                reviewed: 'Corrigido',
            }[data.status] || 'Atualizado';

            const gradeText = data.grade !== undefined && data.grade !== null ? ` • Nota: ${data.grade}` : '';

            showSuccessToast(`Exercício ${statusLabel}`, `Correção salva${gradeText}`);
            return { success: true };
        } catch (err) {
            console.error('[useExerciseSubmissions] Erro ao corrigir exercício:', err);
            showErrorToast('Erro ao salvar correção', 'Tente novamente');
            return { success: false, error: 'Erro ao salvar correção' };
        }
    }, [supabase, fetchSubmissions, awardXpToStudent]);

    const getSubmissionByContent = useCallback(async (
        contentId: string,
        studentId: string
    ): Promise<ExerciseSubmission | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('exercise_submissions')
                .select('*')
                .eq('content_id', contentId)
                .eq('student_id', studentId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            return data as ExerciseSubmission | null;
        } catch (err) {
            console.error('[useExerciseSubmissions] Erro ao buscar submissão:', err);
            return null;
        }
    }, [supabase]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    return {
        submissions,
        isLoading,
        error,
        submitExercise,
        updateSubmission,
        reviewSubmission,
        getSubmissionByContent,
        refetch: fetchSubmissions,
    };
}