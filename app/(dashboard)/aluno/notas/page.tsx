// app/(dashboard)/aluno/notas/page.tsx
'use client';

import { useEffect, useMemo, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentNotes } from '@/hooks/useStudentNotes';
import { StudentNoteWithDetails } from '@/lib/types/notes';
import { NotesPageHeader } from '@/components/student/notes/NotesPageHeader';
import { NotesFilters } from '@/components/student/notes/NotesFilters';
import { NotesList } from '@/components/student/notes/NotesList';

export default function NotesPage() {
    const { user } = useAuth();
    const { notes, isLoading, fetchNotesByStudent, deleteNote } = useStudentNotes();

    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        if (user?.id) {
            fetchNotesByStudent(user.id);
        }
    }, [user?.id, fetchNotesByStudent]);

    const filteredNotes = useMemo((): StudentNoteWithDetails[] => {
        return notes
            .filter((note: StudentNoteWithDetails) => {
                if (!selectedCourseId) return true;
                return note.course_id === selectedCourseId;
            })
            .filter((note: StudentNoteWithDetails) => {
                if (!searchQuery.trim()) return true;
                const normalizedQuery = searchQuery.toLowerCase();
                return (
                    note.content.toLowerCase().includes(normalizedQuery) ||
                    note.lesson_title?.toLowerCase().includes(normalizedQuery) ||
                    note.module_title?.toLowerCase().includes(normalizedQuery)
                );
            });
    }, [notes, selectedCourseId, searchQuery]);

    const handleDeleteNote = useCallback(
        async (noteId: string): Promise<void> => {
            await deleteNote(noteId);
        },
        [deleteNote]
    );

    return (
        <div className="space-y-6">
            <NotesPageHeader notes={notes} />

            <NotesFilters
                notes={notes}
                selectedCourseId={selectedCourseId}
                searchQuery={searchQuery}
                onCourseChange={setSelectedCourseId}
                onSearchChange={setSearchQuery}
            />

            <NotesList
                notes={filteredNotes}
                isLoading={isLoading}
                onDelete={handleDeleteNote}
            />
        </div>
    );
}