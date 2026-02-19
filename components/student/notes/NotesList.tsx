// components/student/notes/NotesList.tsx
'use client';

import { StickyNote } from 'lucide-react';
import { StudentNoteWithDetails } from '@/lib/types/notes';
import { NoteCard } from './NoteCard';

interface NotesListProps {
    notes: StudentNoteWithDetails[];
    isLoading: boolean;
    onDelete: (noteId: string) => void;
}

export function NotesList({ notes, isLoading, onDelete }: NotesListProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index: number) => (
                    <div
                        key={index}
                        className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 animate-pulse"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-gray-700/50 rounded" />
                                <div className="h-4 w-40 bg-gray-700/50 rounded" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-700/50 rounded" />
                                <div className="h-3 w-3/4 bg-gray-700/50 rounded" />
                            </div>
                            <div className="h-3 w-24 bg-gray-700/50 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto">
                    <StickyNote className="h-8 w-8 text-gray-600" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                    <p className="text-gray-400 font-medium">Nenhuma anotação encontrada</p>
                    <p className="text-gray-500 text-sm">
                        Suas anotações aparecerão aqui quando você escrever durante as aulas.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {notes.map((note: StudentNoteWithDetails) => (
                <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}