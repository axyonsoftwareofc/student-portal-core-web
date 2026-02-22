// hooks/useCourses.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import type { Course, CourseFormData } from '@/lib/types/database';

export type { Course, CourseFormData };

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setCourses((data as Course[]) || []);
        } catch (err) {
            console.error('[useCourses] Erro ao buscar cursos:', err);
            setError('Erro ao carregar cursos');
            showErrorToast('Erro ao carregar cursos', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    const createCourse = useCallback(async (
        data: CourseFormData
    ): Promise<{ success: boolean; error?: string; course?: Course }> => {
        try {
            const { data: newCourse, error: insertError } = await supabase
                .from('courses')
                .insert([{
                    name: data.name.trim(),
                    description: data.description?.trim() || null,
                    start_date: data.start_date || null,
                    end_date: data.end_date || null,
                    status: data.status || 'DRAFT',
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            await fetchCourses();

            showSuccessToast('Curso criado!', data.name);
            return { success: true, course: newCourse as Course };
        } catch (err) {
            console.error('[useCourses] Erro ao criar curso:', err);
            showErrorToast('Erro ao criar curso', 'Tente novamente');
            return { success: false, error: 'Erro ao criar curso' };
        }
    }, [supabase, fetchCourses]);

    const updateCourse = useCallback(async (
        id: string,
        data: Partial<CourseFormData>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (data.name) updateData.name = data.name.trim();
            if (data.description !== undefined) updateData.description = data.description?.trim() || null;
            if (data.start_date !== undefined) updateData.start_date = data.start_date || null;
            if (data.end_date !== undefined) updateData.end_date = data.end_date || null;
            if (data.status) updateData.status = data.status;

            const { error: updateError } = await supabase
                .from('courses')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchCourses();

            showSuccessToast('Curso atualizado!', data.name || 'Alterações salvas');
            return { success: true };
        } catch (err) {
            console.error('[useCourses] Erro ao atualizar curso:', err);
            showErrorToast('Erro ao atualizar curso', 'Tente novamente');
            return { success: false, error: 'Erro ao atualizar curso' };
        }
    }, [supabase, fetchCourses]);

    const deleteCourse = useCallback(async (
        id: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: deleteError } = await supabase
                .from('courses')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await fetchCourses();

            showSuccessToast('Curso excluído', 'Registro removido com sucesso');
            return { success: true };
        } catch (err) {
            console.error('[useCourses] Erro ao excluir curso:', err);
            showErrorToast('Erro ao excluir curso', 'Verifique se não há módulos vinculados');
            return { success: false, error: 'Erro ao excluir curso' };
        }
    }, [supabase, fetchCourses]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    return {
        courses,
        isLoading,
        error,
        fetchCourses,
        createCourse,
        updateCourse,
        deleteCourse,
    };
}