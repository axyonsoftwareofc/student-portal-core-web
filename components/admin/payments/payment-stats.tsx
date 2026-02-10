// components/admin/payments/payment-stats.tsx
import { DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { StatsCard, StatsCardGrid } from "@/components/common";

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
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

export function PaymentStats({ stats }: PaymentStatsProps) {
    return (
        <StatsCardGrid columns={4}>
            <StatsCard
                title="A Receber"
                value={formatCurrency(stats.total_pending + stats.total_overdue)}
                subtitle={`${stats.count_pending + stats.count_overdue} pgtos`}
                icon={DollarSign}
                variant="info"
            />
            <StatsCard
                title="Pendentes"
                value={formatCurrency(stats.total_pending)}
                subtitle={`${stats.count_pending} pgtos`}
                icon={Clock}
                variant="warning"
            />
            <StatsCard
                title="Atrasados"
                value={formatCurrency(stats.total_overdue)}
                subtitle={`${stats.count_overdue} pgtos`}
                icon={AlertTriangle}
                variant="danger"
            />
            <StatsCard
                title="Recebidos"
                value={formatCurrency(stats.total_paid)}
                subtitle={`${stats.count_paid} pgtos`}
                icon={CheckCircle}
                variant="success"
            />
        </StatsCardGrid>
    );
}