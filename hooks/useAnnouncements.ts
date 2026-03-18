// hooks/useAnnouncements.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    AnnouncementWithDetails,
    CreateAnnouncementData,
    UpdateAnnouncementData,
} from '@/lib/types/announcements';

interface UseAnnouncementsReturn {
    announcements: AnnouncementWithDetails[];
    isLoading: boolean;
    error: string | null;
    createAnnouncement: (data: CreateAnnouncementData) => Promise<{ success: boolean; error?: string }>;
    updateAnnouncement: (id: string, data: UpdateAnnouncementData) => Promise<{ success: boolean; error?: string }>;
    deleteAnnouncement: (id: string) => Promise<{ success: boolean; error?: string }>;
    togglePin: (id: string, isPinned: boolean) => Promise<{ success: boolean; error?: string }>;
    toggleActive: (id: string, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
    refresh: () => Promise<void>;
}

export function useAnnouncements(): UseAnnouncementsReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [announcements, setAnnouncements] = useState<AnnouncementWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnnouncements = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('announcements_view')
                .select('*')
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setAnnouncements((data || []) as AnnouncementWithDetails[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar avisos');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const createAnnouncement = async (data: CreateAnnouncementData): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { error: insertError } = await supabase
                .from('announcements')
                .insert({
                    ...data,
                    author_id: user.id,
                    target_id: data.target_id || null,
                    expires_at: data.expires_at || null,
                });

            if (insertError) throw insertError;

            await fetchAnnouncements();

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao criar aviso',
            };
        }
    };

    const updateAnnouncement = async (id: string, data: UpdateAnnouncementData): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: updateError } = await supabase
                .from('announcements')
                .update(data)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchAnnouncements();

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao atualizar aviso',
            };
        }
    };

    const deleteAnnouncement = async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: deleteError } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setAnnouncements((prev: AnnouncementWithDetails[]) =>
                prev.filter((a: AnnouncementWithDetails) => a.id !== id)
            );

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao excluir aviso',
            };
        }
    };

    const togglePin = async (id: string, isPinned: boolean): Promise<{ success: boolean; error?: string }> => {
        return updateAnnouncement(id, { is_pinned: isPinned });
    };

    const toggleActive = async (id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> => {
        return updateAnnouncement(id, { is_active: isActive });
    };

    const refresh = async (): Promise<void> => {
        await fetchAnnouncements();
    };

    return {
        announcements,
        isLoading,
        error,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        togglePin,
        toggleActive,
        refresh,
    };
}