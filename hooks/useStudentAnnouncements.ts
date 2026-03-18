// hooks/useStudentAnnouncements.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnnouncementWithDetails } from '@/lib/types/announcements';

interface UseStudentAnnouncementsReturn {
    announcements: AnnouncementWithDetails[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    markAsRead: (announcementId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refresh: () => Promise<void>;
}

interface AnnouncementReadRecord {
    announcement_id: string;
}

export function useStudentAnnouncements(userId: string | null): UseStudentAnnouncementsReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [announcements, setAnnouncements] = useState<AnnouncementWithDetails[]>([]);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnnouncements = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const now = new Date().toISOString();

            const { data: announcementsData, error: announcementsError } = await supabase
                .from('announcements_view')
                .select('*')
                .eq('is_active', true)
                .or(`expires_at.is.null,expires_at.gt.${now}`)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (announcementsError) throw announcementsError;

            if (userId) {
                const { data: readsData } = await supabase
                    .from('announcement_reads')
                    .select('announcement_id')
                    .eq('user_id', userId);

                const readSet = new Set<string>(
                    (readsData || []).map((r: AnnouncementReadRecord) => r.announcement_id)
                );
                setReadIds(readSet);

                const announcementsWithRead = (announcementsData || []).map((a: AnnouncementWithDetails) => ({
                    ...a,
                    is_read: readSet.has(a.id),
                }));

                setAnnouncements(announcementsWithRead);
            } else {
                setAnnouncements((announcementsData || []) as AnnouncementWithDetails[]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar avisos');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, userId]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const markAsRead = async (announcementId: string): Promise<void> => {
        if (!userId || readIds.has(announcementId)) return;

        try {
            await supabase
                .from('announcement_reads')
                .insert({
                    announcement_id: announcementId,
                    user_id: userId,
                });

            setReadIds((prev: Set<string>) => {
                const newSet = new Set<string>(prev);
                newSet.add(announcementId);
                return newSet;
            });

            setAnnouncements((prev: AnnouncementWithDetails[]) =>
                prev.map((a: AnnouncementWithDetails) =>
                    a.id === announcementId ? { ...a, is_read: true } : a
                )
            );
        } catch (err) {
            console.error('Erro ao marcar como lido:', err);
        }
    };

    const markAllAsRead = async (): Promise<void> => {
        if (!userId) return;

        const unreadIds = announcements
            .filter((a: AnnouncementWithDetails) => !a.is_read)
            .map((a: AnnouncementWithDetails) => a.id);

        if (unreadIds.length === 0) return;

        try {
            const inserts = unreadIds.map((announcementId: string) => ({
                announcement_id: announcementId,
                user_id: userId,
            }));

            await supabase
                .from('announcement_reads')
                .upsert(inserts, { onConflict: 'announcement_id,user_id' });

            setReadIds((prev: Set<string>) => {
                const newSet = new Set<string>(prev);
                unreadIds.forEach((id: string) => newSet.add(id));
                return newSet;
            });

            setAnnouncements((prev: AnnouncementWithDetails[]) =>
                prev.map((a: AnnouncementWithDetails) => ({ ...a, is_read: true }))
            );
        } catch (err) {
            console.error('Erro ao marcar todos como lidos:', err);
        }
    };

    const unreadCount = announcements.filter((a: AnnouncementWithDetails) => !a.is_read).length;

    const refresh = async (): Promise<void> => {
        await fetchAnnouncements();
    };

    return {
        announcements,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        refresh,
    };
}