// components/student/performance/ExercisesTab.tsx
'use client';

import { useState, useMemo } from 'react';
import { BookOpen, Filter, Search } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';
import type { SubmissionStatus } from '@/lib/types/exercise-submissions';

interface SubmissionWithContent {
    id: string;
    status: SubmissionStatus;
    grade: number | null;
    feedback: string | null;
    reviewed_at: string | null;
    created_at: string;
    content?: {
        id: string;
        title: string;
        lesson_id: string;
        lesson?: {
            id: string;
            title: string;
            module_id: string;
            module?: {
                id: string;
                name: string;
                course?: {
                    id: string;
                    name: string;
                };
            };
        };
    };
}

interface ExercisesTabProps {
    submissions: SubmissionWithContent[];
    isLoading: boolean;
}

type FilterStatus = 'all' | SubmissionStatus;

export function ExercisesTab({ submissions, isLoading }: ExercisesTabProps) {
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterCourse, setFilterCourse] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Extrair cursos únicos
    const courses = useMemo(() => {
        const courseMap = new Map<string, string>();
        submissions.forEach((sub) => {
            const course = sub.content?.lesson?.module?.course;
            if (course) {
                courseMap.set(course.id, course.name);
            }
        });
        return Array.from(courseMap, ([id, name]) => ({ id, name }));
    }, [submissions]);

    // Filtrar submissions
    const filteredSubmissions = useMemo(() => {
        return submissions.filter((sub) => {
            const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
            const courseId = sub.content?.lesson?.module?.course?.id;
            const matchesCourse = filterCourse === 'all' || courseId === filterCourse;
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                sub.content?.title.toLowerCase().includes(searchLower) ||
                sub.content?.lesson?.title.toLowerCase().includes(searchLower);

            return matchesStatus && matchesCourse && matchesSearch;
        });
    }, [submissions, filterStatus, filterCourse, searchQuery]);

    // Agrupar por curso
    const groupedByCourse = useMemo(() => {
        const groups = new Map<string, { courseName: string; submissions: SubmissionWithContent[]; average: number | null }>();

        filteredSubmissions.forEach((sub) => {
            const course = sub.content?.lesson?.module?.course;
            if (!course) return;

            if (!groups.has(course.id)) {
                groups.set(course.id, { courseName: course.name, submissions: [], average: null });
            }
            groups.get(course.id)!.submissions.push(sub);
        });

        // Calcular média por curso
        groups.forEach((group) => {
            const gradesWithValues = group.submissions
                .filter((s) => s.grade !== null)
                .map((s) => s.grade as number);

            if (gradesWithValues.length > 0) {
                group.average = gradesWithValues.reduce((a, b) => a + b, 0) / gradesWithValues.length;
            }
        });

        return Array.from(groups.values());
    }, [filteredSubmissions]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-lg bg-gray-800/30 animate-pulse" />
                ))}
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-gray-400 mb-1">Nenhum exercício enviado ainda</p>
                <p className="text-sm text-gray-500">
                    Complete exercícios nas aulas para ver suas notas aqui
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" strokeWidth={1.5} />
                    <input
                        type="text"
                        placeholder="Buscar exercício..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-800 bg-gray-900/50 text-sm text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/50 text-sm text-white focus:border-sky-500 focus:outline-none"
                    >
                        <option value="all">Todos os cursos</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                        className="px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/50 text-sm text-white focus:border-sky-500 focus:outline-none"
                    >
                        <option value="all">Todos os status</option>
                        <option value="approved">Aprovados</option>
                        <option value="reviewed">Corrigidos</option>
                        <option value="needs_revision">Precisa revisão</option>
                        <option value="pending">Pendentes</option>
                    </select>
                </div>
            </div>

            {/* Lista agrupada por curso */}
            {groupedByCourse.length === 0 ? (
                <div className="text-center py-8 rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <Filter className="h-8 w-8 text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhum exercício encontrado com os filtros selecionados</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedByCourse.map((group) => (
                        <div key={group.courseName} className="rounded-lg border border-gray-800/50 bg-gray-900/20 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800/50">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                                    <h3 className="font-medium text-white">{group.courseName}</h3>
                                </div>
                                {group.average !== null && (
                                    <span className="text-sm text-gray-400">
                                        Média: <span className="font-semibold text-amber-400">{group.average.toFixed(1)}</span>
                                    </span>
                                )}
                            </div>

                            <div className="p-3 space-y-2">
                                {group.submissions.map((submission) => (
                                    <ExerciseCard
                                        key={submission.id}
                                        id={submission.id}
                                        title={submission.content?.title || 'Exercício'}
                                        lessonTitle={submission.content?.lesson?.title || ''}
                                        moduleId={submission.content?.lesson?.module_id || ''}
                                        lessonId={submission.content?.lesson_id || ''}
                                        status={submission.status}
                                        grade={submission.grade}
                                        feedback={submission.feedback}
                                        reviewedAt={submission.reviewed_at}
                                        createdAt={submission.created_at}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}