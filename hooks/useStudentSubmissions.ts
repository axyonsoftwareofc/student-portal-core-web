// hooks/useStudentSubmissions.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ExerciseSubmission } from '@/lib/types/exercise-submissions';

interface SubmissionWithContent extends ExerciseSubmission {
    content?: {
        id: string;
        title: string;
        lesson_id: string;
        lesson?: {
            id: string;
            title: string;
            module_id: string;
            module?: {
                id: string;
                name: string;
                course?: {
                    id: string;
                    name: string;
                };
            };
        };
    };
}

interface UseStudentSubmissionsReturn {
    submissions: SubmissionWithContent[];
    recentlyReviewed: SubmissionWithContent[];
    pendingCount: number;
    reviewedCount: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useStudentSubmissions(studentId: string | null): UseStudentSubmissionsReturn {
    const [submissions, setSubmissions] = useState<SubmissionWithContent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchSubmissions = useCallback(async (): Promise<void> => {
        if (!studentId) {
            setSubmissions([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('exercise_submissions')
                .select(`
                    *,
                    content:lesson_contents (
                        id, title, lesson_id
                    )
                `)
                .eq('student_id', studentId)
                .order('updated_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Buscar informações das aulas
            const submissionsWithLessons = await Promise.all(
                (data || []).map(async (submission: SubmissionWithContent) => {
                    if (submission.content?.lesson_id) {
                        const { data: lessonData } = await supabase
                            .from('lessons')
                            .select(`
                                id, title, module_id,
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
            console.error('[useStudentSubmissions] Erro:', err);
            setError('Erro ao carregar submissões');
        } finally {
            setIsLoading(false);
        }
    }, [studentId, supabase]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    // Filtrar exercícios corrigidos recentemente (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentlyReviewed = submissions.filter((s: SubmissionWithContent) => {
        if (!s.reviewed_at) return false;
        const reviewedDate = new Date(s.reviewed_at);
        return reviewedDate >= sevenDaysAgo && (s.status === 'approved' || s.status === 'reviewed' || s.status === 'needs_revision');
    });

    const pendingCount = submissions.filter((s: SubmissionWithContent) => s.status === 'pending').length;
    const reviewedCount = submissions.filter((s: SubmissionWithContent) =>
        s.status === 'approved' || s.status === 'reviewed'
    ).length;

    return {
        submissions,
        recentlyReviewed,
        pendingCount,
        reviewedCount,
        isLoading,
        error,
        refetch: fetchSubmissions,
    };
}