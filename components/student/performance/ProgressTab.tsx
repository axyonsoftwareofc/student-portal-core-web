// components/student/performance/ProgressTab.tsx
'use client';

import { BookOpen, CheckCircle, Layers } from 'lucide-react';

interface CourseProgress {
    id: string;
    name: string;
    modules_count?: number;
    lessons_count?: number;
    completed_lessons?: number;
    progress_percentage?: number;
}

interface ProgressTabProps {
    courses: CourseProgress[];
    isLoading: boolean;
}

export function ProgressTab({ courses, isLoading }: ProgressTabProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="h-24 rounded-lg bg-gray-800/30 animate-pulse" />
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-gray-400">Nenhum curso matriculado</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {courses.map((course) => {
                const modulesCount = course.modules_count ?? 0;
                const lessonsCount = course.lessons_count ?? 0;
                const completedLessons = course.completed_lessons ?? 0;
                const progressPercentage = course.progress_percentage ?? 0;
                const isComplete = progressPercentage === 100;

                return (
                    <div
                        key={course.id}
                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                    isComplete ? 'bg-emerald-500/10' : 'bg-sky-500/10'
                                }`}>
                                    <BookOpen className={`h-5 w-5 ${
                                        isComplete ? 'text-emerald-400' : 'text-sky-400'
                                    }`} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">{course.name}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Layers className="h-3 w-3" strokeWidth={1.5} />
                                            {modulesCount} módulos
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                                            {completedLessons}/{lessonsCount} aulas
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <span className={`text-lg font-bold ${
                                isComplete ? 'text-emerald-400' : 'text-sky-400'
                            }`}>
                                {progressPercentage}%
                            </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-800">
                            <div
                                className={`h-full transition-all duration-500 ${
                                    isComplete ? 'bg-emerald-500' : 'bg-sky-500'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>

                        {isComplete && (
                            <div className="mt-3 flex items-center gap-2 text-emerald-400">
                                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                <span className="text-sm font-medium">Curso concluído! 🎉</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}