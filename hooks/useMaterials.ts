// hooks/useMaterials.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Material, MaterialCategory } from '@/lib/types/database';

export interface MaterialWithLesson extends Material {
    lesson?: {
        id: string;
        title: string;
        module?: {
            id: string;
            name: string;
            course?: {
                id: string;
                name: string;
            };
        };
    };
}

export interface MaterialFormData {
    name: string;
    description?: string;
    category: MaterialCategory;
    filename: string; // URL ou caminho do arquivo
    file_size?: number;
    lesson_id?: string;
    course_id?: string;
}

export function useMaterials(lessonId?: string | null) {
    const [materials, setMaterials] = useState<MaterialWithLesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());

    const fetchMaterials = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            let query = supabase
                .from('materials')
                .select(`
                    *,
                    lesson:lessons (
                        id,
                        title,
                        module:modules (
                            id,
                            name,
                            course:courses (
                                id,
                                name
                            )
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            // Se lessonId foi passado, filtrar por aula
            if (lessonId) {
                query = query.eq('lesson_id', lessonId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setMaterials((data as MaterialWithLesson[]) || []);
        } catch (err) {
            console.error('Erro ao buscar materiais:', err);
            setError('Erro ao carregar materiais');
        } finally {
            setIsLoading(false);
        }
    }, [lessonId]);

    // Criar material
    const createMaterial = useCallback(async (data: MaterialFormData): Promise<{ success: boolean; error?: string }> => {
        try {
            const supabase = supabaseRef.current;

            // Buscar usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, error: 'Usuário não autenticado' };
            }

            const insertData = {
                name: data.name.trim(),
                description: data.description?.trim() || '',
                category: data.category,
                filename: data.filename.trim(),
                file_size: data.file_size || null,
                lesson_id: data.lesson_id || null,
                course_id: data.course_id || null,
                user_id: user.id,
                downloads: 0,
                upload_date: new Date().toISOString(),
            };

            const { error: insertError } = await supabase
                .from('materials')
                .insert(insertData);

            if (insertError) throw insertError;

            await fetchMaterials();
            return { success: true };
        } catch (err) {
            console.error('Erro ao criar material:', err);
            return { success: false, error: 'Erro ao criar material' };
        }
    }, [fetchMaterials]);

    // Atualizar material
    const updateMaterial = useCallback(async (
        id: string,
        data: Partial<MaterialFormData>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const supabase = supabaseRef.current;

            const updateData: Record<string, unknown> = {};

            if (data.name !== undefined) updateData.name = data.name.trim();
            if (data.description !== undefined) updateData.description = data.description.trim() || '';
            if (data.category !== undefined) updateData.category = data.category;
            if (data.filename !== undefined) updateData.filename = data.filename.trim();
            if (data.file_size !== undefined) updateData.file_size = data.file_size;
            if (data.lesson_id !== undefined) updateData.lesson_id = data.lesson_id || null;
            if (data.course_id !== undefined) updateData.course_id = data.course_id || null;

            const { error: updateError } = await supabase
                .from('materials')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchMaterials();
            return { success: true };
        } catch (err) {
            console.error('Erro ao atualizar material:', err);
            return { success: false, error: 'Erro ao atualizar material' };
        }
    }, [fetchMaterials]);

    // Excluir material
    const deleteMaterial = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const supabase = supabaseRef.current;

            const { error: deleteError } = await supabase
                .from('materials')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setMaterials(prev => prev.filter(m => m.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Erro ao excluir material:', err);
            return { success: false, error: 'Erro ao excluir material' };
        }
    }, []);

    // Incrementar downloads
    const incrementDownload = useCallback(async (materialId: string) => {
        try {
            const supabase = supabaseRef.current;

            await supabase.rpc('increment_material_downloads', {
                material_id: materialId
            });

            setMaterials(prev =>
                prev.map(m =>
                    m.id === materialId
                        ? { ...m, downloads: m.downloads + 1 }
                        : m
                )
            );
        } catch (err) {
            console.error('Erro ao incrementar download:', err);
        }
    }, []);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    return {
        materials,
        isLoading,
        error,
        refetch: fetchMaterials,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        incrementDownload,
    };
}