// hooks/useAdmins.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/lib/types/database';

export function useAdmins() {
    const [admins, setAdmins] = useState<User[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            const { data, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .order('name', { ascending: true });

            if (fetchError) throw fetchError;

            const users = (data as User[]) || [];
            setAdmins(users.filter(u => u.role === 'admin'));
            setStudents(users.filter(u => u.role === 'student' && u.status === 'active'));
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            setError('Erro ao carregar usuários');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Promover a admin
    const promoteToAdmin = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const supabase = supabaseRef.current;

            const { error: updateError } = await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', userId);

            if (updateError) throw updateError;

            await fetchUsers();
            return { success: true };
        } catch (err) {
            console.error('Erro ao promover admin:', err);
            return { success: false, error: 'Erro ao promover usuário' };
        }
    }, [fetchUsers]);

    // Remover admin (voltar a ser aluno)
    const demoteAdmin = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const supabase = supabaseRef.current;

            // Verificar se não é o último admin
            if (admins.length <= 1) {
                return { success: false, error: 'Não é possível remover o último administrador' };
            }

            const { error: updateError } = await supabase
                .from('users')
                .update({ role: 'student' })
                .eq('id', userId);

            if (updateError) throw updateError;

            await fetchUsers();
            return { success: true };
        } catch (err) {
            console.error('Erro ao remover admin:', err);
            return { success: false, error: 'Erro ao remover administrador' };
        }
    }, [fetchUsers, admins.length]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        admins,
        students,
        isLoading,
        error,
        refetch: fetchUsers,
        promoteToAdmin,
        demoteAdmin,
    };
}