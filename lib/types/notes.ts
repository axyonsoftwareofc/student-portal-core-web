// lib/types/notes.ts
export interface StudentNote {
    id: string;
    student_id: string;
    lesson_id: string;
    module_id: string;
    course_id: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface StudentNoteWithDetails extends StudentNote {
    lesson_title?: string;
    module_title?: string;
    course_title?: string;
}

export interface UpsertNoteDTO {
    student_id: string;
    lesson_id: string;
    module_id: string;
    course_id: string;
    content: string;
}

export interface UseStudentNotesReturn {
    notes: StudentNoteWithDetails[];
    isLoading: boolean;
    error: string | null;
    fetchNotesByStudent: (studentId: string) => Promise<void>;
    fetchNoteByLesson: (studentId: string, lessonId: string) => Promise<StudentNote | null>;
    upsertNote: (data: UpsertNoteDTO) => Promise<StudentNote>;
    deleteNote: (noteId: string) => Promise<void>;
}

export interface UseLessonNoteReturn {
    note: StudentNote | null;
    isLoading: boolean;
    isSaving: boolean;
    lastSavedAt: string | null;
    saveNote: (content: string) => Promise<void>;
    deleteNote: () => Promise<void>;
}