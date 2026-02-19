// hooks/useLessonContents.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
    LessonContent,
    LessonContentFormData,
    UseLessonContentsReturn
} from '@/lib/types/lesson-contents';

export function useLessonContents(lessonId?: string): UseLessonContentsReturn {
    const [contents, setContents] = useState<LessonContent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchContents = useCallback(async (): Promise<void> => {
        if (!lessonId) {
            setContents([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('lesson_contents')
                .select('*')
                .eq('lesson_id', lessonId)
                .order('order_index', { ascending: true });

            if (fetchError) throw fetchError;

            setContents((data as LessonContent[]) || []);
        } catch (err) {
            console.error('[useLessonContents] Erro ao buscar conteúdos:', err);
            setError('Erro ao carregar conteúdos');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, lessonId]);

    const createContent = useCallback(async (
        targetLessonId: string,
        data: LessonContentFormData
    ): Promise<{ success: boolean; error?: string; content?: LessonContent }> => {
        try {
            const { data: lastContent } = await supabase
                .from('lesson_contents')
                .select('order_index')
                .eq('lesson_id', targetLessonId)
                .order('order_index', { ascending: false })
                .limit(1)
                .single();

            const nextOrder = (lastContent?.order_index || 0) + 1;

            const contentData = {
                lesson_id: targetLessonId,
                type: data.type,
                title: data.title.trim(),
                description: data.description?.trim() || null,
                youtube_id: data.youtube_id?.trim() || null,
                duration: data.duration?.trim() || null,
                content: data.content?.trim() || null,
                quiz_data: data.quiz_data || null,
                material_url: data.material_url?.trim() || null,
                material_category: data.material_category || null,
                order_index: data.order_index ?? nextOrder,
            };

            const { data: newContent, error: insertError } = await supabase
                .from('lesson_contents')
                .insert([contentData])
                .select()
                .single();

            if (insertError) throw insertError;

            await updateLessonContentCount(targetLessonId);
            await fetchContents();

            return { success: true, content: newContent as LessonContent };
        } catch (err) {
            console.error('[useLessonContents] Erro ao criar conteúdo:', err);
            return { success: false, error: 'Erro ao criar conteúdo' };
        }
    }, [supabase, fetchContents]);

    const updateContent = useCallback(async (
        contentId: string,
        data: Partial<LessonContentFormData>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (data.type !== undefined) updateData.type = data.type;
            if (data.title !== undefined) updateData.title = data.title.trim();
            if (data.description !== undefined) updateData.description = data.description?.trim() || null;
            if (data.youtube_id !== undefined) updateData.youtube_id = data.youtube_id?.trim() || null;
            if (data.duration !== undefined) updateData.duration = data.duration?.trim() || null;
            if (data.content !== undefined) updateData.content = data.content?.trim() || null;
            if (data.quiz_data !== undefined) updateData.quiz_data = data.quiz_data;
            if (data.material_url !== undefined) updateData.material_url = data.material_url?.trim() || null;
            if (data.material_category !== undefined) updateData.material_category = data.material_category;
            if (data.order_index !== undefined) updateData.order_index = data.order_index;

            const { error: updateError } = await supabase
                .from('lesson_contents')
                .update(updateData)
                .eq('id', contentId);

            if (updateError) throw updateError;

            await fetchContents();
            return { success: true };
        } catch (err) {
            console.error('[useLessonContents] Erro ao atualizar conteúdo:', err);
            return { success: false, error: 'Erro ao atualizar conteúdo' };
        }
    }, [supabase, fetchContents]);

    const deleteContent = useCallback(async (
        contentId: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data: content } = await supabase
                .from('lesson_contents')
                .select('lesson_id')
                .eq('id', contentId)
                .single();

            const { error: deleteError } = await supabase
                .from('lesson_contents')
                .delete()
                .eq('id', contentId);

            if (deleteError) throw deleteError;

            if (content?.lesson_id) {
                await updateLessonContentCount(content.lesson_id);
            }

            await fetchContents();
            return { success: true };
        } catch (err) {
            console.error('[useLessonContents] Erro ao excluir conteúdo:', err);
            return { success: false, error: 'Erro ao excluir conteúdo' };
        }
    }, [supabase, fetchContents]);

    const reorderContents = useCallback(async (
        targetLessonId: string,
        orderedIds: string[]
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updates = orderedIds.map((id, index) =>
                supabase
                    .from('lesson_contents')
                    .update({
                        order_index: index + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id)
            );

            await Promise.all(updates);
            await fetchContents();
            return { success: true };
        } catch (err) {
            console.error('[useLessonContents] Erro ao reordenar conteúdos:', err);
            return { success: false, error: 'Erro ao reordenar conteúdos' };
        }
    }, [supabase, fetchContents]);

    const updateLessonContentCount = async (targetLessonId: string): Promise<void> => {
        try {
            const { count } = await supabase
                .from('lesson_contents')
                .select('*', { count: 'exact', head: true })
                .eq('lesson_id', targetLessonId);

            await supabase
                .from('lessons')
                .update({
                    total_contents: count || 0,
                    updated_at: new Date().toISOString()
                })
                .eq('id', targetLessonId);
        } catch (err) {
            console.error('[useLessonContents] Erro ao atualizar contagem:', err);
        }
    };

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    return {
        contents,
        isLoading,
        error,
        createContent,
        updateContent,
        deleteContent,
        reorderContents,
        refetch: fetchContents,
    };
}