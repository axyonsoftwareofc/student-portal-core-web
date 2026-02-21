// components/admin/reports/ReportsStudentTable.tsx
'use client';

import { useState } from 'react';
import { Users, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudentReportDetail } from '@/hooks/useReports';

interface ReportsStudentTableProps {
    studentReports: StudentReportDetail[];
}

type SortField = 'name' | 'lessonsCompleted' | 'exerciseAverage' | 'progressPercent';
type SortDirection = 'asc' | 'desc';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    active: { label: 'Ativo', className: 'bg-emerald-500/10 text-emerald-400' },
    pending: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-400' },
    suspended: { label: 'Suspenso', className: 'bg-rose-500/10 text-rose-400' },
};

const formatDate = (dateString: string | null): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

export function ReportsStudentTable({ studentReports }: ReportsStudentTableProps) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortField, setSortField] = useState<SortField>('lessonsCompleted');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const filteredAndSorted = studentReports
        .filter((student: StudentReportDetail) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a: StudentReportDetail, b: StudentReportDetail) => {
            const multiplier = sortDirection === 'asc' ? 1 : -1;
            switch (sortField) {
                case 'name':
                    return multiplier * a.name.localeCompare(b.name);
                case 'lessonsCompleted':
                    return multiplier * (a.lessonsCompleted - b.lessonsCompleted);
                case 'exerciseAverage':
                    return multiplier * ((a.exerciseAverage || 0) - (b.exerciseAverage || 0));
                case 'progressPercent':
                    return multiplier * (a.progressPercent - b.progressPercent);
                default:
                    return 0;
            }
        });

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? (
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
        ) : (
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
        );
    };

    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    <h3 className="text-lg font-semibold text-white">Relatório por Aluno</h3>
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
            {filteredAndSorted.length}
          </span>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" strokeWidth={1.5} />
                    <input
                        type="text"
                        placeholder="Buscar aluno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none sm:w-64"
                    />
                </div>
            </div>

            {filteredAndSorted.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-800">
                            <th
                                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase text-gray-400 hover:text-white"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-1">
                                    Aluno <SortIcon field="name" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-400">
                                Status
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase text-gray-400 hover:text-white"
                                onClick={() => handleSort('progressPercent')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    Progresso <SortIcon field="progressPercent" />
                                </div>
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase text-gray-400 hover:text-white"
                                onClick={() => handleSort('lessonsCompleted')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    Aulas <SortIcon field="lessonsCompleted" />
                                </div>
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase text-gray-400 hover:text-white"
                                onClick={() => handleSort('exerciseAverage')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    Média <SortIcon field="exerciseAverage" />
                                </div>
                            </th>
                            <th className="hidden px-4 py-3 text-center text-xs font-medium uppercase text-gray-400 lg:table-cell">
                                Exercícios
                            </th>
                            <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase text-gray-400 md:table-cell">
                                Última Atividade
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                        {filteredAndSorted.map((student: StudentReportDetail) => {
                            const statusInfo = STATUS_LABELS[student.status] || {
                                label: student.status,
                                className: 'bg-gray-500/10 text-gray-400',
                            };
                            const averageColor = student.exerciseAverage === null
                                ? 'text-gray-500'
                                : student.exerciseAverage >= 7
                                    ? 'text-emerald-400'
                                    : student.exerciseAverage >= 5
                                        ? 'text-amber-400'
                                        : 'text-rose-400';

                            return (
                                <tr key={student.id} className="transition-colors hover:bg-gray-800/30">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-white">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusInfo.className)}>
                        {statusInfo.label}
                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="h-2 w-full max-w-[100px] overflow-hidden rounded-full bg-gray-800">
                                                <div
                                                    className={cn(
                                                        'h-full rounded-full transition-all',
                                                        student.progressPercent >= 80 ? 'bg-emerald-500' :
                                                            student.progressPercent >= 40 ? 'bg-sky-500' :
                                                                'bg-amber-500'
                                                    )}
                                                    style={{ width: `${Math.min(student.progressPercent, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">{student.progressPercent}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="font-medium text-white">{student.lessonsCompleted}</span>
                                        <span className="text-xs text-gray-500">/{student.totalLessons}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                      <span className={cn('font-bold', averageColor)}>
                        {student.exerciseAverage !== null ? student.exerciseAverage.toFixed(1) : '—'}
                      </span>
                                    </td>
                                    <td className="hidden px-4 py-3 text-center lg:table-cell">
                                        <span className="text-sm text-gray-300">{student.exercisesSubmitted}</span>
                                    </td>
                                    <td className="hidden px-4 py-3 text-right md:table-cell">
                                        <span className="text-sm text-gray-500">{formatDate(student.lastActivity)}</span>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-gray-600" strokeWidth={1.5} />
                    <p className="mt-2 text-gray-400">
                        {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                    </p>
                </div>
            )}
        </div>
    );
}