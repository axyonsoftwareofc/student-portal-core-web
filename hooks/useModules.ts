// hooks/useModules.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import type { Module, ModuleFormData, Course } from '@/lib/types/database';

export type { Module, ModuleFormData };

export interface ModuleWithCourse extends Module {
    course: Course;
}

export function useModules(courseId?: string) {
    const [modules, setModules] = useState<ModuleWithCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchModules = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('modules')
                .select(`
          *,
          course:courses(*)
        `)
                .order('order_index', { ascending: true });

            if (courseId) {
                query = query.eq('course_id', courseId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setModules((data as ModuleWithCourse[]) || []);
        } catch (err) {
            console.error('[useModules] Erro ao buscar módulos:', err);
            setError('Erro ao carregar módulos');
            showErrorToast('Erro ao carregar módulos', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, courseId]);

    const createModule = useCallback(async (
        data: ModuleFormData
    ): Promise<{ success: boolean; error?: string; module?: Module }> => {
        try {
            const { data: lastModule } = await supabase
                .from('modules')
                .select('order_index')
                .eq('course_id', data.course_id)
                .order('order_index', { ascending: false })
                .limit(1)
                .single();

            const nextOrder = (lastModule?.order_index || 0) + 1;

            const { data: newModule, error: insertError } = await supabase
                .from('modules')
                .insert([{
                    course_id: data.course_id,
                    name: data.name.trim(),
                    description: data.description?.trim() || null,
                    order_index: data.order_index ?? nextOrder,
                    status: data.status || 'DRAFT',
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            await fetchModules();

            showSuccessToast('Módulo criado!', data.name);
            return { success: true, module: newModule as Module };
        } catch (err) {
            console.error('[useModules] Erro ao criar módulo:', err);
            showErrorToast('Erro ao criar módulo', 'Tente novamente');
            return { success: false, error: 'Erro ao criar módulo' };
        }
    }, [supabase, fetchModules]);

    const updateModule = useCallback(async (
        id: string,
        data: Partial<ModuleFormData>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (data.name) updateData.name = data.name.trim();
            if (data.description !== undefined) updateData.description = data.description?.trim() || null;
            if (data.order_index !== undefined) updateData.order_index = data.order_index;
            if (data.status) updateData.status = data.status;
            if (data.course_id) updateData.course_id = data.course_id;

            const { error: updateError } = await supabase
                .from('modules')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchModules();

            showSuccessToast('Módulo atualizado!', data.name || 'Alterações salvas');
            return { success: true };
        } catch (err) {
            console.error('[useModules] Erro ao atualizar módulo:', err);
            showErrorToast('Erro ao atualizar módulo', 'Tente novamente');
            return { success: false, error: 'Erro ao atualizar módulo' };
        }
    }, [supabase, fetchModules]);

    const deleteModule = useCallback(async (
        id: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: deleteError } = await supabase
                .from('modules')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await fetchModules();

            showSuccessToast('Módulo excluído', 'Registro removido com sucesso');
            return { success: true };
        } catch (err) {
            console.error('[useModules] Erro ao excluir módulo:', err);
            showErrorToast('Erro ao excluir módulo', 'Verifique se não há aulas vinculadas');
            return { success: false, error: 'Erro ao excluir módulo' };
        }
    }, [supabase, fetchModules]);

    const reorderModules = useCallback(async (
        orderedIds: string[]
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updates = orderedIds.map((id, index) =>
                supabase
                    .from('modules')
                    .update({ order_index: index + 1, updated_at: new Date().toISOString() })
                    .eq('id', id)
            );

            await Promise.all(updates);
            await fetchModules();

            showSuccessToast('Módulos reordenados!');
            return { success: true };
        } catch (err) {
            console.error('[useModules] Erro ao reordenar módulos:', err);
            showErrorToast('Erro ao reordenar', 'Tente novamente');
            return { success: false, error: 'Erro ao reordenar módulos' };
        }
    }, [supabase, fetchModules]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    return {
        modules,
        isLoading,
        error,
        fetchModules,
        createModule,
        updateModule,
        deleteModule,
        reorderModules,
    };
}