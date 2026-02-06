// hooks/useLessonMaterials.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Material } from '@/lib/types/database';

export function useLessonMaterials(lessonId: string | null) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());

    const fetchMaterials = useCallback(async () => {
        if (!lessonId) {
            setMaterials([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            const { data, error: fetchError } = await supabase
                .from('materials')
                .select('*')
                .eq('lesson_id', lessonId)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;

            setMaterials((data as Material[]) || []);
        } catch (err) {
            console.error('Erro ao buscar materiais:', err);
            setError('Erro ao carregar materiais');
        } finally {
            setIsLoading(false);
        }
    }, [lessonId]);

    // Incrementar contador de downloads
    const incrementDownload = useCallback(async (materialId: string) => {
        try {
            const supabase = supabaseRef.current;

            await supabase.rpc('increment_material_downloads', {
                material_id: materialId
            });

            // Atualizar localmente
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
        incrementDownload,
    };
}