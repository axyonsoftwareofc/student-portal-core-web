// components/admin/payments/payment-list.tsx
'use client';

import { CreditCard, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/common';
import { PaymentCard } from './payment-card';
import { PaymentTable } from './payment-table';
import { type PaymentWithStudent } from '@/hooks/usePayments';

interface PaymentListProps {
    payments: PaymentWithStudent[];
    allPayments: PaymentWithStudent[];
    isLoading: boolean;
    hasFilters: boolean;
    onMarkPaid: (payment: PaymentWithStudent) => void;
    onEdit: (payment: PaymentWithStudent) => void;
    onCancel: (payment: PaymentWithStudent) => void;
    onDelete: (payment: PaymentWithStudent) => void;
    onCreate: () => void;
}

export function PaymentList({
                                payments,
                                allPayments,
                                isLoading,
                                hasFilters,
                                onMarkPaid,
                                onEdit,
                                onCancel,
                                onDelete,
                                onCreate,
                            }: PaymentListProps) {
    const overduePayments = allPayments.filter((p: PaymentWithStudent) => p.status === 'OVERDUE');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <>
            {/* Alerta de Atrasados */}
            {overduePayments.length > 0 && !hasFilters && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" strokeWidth={1.5} />
                        <div>
                            <p className="font-medium text-rose-400">
                                {overduePayments.length} pagamento{overduePayments.length !== 1 ? 's' : ''} em atraso
                            </p>
                            <p className="mt-1 text-sm text-gray-400">
                                {overduePayments
                                    .slice(0, 3)
                                    .map((p: PaymentWithStudent) => p.student?.name || 'Aluno')
                                    .join(', ')}
                                {overduePayments.length > 3 && ` e mais ${overduePayments.length - 3}`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {payments.length === 0 ? (
                <EmptyState
                    icon={CreditCard}
                    title="Nenhum pagamento encontrado"
                    description={hasFilters ? 'Tente ajustar os filtros' : undefined}
                    action={!hasFilters ? { label: 'Novo Pagamento', onClick: onCreate } : undefined}
                />
            ) : (
                <>
                    {/* Mobile - Cards */}
                    <div className="grid gap-3 lg:hidden">
                        {payments.map((payment: PaymentWithStudent) => (
                            <PaymentCard
                                key={payment.id}
                                payment={payment}
                                onMarkPaid={onMarkPaid}
                                onEdit={onEdit}
                                onCancel={onCancel}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>

                    {/* Desktop - Table */}
                    <div className="hidden lg:block">
                        <PaymentTable
                            payments={payments}
                            onMarkPaid={onMarkPaid}
                            onEdit={onEdit}
                            onCancel={onCancel}
                            onDelete={onDelete}
                        />
                    </div>

                    {/* Contador */}
                    <p className="text-center text-sm text-gray-500">
                        Exibindo {payments.length} pagamento{payments.length !== 1 ? 's' : ''}
                        {hasFilters && ` (filtrado de ${allPayments.length})`}
                    </p>
                </>
            )}
        </>
    );
}