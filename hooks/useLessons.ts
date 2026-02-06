// hooks/useLessons.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Lesson, LessonFormData, Module } from '@/lib/types/database';

export type { Lesson, LessonFormData };

export interface LessonWithModule extends Lesson {
    module: Module & {
        course?: {
            id: string;
            name: string;
        };
    };
}

export function useLessons(moduleId?: string) {
    const [lessons, setLessons] = useState<LessonWithModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    // Buscar aulas (todas ou de um módulo específico)
    const fetchLessons = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('lessons')
                .select(`
                    *,
                    module:modules(
                        *,
                        course:courses(id, name)
                    )
                `)
                .order('order_index', { ascending: true });

            if (moduleId) {
                query = query.eq('module_id', moduleId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setLessons((data as LessonWithModule[]) || []);
        } catch (err) {
            console.error('[useLessons] Erro ao buscar aulas:', err);
            setError('Erro ao carregar aulas');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, moduleId]);

    // Criar aula
    const createLesson = useCallback(async (
        data: LessonFormData
    ): Promise<{ success: boolean; error?: string; lesson?: Lesson }> => {
        try {
            // Buscar próximo order_index
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
                type: data.type,
                youtube_id: data.youtube_id?.trim() || null,
                duration: data.duration?.trim() || null,
                content: data.content?.trim() || null,
                quiz_data: data.quiz_data || null,
                order_index: data.order_index ?? nextOrder,
                status: data.status || 'DRAFT',
            };

            const { data: newLesson, error: insertError } = await supabase
                .from('lessons')
                .insert([lessonData])
                .select()
                .single();

            if (insertError) throw insertError;

            await fetchLessons();
            return { success: true, lesson: newLesson as Lesson };
        } catch (err) {
            console.error('[useLessons] Erro ao criar aula:', err);
            return { success: false, error: 'Erro ao criar aula' };
        }
    }, [supabase, fetchLessons]);

    // Atualizar aula
    const updateLesson = useCallback(async (
        id: string,
        data: Partial<LessonFormData>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (data.title) updateData.title = data.title.trim();
            if (data.description !== undefined) updateData.description = data.description?.trim() || null;
            if (data.type) updateData.type = data.type;
            if (data.youtube_id !== undefined) updateData.youtube_id = data.youtube_id?.trim() || null;
            if (data.duration !== undefined) updateData.duration = data.duration?.trim() || null;
            if (data.content !== undefined) updateData.content = data.content?.trim() || null;
            if (data.quiz_data !== undefined) updateData.quiz_data = data.quiz_data;
            if (data.order_index !== undefined) updateData.order_index = data.order_index;
            if (data.status) updateData.status = data.status;
            if (data.module_id) updateData.module_id = data.module_id;

            const { error: updateError } = await supabase
                .from('lessons')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchLessons();
            return { success: true };
        } catch (err) {
            console.error('[useLessons] Erro ao atualizar aula:', err);
            return { success: false, error: 'Erro ao atualizar aula' };
        }
    }, [supabase, fetchLessons]);

    // Excluir aula
    const deleteLesson = useCallback(async (
        id: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: deleteError } = await supabase
                .from('lessons')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await fetchLessons();
            return { success: true };
        } catch (err) {
            console.error('[useLessons] Erro ao excluir aula:', err);
            return { success: false, error: 'Erro ao excluir aula' };
        }
    }, [supabase, fetchLessons]);

    // Reordenar aulas
    const reorderLessons = useCallback(async (
        orderedIds: string[]
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updates = orderedIds.map((id, index) =>
                supabase
                    .from('lessons')
                    .update({ order_index: index + 1, updated_at: new Date().toISOString() })
                    .eq('id', id)
            );

            await Promise.all(updates);
            await fetchLessons();
            return { success: true };
        } catch (err) {
            console.error('[useLessons] Erro ao reordenar aulas:', err);
            return { success: false, error: 'Erro ao reordenar aulas' };
        }
    }, [supabase, fetchLessons]);

    // Incrementar visualizações
    const incrementViews = useCallback(async (id: string): Promise<void> => {
        try {
            await supabase.rpc('increment_lesson_views', { lesson_id: id });
        } catch (err) {
            console.error('[useLessons] Erro ao incrementar views:', err);
        }
    }, [supabase]);

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
        reorderLessons,
        incrementViews,
    };
}