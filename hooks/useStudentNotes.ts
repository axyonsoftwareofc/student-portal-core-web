// hooks/useStudentNotes.ts
'use client';

import { useCallback, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import {
    StudentNote,
    StudentNoteWithDetails,
    UpsertNoteDTO,
    UseStudentNotesReturn,
} from '@/lib/types/notes';

export function useStudentNotes(): UseStudentNotesReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [notes, setNotes] = useState<StudentNoteWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotesByStudent = useCallback(
        async (studentId: string): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);

                const { data: notesData, error: fetchError } = await supabase
                    .from('student_notes')
                    .select('*')
                    .eq('student_id', studentId)
                    .order('updated_at', { ascending: false });

                if (fetchError) {
                    throw new Error(fetchError.message);
                }

                const typedNotes = (notesData || []) as StudentNote[];

                const lessonIds = typedNotes.map((note: StudentNote) => note.lesson_id);
                const moduleIds = Array.from(new Set(typedNotes.map((note: StudentNote) => note.module_id)));
                const courseIds = Array.from(new Set(typedNotes.map((note: StudentNote) => note.course_id)));

                const [lessonsResult, modulesResult, coursesResult] = await Promise.all([
                    supabase.from('lessons').select('id, title').in('id', lessonIds),
                    supabase.from('modules').select('id, title').in('id', moduleIds),
                    supabase.from('courses').select('id, title').in('id', courseIds),
                ]);

                const lessonsMap = new Map(
                    ((lessonsResult.data || []) as { id: string; title: string }[]).map(
                        (lesson: { id: string; title: string }) => [lesson.id, lesson.title]
                    )
                );

                const modulesMap = new Map(
                    ((modulesResult.data || []) as { id: string; title: string }[]).map(
                        (module: { id: string; title: string }) => [module.id, module.title]
                    )
                );

                const coursesMap = new Map(
                    ((coursesResult.data || []) as { id: string; title: string }[]).map(
                        (course: { id: string; title: string }) => [course.id, course.title]
                    )
                );

                const notesWithDetails: StudentNoteWithDetails[] = typedNotes.map(
                    (note: StudentNote) => ({
                        ...note,
                        lesson_title: lessonsMap.get(note.lesson_id) || 'Aula não encontrada',
                        module_title: modulesMap.get(note.module_id) || 'Módulo não encontrado',
                        course_title: coursesMap.get(note.course_id) || 'Curso não encontrado',
                    })
                );

                setNotes(notesWithDetails);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar anotações';
                setError(errorMessage);
                showErrorToast('Erro ao carregar anotações', 'Verifique sua conexão');
                console.error('useStudentNotes - fetchNotesByStudent error:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [supabase]
    );

    const fetchNoteByLesson = useCallback(
        async (studentId: string, lessonId: string): Promise<StudentNote | null> => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('student_notes')
                    .select('*')
                    .eq('student_id', studentId)
                    .eq('lesson_id', lessonId)
                    .maybeSingle();

                if (fetchError) {
                    throw new Error(fetchError.message);
                }

                return (data as StudentNote) || null;
            } catch (err) {
                console.error('useStudentNotes - fetchNoteByLesson error:', err);
                return null;
            }
        },
        [supabase]
    );

    const upsertNote = useCallback(
        async (noteData: UpsertNoteDTO): Promise<StudentNote> => {
            try {
                const { data, error: upsertError } = await supabase
                    .from('student_notes')
                    .upsert(
                        {
                            ...noteData,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'student_id,lesson_id' }
                    )
                    .select()
                    .single();

                if (upsertError) {
                    throw new Error(upsertError.message);
                }

                if (!data) {
                    throw new Error('Erro ao salvar anotação');
                }

                const savedNote = data as StudentNote;

                setNotes((previousNotes: StudentNoteWithDetails[]) => {
                    const existingIndex = previousNotes.findIndex(
                        (note: StudentNoteWithDetails) =>
                            note.student_id === savedNote.student_id && note.lesson_id === savedNote.lesson_id
                    );

                    if (existingIndex >= 0) {
                        const updatedNotes = [...previousNotes];
                        updatedNotes[existingIndex] = {
                            ...updatedNotes[existingIndex],
                            ...savedNote,
                        };
                        return updatedNotes;
                    }

                    return [savedNote as StudentNoteWithDetails, ...previousNotes];
                });

                return savedNote;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar anotação';
                setError(errorMessage);
                showErrorToast('Erro ao salvar anotação', errorMessage);
                throw err;
            }
        },
        [supabase]
    );

    const deleteNote = useCallback(
        async (noteId: string): Promise<void> => {
            try {
                const { error: deleteError } = await supabase
                    .from('student_notes')
                    .delete()
                    .eq('id', noteId);

                if (deleteError) {
                    throw new Error(deleteError.message);
                }

                setNotes((previousNotes: StudentNoteWithDetails[]) =>
                    previousNotes.filter((note: StudentNoteWithDetails) => note.id !== noteId)
                );

                showSuccessToast('Anotação excluída', 'Registro removido com sucesso');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir anotação';
                setError(errorMessage);
                showErrorToast('Erro ao excluir anotação', errorMessage);
                throw err;
            }
        },
        [supabase]
    );

    return {
        notes,
        isLoading,
        error,
        fetchNotesByStudent,
        fetchNoteByLesson,
        upsertNote,
        deleteNote,
    };
}