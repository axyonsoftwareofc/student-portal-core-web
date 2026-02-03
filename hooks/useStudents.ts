// hooks/useStudents.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Student {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'admin';
    phone?: string | null;
    avatar_url?: string | null;
    created_at: string;
    updated_at?: string | null;
    invite_token?: string | null;
    invite_expires_at?: string | null;
    status?: 'pending' | 'active';
}

export interface StudentFormData {
    name: string;
    email: string;
    phone?: string;
}

// Gerar token de convite aleatório
function generateInviteToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export function useStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    // Buscar todos os alunos
    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'student')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setStudents(data as Student[]);
        } catch (err) {
            console.error('Erro ao buscar alunos:', err);
            setError('Erro ao carregar alunos');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    // Criar novo aluno com convite
    const createStudent = async (data: StudentFormData): Promise<{ success: boolean; error?: string; inviteLink?: string }> => {
        try {
            const inviteToken = generateInviteToken();
            const inviteExpiresAt = new Date();
            inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // Expira em 7 dias

            const newId = crypto.randomUUID();

            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    id: newId,
                    email: data.email,
                    name: data.name,
                    phone: data.phone || null,
                    role: 'student',
                    status: 'pending',
                    invite_token: inviteToken,
                    invite_expires_at: inviteExpiresAt.toISOString(),
                    created_at: new Date().toISOString(),
                }]);

            if (insertError) {
                if (insertError.message.includes('duplicate')) {
                    return { success: false, error: 'Este e-mail já está cadastrado' };
                }
                throw insertError;
            }

            // Gerar link de convite
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const inviteLink = `${baseUrl}/convite/${inviteToken}`;

            await fetchStudents();
            return { success: true, inviteLink };
        } catch (err) {
            console.error('Erro ao criar aluno:', err);
            return { success: false, error: 'Erro ao criar aluno' };
        }
    };

    // Reenviar convite
    const resendInvite = async (id: string): Promise<{ success: boolean; error?: string; inviteLink?: string }> => {
        try {
            const inviteToken = generateInviteToken();
            const inviteExpiresAt = new Date();
            inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    invite_token: inviteToken,
                    invite_expires_at: inviteExpiresAt.toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const inviteLink = `${baseUrl}/convite/${inviteToken}`;

            await fetchStudents();
            return { success: true, inviteLink };
        } catch (err) {
            console.error('Erro ao reenviar convite:', err);
            return { success: false, error: 'Erro ao reenviar convite' };
        }
    };

    // Atualizar aluno
    const updateStudent = async (id: string, data: Partial<StudentFormData>): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    ...data,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchStudents();
            return { success: true };
        } catch (err) {
            console.error('Erro ao atualizar aluno:', err);
            return { success: false, error: 'Erro ao atualizar aluno' };
        }
    };

    // Excluir aluno
    const deleteStudent = async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await fetchStudents();
            return { success: true };
        } catch (err) {
            console.error('Erro ao excluir aluno:', err);
            return { success: false, error: 'Erro ao excluir aluno' };
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    return {
        students,
        isLoading,
        error,
        fetchStudents,
        createStudent,
        updateStudent,
        deleteStudent,
        resendInvite,
    };
}