// components/admin/payments/payment-list.tsx
import { CreditCard } from "lucide-react";
import { EmptyState } from "@/components/common";
import { PaymentCard } from "./payment-card";
import { PaymentTable } from "./payment-table";
import { type PaymentWithStudent } from "@/hooks/usePayments";

interface PaymentListProps {
    payments: PaymentWithStudent[];
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
                                isLoading,
                                hasFilters,
                                onMarkPaid,
                                onEdit,
                                onCancel,
                                onDelete,
                                onCreate,
                            }: PaymentListProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <EmptyState
                icon={CreditCard}
                title="Nenhum pagamento encontrado"
                description={hasFilters ? "Tente ajustar os filtros" : undefined}
                action={!hasFilters ? { label: "Novo Pagamento", onClick: onCreate } : undefined}
            />
        );
    }

    return (
        <>
            <div className="grid gap-3 lg:hidden">
                {payments.map((payment) => (
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

            <div className="hidden lg:block">
                <PaymentTable
                    payments={payments}
                    onMarkPaid={onMarkPaid}
                    onEdit={onEdit}
                    onCancel={onCancel}
                    onDelete={onDelete}
                />
            </div>
        </>
    );
}