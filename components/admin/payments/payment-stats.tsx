// components/admin/payments/payment-stats.tsx
'use client';

import { DollarSign, Clock, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentStatsData {
    total_pending: number;
    total_overdue: number;
    total_paid: number;
    count_pending: number;
    count_overdue: number;
    count_paid: number;
}

interface PaymentStatsProps {
    stats: PaymentStatsData;
    totalPayments: number;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface StatItemProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    borderColor: string;
    bgColor: string;
    iconBg: string;
    iconColor: string;
    valueColor: string;
}

function StatItem({ title, value, subtitle, icon: Icon, borderColor, bgColor, iconBg, iconColor, valueColor }: StatItemProps) {
    return (
        <div className={cn('flex items-center gap-4 rounded-lg border p-4', borderColor, bgColor)}>
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', iconBg)}>
                <Icon className={cn('h-6 w-6', iconColor)} strokeWidth={1.5} />
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className={cn('text-xl font-bold', valueColor)}>{value}</p>
                <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
        </div>
    );
}

export function PaymentStats({ stats, totalPayments }: PaymentStatsProps) {
    const totalReceivable = stats.total_pending + stats.total_overdue;
    const totalGeneral = stats.total_paid + totalReceivable;
    const delinquencyRate = totalPayments > 0
        ? Math.round((stats.count_overdue / totalPayments) * 100)
        : 0;

    return (
        <div className="space-y-4">
            {/* Cards Principais */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                <StatItem
                    title="Total Geral"
                    value={formatCurrency(totalGeneral)}
                    subtitle={`${totalPayments} pagamentos`}
                    icon={DollarSign}
                    borderColor="border-sky-500/20"
                    bgColor="bg-sky-500/5"
                    iconBg="bg-sky-500/10"
                    iconColor="text-sky-400"
                    valueColor="text-sky-400"
                />
                <StatItem
                    title="Recebido"
                    value={formatCurrency(stats.total_paid)}
                    subtitle={`${stats.count_paid} pagos`}
                    icon={CheckCircle}
                    borderColor="border-emerald-500/20"
                    bgColor="bg-emerald-500/5"
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-400"
                    valueColor="text-emerald-400"
                />
                <StatItem
                    title="Pendente"
                    value={formatCurrency(stats.total_pending)}
                    subtitle={`${stats.count_pending} pendentes`}
                    icon={Clock}
                    borderColor="border-amber-500/20"
                    bgColor="bg-amber-500/5"
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-400"
                    valueColor="text-amber-400"
                />
                <StatItem
                    title="Atrasado"
                    value={formatCurrency(stats.total_overdue)}
                    subtitle={`${stats.count_overdue} atrasados`}
                    icon={AlertTriangle}
                    borderColor="border-rose-500/20"
                    bgColor="bg-rose-500/5"
                    iconBg="bg-rose-500/10"
                    iconColor="text-rose-400"
                    valueColor="text-rose-400"
                />
                <StatItem
                    title="Inadimplência"
                    value={`${delinquencyRate}%`}
                    subtitle={stats.count_overdue > 0 ? `${stats.count_overdue} em atraso` : 'Tudo em dia!'}
                    icon={TrendingDown}
                    borderColor={delinquencyRate > 20 ? 'border-rose-500/20' : delinquencyRate > 0 ? 'border-amber-500/20' : 'border-emerald-500/20'}
                    bgColor={delinquencyRate > 20 ? 'bg-rose-500/5' : delinquencyRate > 0 ? 'bg-amber-500/5' : 'bg-emerald-500/5'}
                    iconBg={delinquencyRate > 20 ? 'bg-rose-500/10' : delinquencyRate > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}
                    iconColor={delinquencyRate > 20 ? 'text-rose-400' : delinquencyRate > 0 ? 'text-amber-400' : 'text-emerald-400'}
                    valueColor={delinquencyRate > 20 ? 'text-rose-400' : delinquencyRate > 0 ? 'text-amber-400' : 'text-emerald-400'}
                />
            </div>
        </div>
    );
}