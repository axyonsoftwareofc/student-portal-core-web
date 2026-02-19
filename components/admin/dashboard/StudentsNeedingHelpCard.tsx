// components/admin/dashboard/StudentsNeedingHelpCard.tsx
'use client';

import Link from 'next/link';
import { AlertTriangle, User, Star } from 'lucide-react';

interface StudentWithDifficulty {
    id: string;
    name: string;
    email: string;
    average: number;
    totalExercises: number;
}

interface StudentsNeedingHelpCardProps {
    students: StudentWithDifficulty[];
}

export function StudentsNeedingHelpCard({ students }: StudentsNeedingHelpCardProps) {
    if (students.length === 0) {
        return (
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 text-center">
                <Star className="h-8 w-8 text-emerald-400 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-emerald-400 font-medium">Excelente!</p>
                <p className="text-gray-500 text-sm mt-1">Todos os alunos com média ≥ 6.0</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-950/20 border-b border-rose-500/20">
                <AlertTriangle className="h-4 w-4 text-rose-400" strokeWidth={1.5} />
                <h3 className="font-medium text-rose-300">Precisam de Atenção</h3>
                <span className="text-xs text-rose-400/70">(média &lt; 6.0)</span>
            </div>

            <div className="divide-y divide-rose-500/10">
                {students.slice(0, 5).map((student) => (
                    <Link
                        key={student.id}
                        href={`/admin/alunos`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-rose-950/20 transition-colors"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/10 flex-shrink-0">
                            <User className="h-4 w-4 text-rose-400" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {student.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {student.totalExercises} exercício{student.totalExercises !== 1 ? 's' : ''} corrigido{student.totalExercises !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="h-3.5 w-3.5 text-rose-400" strokeWidth={1.5} />
                            <span className="text-sm font-bold text-rose-400">
                                {student.average.toFixed(1)}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {students.length > 5 && (
                <div className="px-4 py-2 bg-rose-950/10 border-t border-rose-500/10">
                    <p className="text-xs text-rose-400/70 text-center">
                        +{students.length - 5} aluno{students.length - 5 !== 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
}