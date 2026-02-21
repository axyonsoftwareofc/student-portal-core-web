// components/admin/reports/ReportsHeader.tsx
'use client';

import {
    BarChart3,
    RefreshCw,
    Loader2,
    Download,
    Users,
    DollarSign,
    FileCheck,
    FileText,
    FileSpreadsheet,
} from 'lucide-react';
import { useState } from 'react';

interface ReportsHeaderProps {
    timeRange: 'week' | 'month' | 'year';
    onTimeRangeChange: (range: 'week' | 'month' | 'year') => void;
    onRefetch: () => void;
    onExportStudentsCSV: () => void;
    onExportFinancialCSV: () => void;
    onExportExercisesCSV: () => void;
    onExportStudentsPDF: () => void;
    onExportFinancialPDF: () => void;
    onExportExercisesPDF: () => void;
    isLoading: boolean;
}

const TIME_RANGE_LABELS = {
    week: 'Semana',
    month: 'Mês',
    year: 'Ano',
} as const;

export function ReportsHeader({
                                  timeRange,
                                  onTimeRangeChange,
                                  onRefetch,
                                  onExportStudentsCSV,
                                  onExportFinancialCSV,
                                  onExportExercisesCSV,
                                  onExportStudentsPDF,
                                  onExportFinancialPDF,
                                  onExportExercisesPDF,
                                  isLoading,
                              }: ReportsHeaderProps) {
    const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                    <BarChart3 className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Relatórios e Análises</h1>
                    <p className="text-sm text-gray-400">
                        Métricas detalhadas e insights sobre a plataforma
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 rounded-lg border border-gray-800/50 bg-gray-900/50 p-1">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => onTimeRangeChange(range)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                timeRange === range
                                    ? 'bg-sky-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {TIME_RANGE_LABELS[range]}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsExportOpen(!isExportOpen)}
                        className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                        <Download className="h-4 w-4" strokeWidth={1.5} />
                        Exportar
                    </button>

                    {isExportOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsExportOpen(false)}
                            />
                            <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-gray-800 bg-gray-900 p-2 shadow-xl">
                                {/* CSV Section */}
                                <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                                    CSV (Excel)
                                </p>
                                <button
                                    onClick={() => { onExportStudentsCSV(); setIsExportOpen(false); }}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                                    Alunos
                                </button>
                                <button
                                    onClick={() => { onExportFinancialCSV(); setIsExportOpen(false); }}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                                    Financeiro
                                </button>
                                <button
                                    onClick={() => { onExportExercisesCSV(); setIsExportOpen(false); }}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                                    Exercícios
                                </button>

                                {/* Separator */}
                                <div className="my-2 border-t border-gray-800" />

                                {/* PDF Section */}
                                <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                                    PDF
                                </p>
                                <button
                                    onClick={() => { onExportStudentsPDF(); setIsExportOpen(false); }}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                                >
                                    <FileText className="h-4 w-4 text-rose-400" strokeWidth={1.5} />
                                    Alunos
                                </button>
                                <button
                                    onClick={() => { onExportFinancialPDF(); setIsExportOpen(false); }}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                                >
                                    <FileText className="h-4 w-4 text-rose-400" strokeWidth={1.5} />
                                    Financeiro
                                </button>
                                <button
                                    onClick={() => { onExportExercisesPDF(); setIsExportOpen(false); }}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                                >
                                    <FileText className="h-4 w-4 text-rose-400" strokeWidth={1.5} />
                                    Exercícios
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={onRefetch}
                    disabled={isLoading}
                    className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                    ) : (
                        <RefreshCw className="h-5 w-5" strokeWidth={1.5} />
                    )}
                </button>
            </div>
        </div>
    );
}