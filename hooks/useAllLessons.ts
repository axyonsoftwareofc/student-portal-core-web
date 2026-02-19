// hooks/useAllLessons.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Module } from '@/lib/types/database';
import type { LessonContentType } from '@/lib/types/lesson-contents';

export interface LessonWithDetails {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    order_index: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    total_contents: number;
    views_count: number;
    created_at: string;
    updated_at: string;
    module?: Module & {
        course?: {
            id: string;
            name: string;
        };
    };
    content_summary?: {
        VIDEO: number;
        ARTICLE: number;
        EXERCISE: number;
        QUIZ: number;
        MATERIAL: number;
    };
}

export interface LessonFormData {
    module_id: string;
    title: string;
    description?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    order_index?: number;
}

export function useAllLessons() {
    const [lessons, setLessons] = useState<LessonWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchLessons = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select(`
                    id,
                    module_id,
                    title,
                    description,
                    order_index,
                    status,
                    total_contents,
                    views_count,
                    created_at,
                    updated_at,
                    module:modules (
                        *,
                        course:courses (id, name)
                    )
                `)
                .order('order_index', { ascending: true });

            if (lessonsError) throw lessonsError;

            const { data: contentsData } = await supabase
                .from('lesson_contents')
                .select('lesson_id, type');

            const contentSummaryMap: Record<string, Record<LessonContentType, number>> = {};

            if (contentsData) {
                contentsData.forEach((content: { lesson_id: string; type: LessonContentType }) => {
                    if (!contentSummaryMap[content.lesson_id]) {
                        contentSummaryMap[content.lesson_id] = {
                            VIDEO: 0,
                            ARTICLE: 0,
                            EXERCISE: 0,
                            QUIZ: 0,
                            MATERIAL: 0,
                        };
                    }
                    contentSummaryMap[content.lesson_id][content.type]++;
                });
            }

            const lessonsWithSummary = (lessonsData || []).map((lesson: LessonWithDetails) => ({
                ...lesson,
                content_summary: contentSummaryMap[lesson.id] || {
                    VIDEO: 0,
                    ARTICLE: 0,
                    EXERCISE: 0,
                    QUIZ: 0,
                    MATERIAL: 0,
                },
            }));

            setLessons(lessonsWithSummary);
        } catch (err) {
            console.error('[useAllLessons] Erro ao buscar aulas:', err);
            setError('Erro ao carregar aulas');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    const createLesson = useCallback(async (
        data: LessonFormData
    ): Promise<{ success: boolean; error?: string; lesson?: LessonWithDetails }> => {
        try {
            const { data: lastLesson } = await supabase
                .from('lessons')
                .select('order_index')
                .eq('module_id', data.module_id)
                .order('order_index', { ascending: false })
                .limit(1)
                .single();

            const nextOrder = (lastLesson?.order_index || 0) + 1;

            const lessonData = {
                module_id: data.module_id,
                title: data.title.trim(),
                description: data.description?.trim() || null,
                status: data.status || 'DRAFT',
                order_index: data.order_index ?? nextOrder,
                total_contents: 0,
            };

            const { data: newLesson, error: insertError } = await supabase
                .from('lessons')
                .insert([lessonData])
                .select(`
                    *,
                    module:modules (
                        *,
                        course:courses (id, name)
                    )
                `)
                .single();

            if (insertError) throw insertError;

            await fetchLessons();
            return { success: true, lesson: newLesson as LessonWithDetails };
        } catch (err) {
            console.error('[useAllLessons] Erro ao criar aula:', err);
            return { success: false, error: 'Erro ao criar aula' };
        }
    }, [supabase, fetchLessons]);

    const updateLesson = useCallback(async (
        id: string,
        data: Partial<LessonFormData>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (data.title !== undefined) updateData.title = data.title.trim();
            if (data.description !== undefined) updateData.description = data.description?.trim() || null;
            if (data.status !== undefined) updateData.status = data.status;
            if (data.module_id !== undefined) updateData.module_id = data.module_id;
            if (data.order_index !== undefined) updateData.order_index = data.order_index;

            const { error: updateError } = await supabase
                .from('lessons')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchLessons();
            return { success: true };
        } catch (err) {
            console.error('[useAllLessons] Erro ao atualizar aula:', err);
            return { success: false, error: 'Erro ao atualizar aula' };
        }
    }, [supabase, fetchLessons]);

    const deleteLesson = useCallback(async (
        id: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            // 1. Buscar todos os conteúdos da aula
            const { data: contents } = await supabase
                .from('lesson_contents')
                .select('id')
                .eq('lesson_id', id);

            const contentIds = contents?.map((c: { id: string }) => c.id) || [];

            // 2. Excluir progresso dos conteúdos
            if (contentIds.length > 0) {
                await supabase
                    .from('content_progress')
                    .delete()
                    .in('content_id', contentIds);
            }

            // 3. Excluir progresso da aula (tabela antiga lesson_progress)
            await supabase
                .from('lesson_progress')
                .delete()
                .eq('lesson_id', id);

            // 4. Excluir notas dos alunos relacionadas à aula
            await supabase
                .from('student_notes')
                .delete()
                .eq('lesson_id', id);

            // 5. Excluir materiais antigos (se ainda existirem)
            await supabase
                .from('materials')
                .delete()
                .eq('lesson_id', id);

            // 6. Excluir conteúdos da aula
            await supabase
                .from('lesson_contents')
                .delete()
                .eq('lesson_id', id);

            // 7. Finalmente, excluir a aula
            const { error: deleteError } = await supabase
                .from('lessons')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await fetchLessons();
            return { success: true };
        } catch (err) {
            console.error('[useAllLessons] Erro ao excluir aula:', err);
            return { success: false, error: 'Erro ao excluir aula' };
        }
    }, [supabase, fetchLessons]);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    return {
        lessons,
        isLoading,
        error,
        fetchLessons,
        createLesson,
        updateLesson,
        deleteLesson,
    };
}