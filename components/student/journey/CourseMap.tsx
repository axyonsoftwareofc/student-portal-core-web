// components/student/journey/CourseMap.tsx
'use client';

import Link from 'next/link';
import { CheckCircle, Lock, PlayCircle, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudentModule } from '@/lib/types/database';

interface CourseMapProps {
    modules: StudentModule[];
    courseName: string;
}

export function CourseMap({ modules, courseName }: CourseMapProps) {
    const completedModules = modules.filter(m => m.progress_percentage === 100).length;
    const overallProgress = modules.length > 0
        ? Math.round(modules.reduce((acc, m) => acc + (m.progress_percentage || 0), 0) / modules.length)
        : 0;

    return (
        <div className="space-y-4">
            {/* Course Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <Layers className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{courseName}</h3>
                        <p className="text-xs text-gray-500">
                            {completedModules}/{modules.length} módulos • {overallProgress}% concluído
                        </p>
                    </div>
                </div>
                <Link
                    href="/aluno/estudar"
                    className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                    Ver detalhes
                    <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
            </div>

            {/* Progress Bar */}
            <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all duration-500',
                        overallProgress === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                    )}
                    style={{ width: `${overallProgress}%` }}
                />
            </div>

            {/* Module Timeline */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-800" />

                <div className="space-y-3">
                    {modules.map((module, index) => {
                        const isCompleted = module.progress_percentage === 100;
                        const isInProgress = (module.progress_percentage || 0) > 0 && !isCompleted;
                        const isLocked = index > 0 && modules[index - 1].progress_percentage !== 100 && !isInProgress;

                        return (
                            <Link
                                key={module.id}
                                href={isLocked ? '#' : `/aluno/estudar/${module.id}`}
                                className={cn(
                                    'relative flex items-center gap-4 p-4 rounded-lg border transition-all ml-2',
                                    isCompleted && 'border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/30',
                                    isInProgress && 'border-sky-500/30 bg-sky-950/20 hover:bg-sky-950/30',
                                    isLocked && 'border-gray-800/50 bg-gray-900/30 opacity-50 cursor-not-allowed',
                                    !isCompleted && !isInProgress && !isLocked && 'border-gray-800/50 bg-gray-900/30 hover:bg-gray-900/50'
                                )}
                            >
                                {/* Node */}
                                <div className={cn(
                                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0',
                                    isCompleted && 'bg-emerald-500 text-white',
                                    isInProgress && 'bg-sky-500 text-white',
                                    isLocked && 'bg-gray-800 text-gray-600',
                                    !isCompleted && !isInProgress && !isLocked && 'bg-gray-800 text-gray-400'
                                )}>
                                    {isCompleted ? (
                                        <CheckCircle className="h-5 w-5" strokeWidth={1.5} />
                                    ) : isLocked ? (
                                        <Lock className="h-4 w-4" strokeWidth={1.5} />
                                    ) : isInProgress ? (
                                        <PlayCircle className="h-5 w-5" strokeWidth={1.5} />
                                    ) : (
                                        <span className="text-sm font-semibold">{index + 1}</span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className={cn(
                                            'font-medium truncate',
                                            isCompleted ? 'text-emerald-300' : isInProgress ? 'text-sky-300' : 'text-gray-300'
                                        )}>
                                            {module.name}
                                        </h4>
                                        {isInProgress && (
                                            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-[10px] font-medium flex-shrink-0">
                        Em progresso
                      </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {module.completed_lessons || 0}/{module.lessons_count || 0} aulas • {module.progress_percentage || 0}%
                                    </p>
                                </div>

                                {/* Progress Mini */}
                                {!isLocked && (
                                    <div className="w-20 flex-shrink-0">
                                        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                                            <div
                                                className={cn(
                                                    'h-full transition-all',
                                                    isCompleted ? 'bg-emerald-500' : 'bg-sky-500'
                                                )}
                                                style={{ width: `${module.progress_percentage || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}