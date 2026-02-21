// components/admin/reports/ReportsFinancialCards.tsx
'use client';

import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { ReportStats } from '@/hooks/useReports';

interface ReportsFinancialCardsProps {
    stats: ReportStats;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export function ReportsFinancialCards({ stats }: ReportsFinancialCardsProps) {
    const financialCards = [
        {
            label: 'Recebido',
            value: formatCurrency(stats.totalRevenue),
            icon: CheckCircle,
            borderColor: 'border-emerald-500/20',
            bgColor: 'bg-emerald-500/5',
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            valueColor: 'text-emerald-400',
        },
        {
            label: 'Pendente',
            value: formatCurrency(stats.pendingRevenue),
            icon: Clock,
            borderColor: 'border-amber-500/20',
            bgColor: 'bg-amber-500/5',
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
            valueColor: 'text-amber-400',
        },
        {
            label: 'Atrasado',
            value: formatCurrency(stats.overdueRevenue),
            icon: AlertTriangle,
            borderColor: 'border-rose-500/20',
            bgColor: 'bg-rose-500/5',
            iconBg: 'bg-rose-500/10',
            iconColor: 'text-rose-400',
            valueColor: 'text-rose-400',
        },
    ] as const;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {financialCards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.label}
                        className={`flex items-center gap-4 rounded-lg border ${card.borderColor} ${card.bgColor} p-4`}
                    >
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.iconBg}`}>
                            <Icon className={`h-6 w-6 ${card.iconColor}`} strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{card.label}</p>
                            <p className={`text-xl font-bold ${card.valueColor}`}>{card.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}