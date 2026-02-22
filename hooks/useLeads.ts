// hooks/useLeads.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/toast';
import { Lead, CreateLeadDTO, UpdateLeadDTO, UseLeadsReturn } from '@/lib/types/leads';

export function useLeads(): UseLeadsReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeads = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            setLeads((data as Lead[]) || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar leads';
            setError(errorMessage);
            showErrorToast('Erro ao carregar leads', 'Verifique sua conexão');
            console.error('useLeads - fetchLeads error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const createLead = useCallback(
        async (leadData: CreateLeadDTO): Promise<Lead> => {
            try {
                const { data, error: createError } = await supabase
                    .from('leads')
                    .insert([leadData])
                    .select()
                    .single();

                if (createError) {
                    throw new Error(createError.message);
                }

                if (!data) {
                    throw new Error('Erro ao criar lead');
                }

                const createdLead = data as Lead;
                setLeads((previousLeads: Lead[]) => [createdLead, ...previousLeads]);

                showSuccessToast('Lead cadastrado!', leadData.name);
                return createdLead;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao criar lead';
                setError(errorMessage);
                showErrorToast('Erro ao cadastrar lead', errorMessage);
                throw err;
            }
        },
        [supabase]
    );

    const updateLead = useCallback(
        async (leadId: string, leadData: UpdateLeadDTO): Promise<void> => {
            try {
                const { error: updateError } = await supabase
                    .from('leads')
                    .update(leadData)
                    .eq('id', leadId);

                if (updateError) {
                    throw new Error(updateError.message);
                }

                setLeads((previousLeads: Lead[]) =>
                    previousLeads.map((lead: Lead) =>
                        lead.id === leadId ? { ...lead, ...leadData } : lead
                    )
                );

                showSuccessToast('Lead atualizado!');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar lead';
                setError(errorMessage);
                showErrorToast('Erro ao atualizar lead', errorMessage);
                throw err;
            }
        },
        [supabase]
    );

    const markAsContacted = useCallback(
        async (leadId: string): Promise<void> => {
            try {
                const contactedAt = new Date().toISOString();

                const { error: updateError } = await supabase
                    .from('leads')
                    .update({
                        status: 'contacted',
                        contacted_at: contactedAt,
                    })
                    .eq('id', leadId);

                if (updateError) {
                    throw new Error(updateError.message);
                }

                setLeads((previousLeads: Lead[]) =>
                    previousLeads.map((lead: Lead) =>
                        lead.id === leadId
                            ? { ...lead, status: 'contacted' as const, contacted_at: contactedAt }
                            : lead
                    )
                );

                showSuccessToast('Lead marcado como contatado! 📞');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao marcar como contatado';
                setError(errorMessage);
                showErrorToast('Erro ao atualizar status', errorMessage);
                throw err;
            }
        },
        [supabase]
    );

    const convertToStudent = useCallback(
        async (leadId: string, _courseId: string): Promise<void> => {
            try {
                const convertedAt = new Date().toISOString();

                const { error: updateError } = await supabase
                    .from('leads')
                    .update({
                        status: 'converted',
                        converted_at: convertedAt,
                    })
                    .eq('id', leadId);

                if (updateError) {
                    throw new Error(updateError.message);
                }

                setLeads((previousLeads: Lead[]) =>
                    previousLeads.map((lead: Lead) =>
                        lead.id === leadId
                            ? { ...lead, status: 'converted' as const, converted_at: convertedAt }
                            : lead
                    )
                );

                showSuccessToast('Lead convertido em aluno! 🎉', 'Parabéns pela nova matrícula!');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao converter lead';
                setError(errorMessage);
                showErrorToast('Erro ao converter lead', errorMessage);
                throw err;
            }
        },
        [supabase]
    );

    const declineLead = useCallback(
        async (leadId: string): Promise<void> => {
            try {
                const { error: updateError } = await supabase
                    .from('leads')
                    .update({ status: 'declined' })
                    .eq('id', leadId);

                if (updateError) {
                    throw new Error(updateError.message);
                }

                setLeads((previousLeads: Lead[]) =>
                    previousLeads.map((lead: Lead) =>
                        lead.id === leadId ? { ...lead, status: 'declined' as const } : lead
                    )
                );

                showWarningToast('Lead declinado', 'O lead foi marcado como não interessado');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao declinar lead';
                setError(errorMessage);
                showErrorToast('Erro ao declinar lead', errorMessage);
                throw err;
            }
        },
        [supabase]
    );

    const deleteLead = useCallback(
        async (leadId: string): Promise<void> => {
            try {
                const { error: deleteError } = await supabase
                    .from('leads')
                    .delete()
                    .eq('id', leadId);

                if (deleteError) {
                    throw new Error(deleteError.message);
                }

                setLeads((previousLeads: Lead[]) =>
                    previousLeads.filter((lead: Lead) => lead.id !== leadId)
                );

                showSuccessToast('Lead excluído', 'Registro removido com sucesso');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar lead';
                setError(errorMessage);
                showErrorToast('Erro ao excluir lead', errorMessage);
                throw err;
            }
        },
        [supabase]
    );

    const refetch = useCallback(async (): Promise<void> => {
        await fetchLeads();
    }, [fetchLeads]);

    return {
        leads,
        isLoading,
        error,
        createLead,
        updateLead,
        markAsContacted,
        convertToStudent,
        declineLead,
        deleteLead,
        refetch,
    };
}