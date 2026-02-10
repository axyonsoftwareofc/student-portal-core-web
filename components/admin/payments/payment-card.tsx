// components/admin/payments/payment-card.tsx
import { Calendar, Edit, Trash2, Ban, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type PaymentWithStudent, type PaymentStatus, type PaymentMethod } from "@/hooks/usePayments";

interface PaymentCardProps {
    payment: PaymentWithStudent;
    onMarkPaid: (payment: PaymentWithStudent) => void;
    onEdit: (payment: PaymentWithStudent) => void;
    onCancel: (payment: PaymentWithStudent) => void;
    onDelete: (payment: PaymentWithStudent) => void;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
    PENDING: {
        label: "Pendente",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10 border-amber-500/30",
        icon: Clock,
    },
    PAID: {
        label: "Pago",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10 border-emerald-500/30",
        icon: CheckCircle,
    },
    OVERDUE: {
        label: "Atrasado",
        color: "text-rose-400",
        bgColor: "bg-rose-500/10 border-rose-500/30",
        icon: AlertTriangle,
    },
    CANCELLED: {
        label: "Cancelado",
        color: "text-gray-400",
        bgColor: "bg-gray-500/10 border-gray-500/30",
        icon: XCircle,
    },
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    PIX: "PIX",
    CASH: "Dinheiro",
    TRANSFER: "Transferência",
    CREDIT_CARD: "Cartão de Crédito",
    DEBIT_CARD: "Cartão de Débito",
    OTHER: "Outro",
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR");
};

export function PaymentCard({ payment, onMarkPaid, onEdit, onCancel, onDelete }: PaymentCardProps) {
    const statusConfig = STATUS_CONFIG[payment.status];
    const StatusIcon = statusConfig.icon;
    const canMarkPaid = payment.status === "PENDING" || payment.status === "OVERDUE";
    const canCancel = payment.status !== "CANCELLED" && payment.status !== "PAID";

    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">
                        {payment.student?.name || "Aluno removido"}
                    </p>
                    <p className="text-sm text-gray-400 truncate">{payment.description}</p>
                </div>
                <span
                    className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0",
                        statusConfig.bgColor,
                        statusConfig.color
                    )}
                >
          <StatusIcon className="h-3 w-3" strokeWidth={2} />
                    {statusConfig.label}
        </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="font-semibold text-white">{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Vencimento</p>
                    <p className="text-gray-300">{formatDate(payment.due_date)}</p>
                </div>
            </div>

            {payment.paid_date && (
                <p className="mt-2 text-xs text-emerald-400">
                    Pago em {formatDate(payment.paid_date)}
                    {payment.payment_method && ` via ${PAYMENT_METHOD_LABELS[payment.payment_method]}`}
                </p>
            )}

            <div className="mt-4 flex items-center gap-2 border-t border-gray-800/50 pt-4">
                {canMarkPaid && (
                    <button
                        onClick={() => onMarkPaid(payment)}
                        className="flex-1 rounded-lg bg-emerald-600/20 px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/30"
                    >
                        Marcar Pago
                    </button>
                )}
                <button
                    onClick={() => onEdit(payment)}
                    className="rounded-lg bg-gray-800 p-2 text-gray-400 hover:text-white"
                >
                    <Edit className="h-4 w-4" strokeWidth={1.5} />
                </button>
                {canCancel && (
                    <button
                        onClick={() => onCancel(payment)}
                        className="rounded-lg bg-gray-800 p-2 text-amber-400 hover:text-amber-300"
                    >
                        <Ban className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                )}
                <button
                    onClick={() => onDelete(payment)}
                    className="rounded-lg bg-gray-800 p-2 text-rose-400 hover:text-rose-300"
                >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}