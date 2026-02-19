// components/student/notes/NoteCard.tsx
'use client';

import { useState } from 'react';
import { BookOpen, Layers, GraduationCap, Calendar, Trash2 } from 'lucide-react';
import { StudentNoteWithDetails } from '@/lib/types/notes';

interface NoteCardProps {
    note: StudentNoteWithDetails;
    onDelete: (noteId: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

    const formattedDate = new Date(note.updated_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const contentPreview = note.content.length > 200
        ? `${note.content.substring(0, 200)}...`
        : note.content;

    return (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600/50 transition-all duration-200">
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                            <span className="text-white font-medium truncate">{note.lesson_title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Layers className="h-3 w-3" strokeWidth={1.5} />
                                <span className="truncate">{note.module_title}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <GraduationCap className="h-3 w-3" strokeWidth={1.5} />
                                <span className="truncate">{note.course_title}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        {showDeleteConfirmation ? (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => {
                                        onDelete(note.id);
                                        setShowDeleteConfirmation(false);
                                    }}
                                    className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                                >
                                    Excluir
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirmation(false)}
                                    className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                                >
                                    Não
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="p-1.5 rounded-lg text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                                title="Excluir anotação"
                            >
                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {contentPreview}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" strokeWidth={1.5} />
                    <span>{formattedDate}</span>
                </div>
            </div>
        </div>
    );
}