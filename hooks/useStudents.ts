// hooks/useStudents.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/toast';
import type { User, UserFormData } from '@/lib/types/database';

export type Student = User;
export type StudentFormData = UserFormData;

function generateInviteToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export function useStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

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
            const message = 'Erro ao carregar alunos. Tente novamente.';
            setError(message);
            showErrorToast('Erro ao carregar alunos', 'Verifique sua conexão e tente novamente');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    const createStudent = useCallback(async (
        data: StudentFormData
    ): Promise<{ success: boolean; error?: string; inviteLink?: string }> => {
        try {
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', data.email.toLowerCase().trim())
                .maybeSingle();

            if (existing) {
                showWarningToast('E-mail já cadastrado', 'Este aluno já existe no sistema');
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
                showErrorToast('Erro ao cadastrar aluno', insertError.message);
                return { success: false, error: 'Erro ao cadastrar aluno' };
            }

            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const inviteLink = `${baseUrl}/convite/${inviteToken}`;

            await fetchStudents();

            showSuccessToast('Aluno cadastrado!', `Convite gerado para ${data.name}`);
            return { success: true, inviteLink };
        } catch (err) {
            console.error('[useStudents] Erro ao criar aluno:', err);
            showErrorToast('Erro inesperado', 'Não foi possível cadastrar o aluno');
            return { success: false, error: 'Erro inesperado ao criar aluno' };
        }
    }, [supabase, fetchStudents]);

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

            showSuccessToast('Convite reenviado!', 'Um novo link de convite foi gerado');
            return { success: true, inviteLink };
        } catch (err) {
            console.error('[useStudents] Erro ao reenviar convite:', err);
            showErrorToast('Erro ao reenviar convite', 'Tente novamente em instantes');
            return { success: false, error: 'Erro ao reenviar convite' };
        }
    }, [supabase, fetchStudents]);

    const updateStudentEmail = useCallback(async (
        userId: string,
        newEmail: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                showErrorToast('Sessão expirada', 'Faça login novamente para continuar');
                return { success: false, error: 'Sessão expirada. Faça login novamente.' };
            }

            const response = await fetch('/api/admin/update-user-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ userId, newEmail }),
            });

            const result = await response.json();

            if (!response.ok) {
                showErrorToast('Erro ao atualizar e-mail', result.error || 'Tente novamente');
                return { success: false, error: result.error || 'Erro ao atualizar email' };
            }

            return { success: true };
        } catch (err) {
            console.error('[useStudents] Erro ao atualizar email:', err);
            showErrorToast('Erro de conexão', 'Não foi possível atualizar o e-mail');
            return { success: false, error: 'Erro de conexão ao atualizar email' };
        }
    }, [supabase]);

    const updateStudent = useCallback(async (
        id: string,
        data: Partial<StudentFormData>,
        currentEmail?: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            if (data.email && currentEmail && data.email.toLowerCase().trim() !== currentEmail.toLowerCase().trim()) {
                const emailResult = await updateStudentEmail(id, data.email);
                if (!emailResult.success) {
                    return emailResult;
                }
            }

            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (data.name) updateData.name = data.name.trim();
            if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;

            if (Object.keys(updateData).length > 1) {
                const { error: updateError } = await supabase
                    .from('users')
                    .update(updateData)
                    .eq('id', id);

                if (updateError) throw updateError;
            }

            await fetchStudents();

            showSuccessToast('Aluno atualizado!', `Dados de ${data.name || 'aluno'} salvos`);
            return { success: true };
        } catch (err) {
            console.error('[useStudents] Erro ao atualizar aluno:', err);
            showErrorToast('Erro ao atualizar', 'Não foi possível salvar as alterações');
            return { success: false, error: 'Erro ao atualizar aluno' };
        }
    }, [supabase, fetchStudents, updateStudentEmail]);

    const suspendStudent = useCallback(async (
        id: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    status: 'suspended',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchStudents();

            showWarningToast('Aluno suspenso', 'O acesso do aluno foi desativado');
            return { success: true };
        } catch (err) {
            console.error('[useStudents] Erro ao suspender aluno:', err);
            showErrorToast('Erro ao suspender', 'Não foi possível suspender o aluno');
            return { success: false, error: 'Erro ao suspender aluno' };
        }
    }, [supabase, fetchStudents]);

    const reactivateStudent = useCallback(async (
        id: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    status: 'active',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchStudents();

            showSuccessToast('Aluno reativado!', 'O acesso foi restaurado com sucesso');
            return { success: true };
        } catch (err) {
            console.error('[useStudents] Erro ao reativar aluno:', err);
            showErrorToast('Erro ao reativar', 'Não foi possível reativar o aluno');
            return { success: false, error: 'Erro ao reativar aluno' };
        }
    }, [supabase, fetchStudents]);

    const deleteStudent = useCallback(async (
        id: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await supabase.from('lesson_progress').delete().eq('student_id', id);
            await supabase.from('enrollments').delete().eq('student_id', id);
            await supabase.from('payments').delete().eq('student_id', id);
            await supabase.from('task_submissions').delete().eq('student_id', id);

            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await fetchStudents();

            showSuccessToast('Aluno excluído', 'Todos os dados foram removidos permanentemente');
            return { success: true };
        } catch (err) {
            console.error('[useStudents] Erro ao excluir aluno:', err);
            showErrorToast('Erro ao excluir', 'Não foi possível remover o aluno');
            return { success: false, error: 'Erro ao excluir aluno' };
        }
    }, [supabase, fetchStudents]);

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
        suspendStudent,
        reactivateStudent,
        resendInvite,
    };
}