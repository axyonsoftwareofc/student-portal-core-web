// components/student/notes/NotesFilters.tsx
'use client';

import { Search, ChevronDown } from 'lucide-react';
import { StudentNoteWithDetails } from '@/lib/types/notes';
import { cn } from '@/lib/utils';

interface CourseOption {
    id: string;
    title: string;
}

interface NotesFiltersProps {
    notes: StudentNoteWithDetails[];
    selectedCourseId: string;
    searchQuery: string;
    onCourseChange: (courseId: string) => void;
    onSearchChange: (query: string) => void;
}

export function NotesFilters({
                                 notes,
                                 selectedCourseId,
                                 searchQuery,
                                 onCourseChange,
                                 onSearchChange,
                             }: NotesFiltersProps) {
    const courseOptions: CourseOption[] = Array.from(
        new Map(
            notes.map((note: StudentNoteWithDetails) => [
                note.course_id,
                { id: note.course_id, title: note.course_title || 'Curso' },
            ])
        ).values()
    );

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                <input
                    type="text"
                    placeholder="Buscar nas anotações..."
                    value={searchQuery}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-200"
                />
            </div>

            {courseOptions.length > 1 && (
                <div className="relative">
                    <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-gray-500 pointer-events-none" strokeWidth={1.5} />
                    <select
                        value={selectedCourseId}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onCourseChange(event.target.value)}
                        className={cn(
                            'w-full sm:w-48 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-sm text-white',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50',
                            'transition-all duration-200 appearance-none',
                            !selectedCourseId && 'text-gray-500'
                        )}
                    >
                        <option value="" className="text-gray-500">Todos os cursos</option>
                        {courseOptions.map((course: CourseOption) => (
                            <option key={course.id} value={course.id} className="text-white bg-gray-800">
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}