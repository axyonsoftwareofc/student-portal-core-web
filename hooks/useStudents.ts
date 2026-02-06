// hooks/useStudents.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, UserFormData } from '@/lib/types/database';

// Re-exportar para compatibilidade
export type Student = User;
export type StudentFormData = UserFormData;

// Gerar token de convite seguro
function generateInviteToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export function useStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Usar ref para o cliente Supabase (evita re-renders)
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

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

            setStudents((data as Student[]) || []);
        } catch (err) {
            console.error('[useStudents] Erro ao buscar alunos:', err);
            setError('Erro ao carregar alunos. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    // Criar novo aluno com convite
    const createStudent = useCallback(async (
        data: StudentFormData
    ): Promise<{ success: boolean; error?: string; inviteLink?: string }> => {
        try {
            // Verificar se email já existe
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', data.email.toLowerCase().trim())
                .maybeSingle();

            if (existing) {
                return { success: false, error: 'Este e-mail já está cadastrado' };
            }

            const inviteToken = generateInviteToken();
            const inviteExpiresAt = new Date();
            inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

            const newStudent = {
                id: crypto.randomUUID(),
                email: data.email.toLowerCase().trim(),
                name: data.name.trim(),
                phone: data.phone?.trim() || null,
                role: 'student' as const,
                status: 'pending' as const,
                invite_token: inviteToken,
                invite_expires_at: inviteExpiresAt.toISOString(),
            };

            const { error: insertError } = await supabase
                .from('users')
                .insert([newStudent]);

            if (insertError) {
                console.error('[useStudents] Erro ao inserir:', insertError);
                return { success: false, error: 'Erro ao cadastrar aluno' };
            }

            // Gerar link de convite
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const inviteLink = `${baseUrl}/convite/${inviteToken}`;

            // Atualizar lista local
            await fetchStudents();

            return { success: true, inviteLink };
        } catch (err) {
            console.error('[useStudents] Erro ao criar aluno:', err);
            return { success: false, error: 'Erro inesperado ao criar aluno' };
        }
    }, [supabase, fetchStudents]);

    // Reenviar convite
    const resendInvite = useCallback(async (
        id: string
    ): Promise<{ success: boolean; error?: string; inviteLink?: string }> => {
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
            console.error('[useStudents] Erro ao reenviar convite:', err);
            return { success: false, error: 'Erro ao reenviar convite' };
        }
    }, [supabase, fetchStudents]);

    // Atualizar aluno
    const updateStudent = useCallback(async (
        id: string,
        data: Partial<StudentFormData>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (data.name) updateData.name = data.name.trim();
            if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;

            const { error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchStudents();
            return { success: true };
        } catch (err) {
            console.error('[useStudents] Erro ao atualizar aluno:', err);
            return { success: false, error: 'Erro ao atualizar aluno' };
        }
    }, [supabase, fetchStudents]);

    // Excluir aluno
    const deleteStudent = useCallback(async (
        id: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await fetchStudents();
            return { success: true };
        } catch (err) {
            console.error('[useStudents] Erro ao excluir aluno:', err);
            return { success: false, error: 'Erro ao excluir aluno' };
        }
    }, [supabase, fetchStudents]);

    // Buscar ao montar
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