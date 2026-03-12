// hooks/useEnrollments.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED';

export interface Enrollment {
    id: string;
    student_id: string;
    track_id: string | null;  // 🆕 Novo campo
    course_id: string | null; // ⚠️ Legado - manter temporariamente
    enrollment_date: string;
    status: EnrollmentStatus;
    grade: number | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface EnrollmentWithTrack extends Enrollment {
    track: {
        id: string;
        name: string;
        is_active: boolean;
    } | null;
}

export interface EnrollmentWithStudent extends Enrollment {
    student: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export function useEnrollments(studentId?: string, trackId?: string) {
    const [enrollments, setEnrollments] = useState<(EnrollmentWithTrack | EnrollmentWithStudent)[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchEnrollments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query;

            if (studentId) {
                // Buscar trilhas de um aluno específico
                // Suporta tanto track_id (novo) quanto course_id (legado)
                query = supabase
                    .from('enrollments')
                    .select(`
                        *,
                        track:tracks(id, name, is_active)
                    `)
                    .eq('student_id', studentId)
                    .order('enrollment_date', { ascending: false });
            } else if (trackId) {
                // Buscar alunos de uma trilha específica
                query = supabase
                    .from('enrollments')
                    .select(`
                        *,
                        student:users(id, name, email)
                    `)
                    .eq('track_id', trackId)
                    .order('enrollment_date', { ascending: false });
            } else {
                // Buscar todas as matrículas
                query = supabase
                    .from('enrollments')
                    .select(`
                        *,
                        track:tracks(id, name, is_active),
                        student:users(id, name, email)
                    `)
                    .order('enrollment_date', { ascending: false });
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setEnrollments(data || []);
        } catch (err) {
            console.error('Erro ao buscar matrículas:', err);
            setError('Erro ao carregar matrículas');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, studentId, trackId]);

    // Matricular aluno em trilha
    const enrollStudent = async (studentId: string, trackId: string): Promise<boolean> => {
        try {
            console.log('🔍 Tentando matricular:', { studentId, trackId }); // DEBUG

            // Verificar se já existe matrícula
            const { data: existing, error: checkError } = await supabase
                .from('enrollments')
                .select('id')
                .eq('student_id', studentId)
                .eq('track_id', trackId)
                .maybeSingle(); // 🔧 Mudança: usar maybeSingle() em vez de single()

            console.log('🔍 Check existente:', { existing, checkError }); // DEBUG

            if (existing) {
                setError('Aluno já está matriculado nesta trilha');
                return false;
            }

            const insertData = {
                student_id: studentId,
                track_id: trackId,
                enrollment_date: new Date().toISOString().split('T')[0],
                status: 'ACTIVE',
            };

            console.log('🔍 Dados para inserir:', insertData); // DEBUG

            const { data: inserted, error: insertError } = await supabase
                .from('enrollments')
                .insert(insertData)
                .select()
                .single();

            console.log('🔍 Resultado insert:', { inserted, insertError }); // DEBUG

            if (insertError) throw insertError;

            await fetchEnrollments();
            return true;
        } catch (err) {
            console.error('❌ Erro completo ao matricular:', err); // DEBUG
            setError('Erro ao matricular aluno');
            return false;
        }
    };

    // Cancelar matrícula
    const unenrollStudent = async (enrollmentId: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('enrollments')
                .delete()
                .eq('id', enrollmentId);

            if (deleteError) throw deleteError;

            await fetchEnrollments();
            return true;
        } catch (err) {
            console.error('Erro ao cancelar matrícula:', err);
            setError('Erro ao cancelar matrícula');
            return false;
        }
    };

    // Atualizar status da matrícula
    const updateEnrollmentStatus = async (enrollmentId: string, status: EnrollmentStatus): Promise<boolean> => {
        try {
            const updateData: { status: EnrollmentStatus; completed_at?: string | null } = { status };

            if (status === 'COMPLETED') {
                updateData.completed_at = new Date().toISOString();
            } else {
                updateData.completed_at = null;
            }

            const { error: updateError } = await supabase
                .from('enrollments')
                .update(updateData)
                .eq('id', enrollmentId);

            if (updateError) throw updateError;

            await fetchEnrollments();
            return true;
        } catch (err) {
            console.error('Erro ao atualizar matrícula:', err);
            setError('Erro ao atualizar matrícula');
            return false;
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    return {
        enrollments,
        isLoading,
        error,
        enrollStudent,
        unenrollStudent,
        updateEnrollmentStatus,
        refetch: fetchEnrollments,
    };
}