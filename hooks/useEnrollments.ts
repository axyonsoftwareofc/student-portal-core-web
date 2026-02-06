// hooks/useEnrollments.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED';

export interface Enrollment {
    id: string;
    student_id: string;
    course_id: string;
    enrollment_date: string;
    status: EnrollmentStatus;
    grade: number | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface EnrollmentWithCourse extends Enrollment {
    course: {
        id: string;
        name: string;
        status: string;
    } | null;
}

export interface EnrollmentWithStudent extends Enrollment {
    student: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export function useEnrollments(studentId?: string, courseId?: string) {
    const [enrollments, setEnrollments] = useState<(EnrollmentWithCourse | EnrollmentWithStudent)[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    // Buscar matrículas
    const fetchEnrollments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query;

            if (studentId) {
                // Buscar cursos de um aluno específico
                query = supabase
                    .from('enrollments')
                    .select(`
            *,
            course:courses(id, name, status)
          `)
                    .eq('student_id', studentId)
                    .order('enrollment_date', { ascending: false });
            } else if (courseId) {
                // Buscar alunos de um curso específico
                query = supabase
                    .from('enrollments')
                    .select(`
            *,
            student:users(id, name, email)
          `)
                    .eq('course_id', courseId)
                    .order('enrollment_date', { ascending: false });
            } else {
                // Buscar todas as matrículas
                query = supabase
                    .from('enrollments')
                    .select(`
            *,
            course:courses(id, name, status),
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
    }, [supabase, studentId, courseId]);

    // Matricular aluno em curso
    const enrollStudent = async (studentId: string, courseId: string): Promise<boolean> => {
        try {
            // Verificar se já existe matrícula
            const { data: existing } = await supabase
                .from('enrollments')
                .select('id')
                .eq('student_id', studentId)
                .eq('course_id', courseId)
                .single();

            if (existing) {
                setError('Aluno já está matriculado neste curso');
                return false;
            }

            const { error: insertError } = await supabase
                .from('enrollments')
                .insert({
                    student_id: studentId,
                    course_id: courseId,
                    enrollment_date: new Date().toISOString().split('T')[0],
                    status: 'ACTIVE',
                });

            if (insertError) throw insertError;

            await fetchEnrollments();
            return true;
        } catch (err) {
            console.error('Erro ao matricular aluno:', err);
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