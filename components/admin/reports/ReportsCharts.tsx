// components/admin/reports/ReportsCharts.tsx
'use client';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import type {
    MonthlyData,
    ModuleCompletion,
    PaymentStatusDistribution,
    StudentStatusDistribution,
} from '@/hooks/useReports';

interface ReportsChartsProps {
    monthlyData: MonthlyData[];
    moduleCompletion: ModuleCompletion[];
    paymentDistribution: PaymentStatusDistribution[];
    studentDistribution: StudentStatusDistribution[];
}

const TOOLTIP_STYLE = {
    backgroundColor: '#111827',
    border: '1px solid rgba(55, 65, 81, 0.5)',
    borderRadius: '8px',
    fontSize: '13px',
};

function EmptyChartMessage({ message }: { message: string }) {
    return (
        <div className="flex h-full items-center justify-center text-gray-500">
            {message}
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
            <div className="h-72">{children}</div>
        </div>
    );
}

export function ReportsCharts({
                                  monthlyData,
                                  moduleCompletion,
                                  paymentDistribution,
                                  studentDistribution,
                              }: ReportsChartsProps) {
    const moduleChartData = moduleCompletion.map((m: ModuleCompletion) => ({
        modulo: m.moduleName.length > 15 ? m.moduleName.substring(0, 15) + '...' : m.moduleName,
        concluidos: m.completedByStudents,
        emAndamento: m.studentsInProgress,
    }));

    const hasPaymentData = paymentDistribution.some(
        (d: PaymentStatusDistribution) => d.value > 0
    );
    const hasStudentData = studentDistribution.some(
        (d: StudentStatusDistribution) => d.value > 0
    );

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Evolução Mensal (6 meses)">
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="alunos"
                                    stroke="#0ea5e9"
                                    strokeWidth={2}
                                    dot={{ fill: '#0ea5e9', r: 4 }}
                                    name="Novos Alunos"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="aulasCompletas"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ fill: '#10b981', r: 4 }}
                                    name="Aulas Concluídas"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="exerciciosEnviados"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    dot={{ fill: '#8b5cf6', r: 4 }}
                                    name="Exercícios Enviados"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChartMessage message="Sem dados para exibir" />
                    )}
                </ChartCard>

                <ChartCard title="Status dos Pagamentos">
                    {hasPaymentData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentDistribution.filter(
                                        (d: PaymentStatusDistribution) => d.value > 0
                                    )}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }: { name?: string; value?: number }) =>
                                        `${name || ''}: ${value || 0}`
                                    }
                                    outerRadius="70%"
                                    dataKey="value"
                                    fontSize={12}
                                >
                                    {paymentDistribution
                                        .filter((d: PaymentStatusDistribution) => d.value > 0)
                                        .map((entry: PaymentStatusDistribution, index: number) => (
                                            <Cell key={`payment-${index}`} fill={entry.color} />
                                        ))}
                                </Pie>
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChartMessage message="Sem pagamentos registrados" />
                    )}
                </ChartCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Progresso por Módulo">
                    {moduleChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={moduleChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="modulo" stroke="#6b7280" fontSize={11} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="concluidos" fill="#10b981" name="Concluídos" />
                                <Bar dataKey="emAndamento" fill="#0ea5e9" name="Em Andamento" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChartMessage message="Sem dados de progresso" />
                    )}
                </ChartCard>

                <ChartCard title="Distribuição de Alunos">
                    {hasStudentData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={studentDistribution.filter(
                                        (d: StudentStatusDistribution) => d.value > 0
                                    )}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }: { name?: string; value?: number }) =>
                                        `${name || ''}: ${value || 0}`
                                    }
                                    outerRadius="70%"
                                    dataKey="value"
                                    fontSize={12}
                                >
                                    {studentDistribution
                                        .filter((d: StudentStatusDistribution) => d.value > 0)
                                        .map((entry: StudentStatusDistribution, index: number) => (
                                            <Cell key={`student-${index}`} fill={entry.color} />
                                        ))}
                                </Pie>
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChartMessage message="Sem dados de alunos" />
                    )}
                </ChartCard>
            </div>
        </>
    );
}