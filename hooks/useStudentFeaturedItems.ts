'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { compareByDeadline, isExerciseDelivered, isTaskDelivered } from '@/lib/featured-items';
import type { FeaturedItemWithLesson, StudentFeaturedItem } from '@/lib/types/featured-items';

interface TaskSubmissionRow {
    featured_item_id: string;
    status: string;
    feedback: string | null;
}

interface ExerciseSubmissionRow {
    content_id: string;
    status: string;
    feedback: string | null;
}

interface LessonContentRow {
    id: string;
    lesson_id: string;
}

interface SubmitTaskData {
    content: string;
    link_url: string;
}

interface UseStudentFeaturedItemsReturn {
    items: StudentFeaturedItem[];
    isLoading: boolean;
    error: string | null;
    submitTask: (itemId: string, data: SubmitTaskData) => Promise<{ success: boolean; error?: string }>;
    refresh: () => Promise<void>;
}

export function useStudentFeaturedItems(userId: string | null): UseStudentFeaturedItemsReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [items, setItems] = useState<StudentFeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async (): Promise<void> => {
        if (!userId) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const now = new Date().toISOString();

            // A segmentação é aplicada pelo banco (RLS); aqui só filtramos ativos e não expirados
            const { data, error: itemsError } = await supabase
                .from('featured_items')
                .select('*, lesson:lessons(id, title, module_id)')
                .eq('is_active', true)
                .or(`expires_at.is.null,expires_at.gt.${now}`);

            if (itemsError) throw itemsError;

            const rows = (data || []) as FeaturedItemWithLesson[];

            if (rows.length === 0) {
                setItems([]);
                return;
            }

            // Tarefas avulsas: entrega do aluno
            const taskIds = rows
                .filter((r: FeaturedItemWithLesson) => r.kind === 'task')
                .map((r: FeaturedItemWithLesson) => r.id);

            const taskSubmissions = new Map<string, TaskSubmissionRow>();

            if (taskIds.length > 0) {
                const { data: subs, error: subsError } = await supabase
                    .from('featured_item_submissions')
                    .select('featured_item_id, status, feedback')
                    .eq('student_id', userId)
                    .in('featured_item_id', taskIds);

                if (subsError) throw subsError;

                ((subs || []) as TaskSubmissionRow[]).forEach((s: TaskSubmissionRow) =>
                    taskSubmissions.set(s.featured_item_id, s)
                );
            }

            // Exercícios: conteúdos EXERCISE das aulas e submissões do aluno
            const lessonIds = rows
                .filter((r: FeaturedItemWithLesson) => r.kind === 'exercise' && r.lesson_id)
                .map((r: FeaturedItemWithLesson) => r.lesson_id as string);

            const contentIdsByLesson = new Map<string, string[]>();
            const exerciseSubmissions = new Map<string, ExerciseSubmissionRow>();

            if (lessonIds.length > 0) {
                const { data: contents, error: contentsError } = await supabase
                    .from('lesson_contents')
                    .select('id, lesson_id')
                    .eq('type', 'EXERCISE')
                    .in('lesson_id', lessonIds);

                if (contentsError) throw contentsError;

                const contentRows = (contents || []) as LessonContentRow[];

                contentRows.forEach((c: LessonContentRow) => {
                    contentIdsByLesson.set(c.lesson_id, [...(contentIdsByLesson.get(c.lesson_id) ?? []), c.id]);
                });

                if (contentRows.length > 0) {
                    const { data: subs, error: subsError } = await supabase
                        .from('exercise_submissions')
                        .select('content_id, status, feedback')
                        .eq('student_id', userId)
                        .in('content_id', contentRows.map((c: LessonContentRow) => c.id));

                    if (subsError) throw subsError;

                    ((subs || []) as ExerciseSubmissionRow[]).forEach((s: ExerciseSubmissionRow) =>
                        exerciseSubmissions.set(s.content_id, s)
                    );
                }
            }

            const visible: StudentFeaturedItem[] = [];

            for (const row of rows) {
                let delivered = false;
                let needsRevision = false;
                let feedback: string | null = null;

                if (row.kind === 'task') {
                    const submission = taskSubmissions.get(row.id);
                    ({ delivered, needsRevision } = isTaskDelivered(submission?.status));
                    feedback = needsRevision ? submission?.feedback ?? null : null;
                } else {
                    const contentIds = contentIdsByLesson.get(row.lesson_id ?? '') ?? [];
                    const statusByContent = new Map<string, string>();
                    contentIds.forEach((id: string) => {
                        const submission = exerciseSubmissions.get(id);
                        if (submission) statusByContent.set(id, submission.status);
                    });
                    ({ delivered, needsRevision } = isExerciseDelivered(contentIds, statusByContent));
                    if (needsRevision) {
                        const revised = contentIds
                            .map((id: string) => exerciseSubmissions.get(id))
                            .find((s) => s?.status === 'needs_revision');
                        feedback = revised?.feedback ?? null;
                    }
                }

                if (delivered) continue;

                visible.push({
                    id: row.id,
                    kind: row.kind,
                    title: row.kind === 'task' ? row.title ?? '' : row.lesson?.title ?? 'Exercício',
                    description: row.kind === 'task' ? row.description : null,
                    deadline: row.deadline,
                    created_at: row.created_at,
                    href:
                        row.kind === 'exercise' && row.lesson
                            ? `/aluno/estudar/${row.lesson.module_id}/${row.lesson.id}`
                            : null,
                    needsRevision,
                    feedback,
                });
            }

            setItems(visible.sort(compareByDeadline));
        } catch (err) {
            console.error('[useStudentFeaturedItems] Erro ao carregar destaques:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar destaques');
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [supabase, userId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const submitTask = async (
        itemId: string,
        data: SubmitTaskData
    ): Promise<{ success: boolean; error?: string }> => {
        if (!userId) return { success: false, error: 'Usuário não autenticado' };

        try {
            const now = new Date().toISOString();

            const { error: upsertError } = await supabase
                .from('featured_item_submissions')
                .upsert(
                    {
                        featured_item_id: itemId,
                        student_id: userId,
                        content: data.content.trim() || null,
                        link_url: data.link_url.trim() || null,
                        status: 'SUBMITTED',
                        submitted_at: now,
                        updated_at: now,
                        grade: null,
                        graded_by: null,
                        graded_at: null,
                    },
                    { onConflict: 'featured_item_id,student_id' }
                );

            if (upsertError) throw upsertError;

            await fetchItems();
            return { success: true };
        } catch (err) {
            console.error('[useStudentFeaturedItems] Erro ao enviar tarefa:', err);
            return { success: false, error: 'Erro ao enviar a tarefa. Tente novamente.' };
        }
    };

    const refresh = async (): Promise<void> => {
        await fetchItems();
    };

    return { items, isLoading, error, submitTask, refresh };
}
