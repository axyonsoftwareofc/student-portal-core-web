// app/(dashboard)/admin/relatorios/page.tsx
'use client';

import { useState } from 'react';
import { useReports } from '@/hooks/useReports';
import { Loader2 } from 'lucide-react';
import { ReportsHeader } from '@/components/admin/reports/ReportsHeader';
import { ReportsStatsCards } from '@/components/admin/reports/ReportsStatsCards';
import { ReportsFinancialCards } from '@/components/admin/reports/ReportsFinancialCards';
import { ReportsCharts } from '@/components/admin/reports/ReportsCharts';
import { ReportsExerciseStats } from '@/components/admin/reports/ReportsExerciseStats';
import { ReportsTopStudents } from '@/components/admin/reports/ReportsTopStudents';
import { ReportsStudentTable } from '@/components/admin/reports/ReportsStudentTable';
import {
    exportStudentsCSV,
    exportFinancialCSV,
    exportExercisesCSV,
    exportStudentsPDF,
    exportFinancialPDF,
    exportExercisesPDF,
} from '@/utils/exportReports';

export default function RelatoriosPage() {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    const {
        stats,
        monthlyData,
        moduleCompletion,
        topStudents,
        studentReports,
        studentDistribution,
        paymentDistribution,
        exerciseDistribution,
        isLoading,
        refetch,
    } = useReports(timeRange);

    return (
        <div className="space-y-6">
            <ReportsHeader
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onRefetch={refetch}
                onExportStudentsCSV={() => exportStudentsCSV(studentReports)}
                onExportFinancialCSV={() => exportFinancialCSV(stats, paymentDistribution)}
                onExportExercisesCSV={() => exportExercisesCSV(studentReports)}
                onExportStudentsPDF={() => exportStudentsPDF(studentReports)}
                onExportFinancialPDF={() => exportFinancialPDF(stats, paymentDistribution)}
                onExportExercisesPDF={() => exportExercisesPDF(studentReports)}
                isLoading={isLoading}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" strokeWidth={1.5} />
                </div>
            ) : (
                <>
                    <ReportsStatsCards stats={stats} />
                    <ReportsCharts
                        monthlyData={monthlyData}
                        moduleCompletion={moduleCompletion}
                        paymentDistribution={paymentDistribution}
                        studentDistribution={studentDistribution}
                    />
                    <ReportsExerciseStats
                        stats={stats}
                        exerciseDistribution={exerciseDistribution}
                    />
                    <ReportsFinancialCards stats={stats} />
                    <ReportsTopStudents topStudents={topStudents} />
                    <ReportsStudentTable studentReports={studentReports} />
                </>
            )}
        </div>
    );
}