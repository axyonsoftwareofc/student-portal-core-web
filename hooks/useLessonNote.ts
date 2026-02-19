// hooks/useLessonNote.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentNote, UseLessonNoteReturn } from '@/lib/types/notes';

const AUTO_SAVE_DELAY_MS = 1500;

interface UseLessonNoteParams {
    studentId: string;
    lessonId: string;
    moduleId: string;
    courseId: string;
}

export function useLessonNote({
                                  studentId,
                                  lessonId,
                                  moduleId,
                                  courseId,
                              }: UseLessonNoteParams): UseLessonNoteReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [note, setNote] = useState<StudentNote | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

    useEffect(() => {
        const fetchExistingNote = async (): Promise<void> => {
            if (!studentId || !lessonId) return;

            try {
                setIsLoading(true);

                const { data, error: fetchError } = await supabase
                    .from('student_notes')
                    .select('*')
                    .eq('student_id', studentId)
                    .eq('lesson_id', lessonId)
                    .maybeSingle();

                if (fetchError) {
                    console.error('useLessonNote - fetch error:', fetchError);
                    return;
                }

                if (data) {
                    const existingNote = data as StudentNote;
                    setNote(existingNote);
                    setLastSavedAt(existingNote.updated_at);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchExistingNote();
    }, [supabase, studentId, lessonId]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const persistNote = useCallback(
        async (content: string): Promise<void> => {
            try {
                setIsSaving(true);

                const { data, error: upsertError } = await supabase
                    .from('student_notes')
                    .upsert(
                        {
                            student_id: studentId,
                            lesson_id: lessonId,
                            module_id: moduleId,
                            course_id: courseId,
                            content,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'student_id,lesson_id' }
                    )
                    .select()
                    .single();

                if (upsertError) {
                    throw new Error(upsertError.message);
                }

                if (data) {
                    const savedNote = data as StudentNote;
                    setNote(savedNote);
                    setLastSavedAt(savedNote.updated_at);
                }
            } catch (err) {
                console.error('useLessonNote - save error:', err);
            } finally {
                setIsSaving(false);
            }
        },
        [supabase, studentId, lessonId, moduleId, courseId]
    );

    const saveNote = useCallback(
        async (content: string): Promise<void> => {
            setNote((previousNote: StudentNote | null) => {
                if (previousNote) {
                    return { ...previousNote, content };
                }
                return {
                    id: '',
                    student_id: studentId,
                    lesson_id: lessonId,
                    module_id: moduleId,
                    course_id: courseId,
                    content,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
            });

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                persistNote(content);
            }, AUTO_SAVE_DELAY_MS);
        },
        [studentId, lessonId, moduleId, courseId, persistNote]
    );

    const deleteNote = useCallback(async (): Promise<void> => {
        if (!note?.id) return;

        try {
            const { error: deleteError } = await supabase
                .from('student_notes')
                .delete()
                .eq('id', note.id);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            setNote(null);
            setLastSavedAt(null);
        } catch (err) {
            console.error('useLessonNote - delete error:', err);
            throw err;
        }
    }, [supabase, note]);

    return {
        note,
        isLoading,
        isSaving,
        lastSavedAt,
        saveNote,
        deleteNote,
    };
}