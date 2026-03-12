// hooks/useLessonNote.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface StudentNote {
    id: string;
    student_id: string;
    lesson_id: string;
    module_id: string;
    track_id: string;  // 🆕 v20.0 - Era course_id
    content: string;
    created_at: string;
    updated_at: string;
}

interface UseLessonNoteParams {
    studentId: string;
    lessonId: string;
    moduleId: string;
    trackId: string;  // 🆕 v20.0 - Era courseId
}

interface UseLessonNoteReturn {
    note: StudentNote | null;
    isLoading: boolean;
    isSaving: boolean;
    lastSavedAt: Date | null;
    saveNote: (content: string) => Promise<void>;
    deleteNote: () => Promise<void>;
}

export function useLessonNote({
                                  studentId,
                                  lessonId,
                                  moduleId,
                                  trackId,  // 🆕 v20.0
                              }: UseLessonNoteParams): UseLessonNoteReturn {
    const [note, setNote] = useState<StudentNote | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Buscar nota existente
    const fetchNote = useCallback(async (): Promise<void> => {
        if (!studentId || !lessonId) {
            setNote(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            const { data, error } = await supabase
                .from('student_notes')
                .select('*')
                .eq('student_id', studentId)
                .eq('lesson_id', lessonId)
                .maybeSingle();

            if (error) throw error;

            setNote(data as StudentNote | null);
            if (data?.updated_at) {
                setLastSavedAt(new Date(data.updated_at));
            }
        } catch (err) {
            console.error('[useLessonNote] Erro ao buscar nota:', err);
        } finally {
            setIsLoading(false);
        }
    }, [studentId, lessonId, supabase]);

    // Salvar nota com debounce
    const saveNote = useCallback(async (content: string): Promise<void> => {
        if (!studentId || !lessonId || !moduleId || !trackId) return;

        // Cancelar save anterior
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Debounce de 1 segundo
        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);

            try {
                // 🆕 v20.0 - Usa track_id em vez de course_id
                const noteData = {
                    student_id: studentId,
                    lesson_id: lessonId,
                    module_id: moduleId,
                    track_id: trackId,
                    content: content,
                    updated_at: new Date().toISOString(),
                };

                const { data, error } = await supabase
                    .from('student_notes')
                    .upsert(noteData, {
                        onConflict: 'student_id,lesson_id',
                    })
                    .select()
                    .single();

                if (error) throw error;

                setNote(data as StudentNote);
                setLastSavedAt(new Date());
            } catch (err) {
                console.error('[useLessonNote] Erro ao salvar nota:', err);
                showErrorToast('Erro ao salvar', 'Sua anotação pode não ter sido salva');
            } finally {
                setIsSaving(false);
            }
        }, 1000);
    }, [studentId, lessonId, moduleId, trackId, supabase]);

    // Deletar nota
    const deleteNote = useCallback(async (): Promise<void> => {
        if (!note?.id) return;

        try {
            const { error } = await supabase
                .from('student_notes')
                .delete()
                .eq('id', note.id);

            if (error) throw error;

            setNote(null);
            setLastSavedAt(null);
            showSuccessToast('Anotação excluída');
        } catch (err) {
            console.error('[useLessonNote] Erro ao excluir nota:', err);
            showErrorToast('Erro ao excluir', 'Tente novamente');
        }
    }, [note?.id, supabase]);

    useEffect(() => {
        fetchNote();
    }, [fetchNote]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return {
        note,
        isLoading,
        isSaving,
        lastSavedAt,
        saveNote,
        deleteNote,
    };
}