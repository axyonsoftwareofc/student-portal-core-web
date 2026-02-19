// components/student/notes/NotesPageHeader.tsx
'use client';

import { StickyNote, FileText } from 'lucide-react';
import { StudentNoteWithDetails } from '@/lib/types/notes';

interface NotesStats {
    totalNotes: number;
    totalCourses: number;
}

interface NotesPageHeaderProps {
    notes: StudentNoteWithDetails[];
}

export function NotesPageHeader({ notes }: NotesPageHeaderProps) {
    const stats: NotesStats = {
        totalNotes: notes.length,
        totalCourses: new Set(notes.map((note: StudentNoteWithDetails) => note.course_id)).size,
    };

    const statCards = [
        {
            label: 'Total de Notas',
            value: stats.totalNotes,
            icon: StickyNote,
            colorClass: 'text-amber-400 bg-amber-500/10',
        },
        {
            label: 'Cursos',
            value: stats.totalCourses,
            icon: FileText,
            colorClass: 'text-sky-400 bg-sky-500/10',
        },
    ] as const;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Minhas Anotações</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Todas as suas anotações de aula em um só lugar
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.colorClass}`}>
                                <stat.icon className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}