// components/admin/reports/ReportsTopStudents.tsx
'use client';

import { Trophy, Users } from 'lucide-react';
import type { TopStudent } from '@/hooks/useReports';

interface ReportsTopStudentsProps {
    topStudents: TopStudent[];
}

const RANK_COLORS = [
    'text-amber-400',
    'text-gray-300',
    'text-amber-600',
    'text-gray-500',
    'text-gray-500',
] as const;

const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

export function ReportsTopStudents({ topStudents }: ReportsTopStudentsProps) {
    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
            <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-white">Top 5 Alunos</h3>
            </div>

            {topStudents.length > 0 ? (
                <div className="space-y-3">
                    {topStudents.map((student: TopStudent, index: number) => (
                        <div
                            key={student.id}
                            className="flex items-center justify-between rounded-lg border border-gray-800/50 bg-gray-800/30 p-4"
                        >
                            <div className="flex items-center gap-4">
                <span className={`text-2xl font-bold ${RANK_COLORS[index] || 'text-gray-500'}`}>
                  #{index + 1}
                </span>
                                <div>
                                    <p className="font-medium text-white">{student.name}</p>
                                    <p className="text-sm text-gray-500">{student.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-right">
                                <div>
                                    <p className="text-lg font-bold text-sky-400">
                                        {student.lessonsCompleted} <span className="text-xs font-normal text-gray-500">aulas</span>
                                    </p>
                                </div>

                                {student.exercisesSubmitted > 0 && (
                                    <div className="hidden sm:block">
                                        <p className="text-lg font-bold text-violet-400">
                                            {student.exerciseAverage !== null ? student.exerciseAverage.toFixed(1) : '—'}
                                            <span className="text-xs font-normal text-gray-500"> média</span>
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {student.exercisesSubmitted} exercícios
                                        </p>
                                    </div>
                                )}

                                <div className="hidden md:block">
                                    <p className="text-xs text-gray-500">
                                        {student.quizAverage > 0
                                            ? `Quiz: ${student.quizAverage}%`
                                            : `Último: ${formatDate(student.lastActivity)}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-gray-600" strokeWidth={1.5} />
                    <p className="mt-2 text-gray-400">Nenhum progresso registrado ainda</p>
                </div>
            )}
        </div>
    );
}