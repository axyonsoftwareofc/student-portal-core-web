// hooks/useFeaturedItems.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toItemPayload } from '@/lib/featured-items';
import type {
    CreateFeaturedItemData,
    FeaturedItemSubmissionWithStudent,
    FeaturedItemWithLesson,
    GradeSubmissionData,
} from '@/lib/types/featured-items';

type Result = { success: boolean; error?: string };

interface UseFeaturedItemsReturn {
    items: FeaturedItemWithLesson[];
    isLoading: boolean;
    error: string | null;
    createItem: (data: CreateFeaturedItemData) => Promise<Result>;
    updateItem: (id: string, data: CreateFeaturedItemData) => Promise<Result>;
    deleteItem: (id: string) => Promise<Result>;
    toggleActive: (id: string, isActive: boolean) => Promise<Result>;
    fetchSubmissions: (itemId: string) => Promise<FeaturedItemSubmissionWithStudent[]>;
    gradeSubmission: (id: string, data: GradeSubmissionData) => Promise<Result>;
    refresh: () => Promise<void>;
}

export function useFeaturedItems(): UseFeaturedItemsReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [items, setItems] = useState<FeaturedItemWithLesson[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('featured_items')
                .select('*, lesson:lessons(id, title, module_id)')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setItems((data || []) as FeaturedItemWithLesson[]);
        } catch (err) {
            console.error('[useFeaturedItems] Erro ao carregar destaques:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar destaques');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const createItem = async (data: CreateFeaturedItemData): Promise<Result> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { error: insertError } = await supabase
                .from('featured_items')
                .insert({ ...toItemPayload(data), created_by: user.id });

            if (insertError) throw insertError;

            await fetchItems();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar destaque' };
        }
    };

    const updateItem = async (id: string, data: CreateFeaturedItemData): Promise<Result> => {
        try {
            const { error: updateError } = await supabase
                .from('featured_items')
                .update({ ...toItemPayload(data), updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchItems();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar destaque' };
        }
    };

    const deleteItem = async (id: string): Promise<Result> => {
        try {
            const { error: deleteError } = await supabase
                .from('featured_items')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setItems((prev: FeaturedItemWithLesson[]) => prev.filter((i: FeaturedItemWithLesson) => i.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao excluir destaque' };
        }
    };

    const toggleActive = async (id: string, isActive: boolean): Promise<Result> => {
        try {
            const { error: updateError } = await supabase
                .from('featured_items')
                .update({ is_active: isActive, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchItems();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar destaque' };
        }
    };

    const fetchSubmissions = async (itemId: string): Promise<FeaturedItemSubmissionWithStudent[]> => {
        const { data, error: fetchError } = await supabase
            .from('featured_item_submissions')
            .select('*, student:users!featured_item_submissions_student_id_fkey(id, name, email)')
            .eq('featured_item_id', itemId)
            .order('submitted_at', { ascending: false });

        if (fetchError) throw fetchError;

        return (data || []) as FeaturedItemSubmissionWithStudent[];
    };

    const gradeSubmission = async (id: string, data: GradeSubmissionData): Promise<Result> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const now = new Date().toISOString();

            const { error: updateError } = await supabase
                .from('featured_item_submissions')
                .update({
                    status: data.status,
                    grade: data.grade,
                    feedback: data.feedback.trim() || null,
                    graded_by: user.id,
                    graded_at: now,
                    updated_at: now,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao salvar correção' };
        }
    };

    const refresh = async (): Promise<void> => {
        await fetchItems();
    };

    return {
        items,
        isLoading,
        error,
        createItem,
        updateItem,
        deleteItem,
        toggleActive,
        fetchSubmissions,
        gradeSubmission,
        refresh,
    };
}
