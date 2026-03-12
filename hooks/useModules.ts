// hooks/useModules.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import type { Module, ModuleFormData, Phase, Track } from '@/lib/types/database';

export type { Module, ModuleFormData };

// 🆕 v20.0 - Agora referencia Phase em vez de Course
export interface ModuleWithPhase extends Module {
    phase: Phase & {
        track: Track;
    };
}

export function useModules(phaseId?: string) {
    const [modules, setModules] = useState<ModuleWithPhase[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchModules = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            // 🆕 v20.0 - Busca com phase e track
            let query = supabase
                .from('modules')
                .select(`
                    *,
                    phase:phases(
                        *,
                        track:tracks(*)
                    )
                `)
                .order('order_index', { ascending: true });

            if (phaseId) {
                query = query.eq('phase_id', phaseId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            // Filtrar módulos que têm phase_id (ignorar órfãos da migração)
            const validModules = (data || []).filter(
                (m: ModuleWithPhase) => m.phase_id && m.phase
            );

            setModules(validModules as ModuleWithPhase[]);
        } catch (err) {
            console.error('[useModules] Erro ao buscar módulos:', err);
            setError('Erro ao carregar módulos');
            showErrorToast('Erro ao carregar módulos', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, phaseId]);

    const createModule = useCallback(async (
        data: ModuleFormData
    ): Promise<{ success: boolean; error?: string; module?: Module }> => {
        try {
            // Buscar último order_index da fase
            const { data: lastModule } = await supabase
                .from('modules')
                .select('order_index')
                .eq('phase_id', data.phase_id)
                .order('order_index', { ascending: false })
                .limit(1)
                .single();

            const nextOrder = (lastModule?.order_index || 0) + 1;

            // 🆕 v20.0 - Usa phase_id em vez de course_id
            const { data: newModule, error: insertError } = await supabase
                .from('modules')
                .insert([{
                    phase_id: data.phase_id,
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
            if (data.phase_id) updateData.phase_id = data.phase_id;

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
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                showErrorToast('Sessão expirada', 'Faça login novamente');
                return { success: false, error: 'Sessão expirada' };
            }

            const response = await fetch('/api/admin/delete-module', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ moduleId: id }),
            });

            const result = await response.json();

            if (!response.ok) {
                showErrorToast('Erro ao excluir', result.error || 'Tente novamente');
                return { success: false, error: result.error };
            }

            await fetchModules();

            const deletedInfo = result.deleted;
            const details = deletedInfo
                ? `${deletedInfo.lessons} aulas e ${deletedInfo.contents} blocos removidos`
                : 'Módulo removido com sucesso';

            showSuccessToast('Módulo excluído!', details);
            return { success: true };
        } catch (err) {
            console.error('[useModules] Erro ao excluir módulo:', err);
            showErrorToast('Erro ao excluir', 'Não foi possível remover o módulo');
            return { success: false, error: 'Erro ao excluir módulo' };
        }
    }, [supabase, fetchModules]);

    const reorderModules = useCallback(async (
        orderedIds: string[]
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updates = orderedIds.map((id: string, index: number) =>
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

    // 🆕 v20.0 - Função auxiliar para buscar módulos por trilha
    const getModulesByTrack = useCallback(async (
        trackId: string
    ): Promise<ModuleWithPhase[]> => {
        try {
            const { data, error } = await supabase
                .from('modules')
                .select(`
                    *,
                    phase:phases(
                        *,
                        track:tracks(*)
                    )
                `)
                .order('order_index', { ascending: true });

            if (error) throw error;

            // Filtrar por trilha
            return (data || []).filter(
                (m: ModuleWithPhase) => m.phase?.track?.id === trackId
            ) as ModuleWithPhase[];
        } catch (err) {
            console.error('[useModules] Erro ao buscar módulos por trilha:', err);
            return [];
        }
    }, [supabase]);

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
        getModulesByTrack,
    };
}