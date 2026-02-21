// utils/exportReports.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
    ReportStats,
    PaymentStatusDistribution,
    StudentReportDetail,
} from '@/hooks/useReports';

// ============================================================
// HELPERS
// ============================================================

function downloadCSV(filename: string, csvContent: string): void {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escapeCSV(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

function formatDateBR(dateString: string | null): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatCurrencyBR(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

function createPDF(title: string, orientation: 'portrait' | 'landscape' = 'portrait'): jsPDF {
    const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const generatedAt = new Date().toLocaleString('pt-BR');

    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Code Plus', 14, 12);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, 20);

    doc.setFontSize(8);
    doc.text(`Gerado em: ${generatedAt}`, pageWidth - 14, 20, { align: 'right' });

    doc.setTextColor(0, 0, 0);

    return doc;
}

function savePDF(doc: jsPDF, filename: string): void {
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ============================================================
// CSV EXPORTS
// ============================================================

export function exportStudentsCSV(studentReports: StudentReportDetail[]): void {
    const headers = [
        'Nome',
        'Email',
        'Status',
        'Aulas Concluídas',
        'Total de Aulas',
        'Progresso (%)',
        'Exercícios Enviados',
        'Média Exercícios',
        'Média Quiz (%)',
        'Última Atividade',
        'Data de Cadastro',
    ];

    const rows = studentReports.map((student: StudentReportDetail) => [
        escapeCSV(student.name),
        escapeCSV(student.email),
        escapeCSV(student.status === 'active' ? 'Ativo' : student.status === 'pending' ? 'Pendente' : 'Suspenso'),
        student.lessonsCompleted,
        student.totalLessons,
        student.progressPercent,
        student.exercisesSubmitted,
        student.exerciseAverage !== null ? student.exerciseAverage.toFixed(1) : '',
        student.quizAverage > 0 ? student.quizAverage : '',
        student.lastActivity ? new Date(student.lastActivity).toLocaleDateString('pt-BR') : '',
        new Date(student.createdAt).toLocaleDateString('pt-BR'),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
    ].join('\n');

    downloadCSV('relatorio_alunos', csvContent);
}

export function exportFinancialCSV(
    stats: ReportStats,
    paymentDistribution: PaymentStatusDistribution[]
): void {
    const headers = ['Métrica', 'Valor'];

    const rows = [
        ['Receita Total (Pago)', `R$ ${stats.totalRevenue.toFixed(2)}`],
        ['Receita Pendente', `R$ ${stats.pendingRevenue.toFixed(2)}`],
        ['Receita Atrasada', `R$ ${stats.overdueRevenue.toFixed(2)}`],
        ['', ''],
        ['Status', 'Quantidade'],
        ...paymentDistribution.map((d: PaymentStatusDistribution) => [d.name, String(d.value)]),
        ['', ''],
        ['Informações Gerais', ''],
        ['Total de Alunos', String(stats.totalStudents)],
        ['Alunos Ativos', String(stats.activeStudents)],
        ['Taxa de Engajamento', `${stats.engagementRate}%`],
    ];

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    downloadCSV('relatorio_financeiro', csvContent);
}

export function exportExercisesCSV(studentReports: StudentReportDetail[]): void {
    const studentsWithExercises = studentReports.filter(
        (s: StudentReportDetail) => s.exercisesSubmitted > 0
    );

    const headers = [
        'Nome',
        'Email',
        'Exercícios Enviados',
        'Média',
        'Status Média',
        'Progresso Geral (%)',
    ];

    const rows = studentsWithExercises.map((student: StudentReportDetail) => {
        const averageStatus = student.exerciseAverage === null
            ? ''
            : student.exerciseAverage >= 7
                ? 'Bom'
                : student.exerciseAverage >= 5
                    ? 'Regular'
                    : 'Precisa de Atenção';

        return [
            escapeCSV(student.name),
            escapeCSV(student.email),
            student.exercisesSubmitted,
            student.exerciseAverage !== null ? student.exerciseAverage.toFixed(1) : '',
            averageStatus,
            student.progressPercent,
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
    ].join('\n');

    downloadCSV('relatorio_exercicios', csvContent);
}

// ============================================================
// PDF EXPORTS
// ============================================================

export function exportStudentsPDF(studentReports: StudentReportDetail[]): void {
    const doc = createPDF('Relatório de Alunos', 'landscape');

    const totalStudents = studentReports.length;
    const activeStudents = studentReports.filter((s: StudentReportDetail) => s.status === 'active').length;
    const avgProgress = totalStudents > 0
        ? Math.round(studentReports.reduce((acc: number, s: StudentReportDetail) => acc + s.progressPercent, 0) / totalStudents)
        : 0;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total: ${totalStudents} alunos  |  Ativos: ${activeStudents}  |  Progresso médio: ${avgProgress}%`, 14, 38);

    const tableData = studentReports.map((student: StudentReportDetail) => {
        const statusLabel = student.status === 'active' ? 'Ativo' : student.status === 'pending' ? 'Pendente' : 'Suspenso';
        const average = student.exerciseAverage !== null ? student.exerciseAverage.toFixed(1) : '—';

        return [
            student.name,
            student.email,
            statusLabel,
            `${student.lessonsCompleted}/${student.totalLessons}`,
            `${student.progressPercent}%`,
            String(student.exercisesSubmitted),
            average,
            formatDateBR(student.lastActivity),
        ];
    });

    autoTable(doc, {
        startY: 44,
        head: [['Nome', 'Email', 'Status', 'Aulas', 'Progresso', 'Exercícios', 'Média', 'Última Atividade']],
        body: tableData,
        styles: {
            fontSize: 8,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [14, 165, 233],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 55 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 22, halign: 'center' },
            5: { cellWidth: 22, halign: 'center' },
            6: { cellWidth: 18, halign: 'center' },
            7: { cellWidth: 30, halign: 'center' },
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                const value = data.cell.raw as string;
                if (value === 'Ativo') {
                    data.cell.styles.textColor = [16, 185, 129];
                    data.cell.styles.fontStyle = 'bold';
                } else if (value === 'Pendente') {
                    data.cell.styles.textColor = [245, 158, 11];
                    data.cell.styles.fontStyle = 'bold';
                } else if (value === 'Suspenso') {
                    data.cell.styles.textColor = [239, 68, 68];
                    data.cell.styles.fontStyle = 'bold';
                }
            }

            if (data.section === 'body' && data.column.index === 6) {
                const value = parseFloat(data.cell.raw as string);
                if (!isNaN(value)) {
                    if (value >= 7) {
                        data.cell.styles.textColor = [16, 185, 129];
                    } else if (value >= 5) {
                        data.cell.styles.textColor = [245, 158, 11];
                    } else {
                        data.cell.styles.textColor = [239, 68, 68];
                    }
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
    });

    savePDF(doc, 'relatorio_alunos');
}

export function exportFinancialPDF(
    stats: ReportStats,
    paymentDistribution: PaymentStatusDistribution[]
): void {
    const doc = createPDF('Relatório Financeiro');

    let currentY = 40;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('Resumo Financeiro', 14, currentY);
    currentY += 10;

    const financialData = [
        ['Receita Total (Recebido)', formatCurrencyBR(stats.totalRevenue)],
        ['Receita Pendente', formatCurrencyBR(stats.pendingRevenue)],
        ['Receita Atrasada', formatCurrencyBR(stats.overdueRevenue)],
    ];

    autoTable(doc, {
        startY: currentY,
        head: [['Métrica', 'Valor']],
        body: financialData,
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: {
            fillColor: [14, 165, 233],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 70, halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
                if (data.row.index === 0) data.cell.styles.textColor = [16, 185, 129];
                if (data.row.index === 1) data.cell.styles.textColor = [245, 158, 11];
                if (data.row.index === 2) data.cell.styles.textColor = [239, 68, 68];
            }
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('Distribuição de Pagamentos', 14, currentY);
    currentY += 10;

    const paymentData = paymentDistribution.map((d: PaymentStatusDistribution) => [
        d.name,
        String(d.value),
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['Status', 'Quantidade']],
        body: paymentData,
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: {
            fillColor: [14, 165, 233],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 70, halign: 'center', fontStyle: 'bold' },
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('Visão Geral da Plataforma', 14, currentY);
    currentY += 10;

    const overviewData = [
        ['Total de Alunos', String(stats.totalStudents)],
        ['Alunos Ativos', String(stats.activeStudents)],
        ['Taxa de Engajamento', `${stats.engagementRate}%`],
        ['Total de Exercícios', String(stats.totalExerciseSubmissions)],
        ['Média da Turma', stats.classAverage !== null ? stats.classAverage.toFixed(1) : '—'],
    ];

    autoTable(doc, {
        startY: currentY,
        head: [['Métrica', 'Valor']],
        body: overviewData,
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: {
            fillColor: [14, 165, 233],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 70, halign: 'center', fontStyle: 'bold' },
        },
    });

    savePDF(doc, 'relatorio_financeiro');
}

export function exportExercisesPDF(studentReports: StudentReportDetail[]): void {
    const doc = createPDF('Relatório de Exercícios', 'landscape');

    const studentsWithExercises = studentReports.filter(
        (s: StudentReportDetail) => s.exercisesSubmitted > 0
    );

    const totalExercises = studentsWithExercises.reduce(
        (acc: number, s: StudentReportDetail) => acc + s.exercisesSubmitted, 0
    );
    const averages = studentsWithExercises
        .filter((s: StudentReportDetail) => s.exerciseAverage !== null)
        .map((s: StudentReportDetail) => s.exerciseAverage as number);
    const globalAverage = averages.length > 0
        ? (averages.reduce((a: number, b: number) => a + b, 0) / averages.length).toFixed(1)
        : '—';

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
        `${studentsWithExercises.length} alunos com exercícios  |  ${totalExercises} exercícios enviados  |  Média geral: ${globalAverage}`,
        14,
        38
    );

    const tableData = studentsWithExercises
        .sort((a: StudentReportDetail, b: StudentReportDetail) =>
            (b.exerciseAverage || 0) - (a.exerciseAverage || 0)
        )
        .map((student: StudentReportDetail, index: number) => {
            const average = student.exerciseAverage !== null ? student.exerciseAverage.toFixed(1) : '—';
            const statusLabel = student.exerciseAverage === null
                ? '—'
                : student.exerciseAverage >= 7
                    ? 'Bom'
                    : student.exerciseAverage >= 5
                        ? 'Regular'
                        : 'Atenção';

            return [
                String(index + 1),
                student.name,
                student.email,
                String(student.exercisesSubmitted),
                average,
                statusLabel,
                `${student.progressPercent}%`,
                formatDateBR(student.lastActivity),
            ];
        });

    autoTable(doc, {
        startY: 44,
        head: [['#', 'Nome', 'Email', 'Exercícios', 'Média', 'Status', 'Progresso', 'Última Atividade']],
        body: tableData,
        styles: {
            fontSize: 8,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [139, 92, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 40 },
            2: { cellWidth: 55 },
            3: { cellWidth: 22, halign: 'center' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 20, halign: 'center' },
            6: { cellWidth: 22, halign: 'center' },
            7: { cellWidth: 30, halign: 'center' },
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const value = parseFloat(data.cell.raw as string);
                if (!isNaN(value)) {
                    if (value >= 7) data.cell.styles.textColor = [16, 185, 129];
                    else if (value >= 5) data.cell.styles.textColor = [245, 158, 11];
                    else data.cell.styles.textColor = [239, 68, 68];
                    data.cell.styles.fontStyle = 'bold';
                }
            }

            if (data.section === 'body' && data.column.index === 5) {
                const value = data.cell.raw as string;
                if (value === 'Bom') data.cell.styles.textColor = [16, 185, 129];
                else if (value === 'Regular') data.cell.styles.textColor = [245, 158, 11];
                else if (value === 'Atenção') data.cell.styles.textColor = [239, 68, 68];
                data.cell.styles.fontStyle = 'bold';
            }
        },
    });

    savePDF(doc, 'relatorio_exercicios');
}